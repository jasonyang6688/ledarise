/**
 * API client — wraps the Go/Gin backend.
 * All responses use envelope: { code, message, data }
 * Paginated lists: { code, message, data: { list, total, page, page_size } }
 */

import type { Product, Customer, CustomerDetail, Order, RevenueTrendItem, CountryDist } from './types';
import { stableHairImageFor } from './product-images';

const DEFAULT_API_BASE_URL = 'http://localhost:8080';

declare global {
  interface Window {
    __LEDARISE_CONFIG__?: {
      apiBaseUrl?: string;
    };
  }
}

function normalizeBaseUrl(value: string | undefined): string {
  const baseUrl = value?.trim() || DEFAULT_API_BASE_URL;
  return baseUrl === '/' ? '' : baseUrl.replace(/\/+$/, '');
}

function getApiBaseUrl(): string {
  const runtimeBaseUrl = typeof window !== 'undefined'
    ? window.__LEDARISE_CONFIG__?.apiBaseUrl
    : undefined;

  return normalizeBaseUrl(runtimeBaseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL);
}

// ────────────────────────────────────────────────────────────────
// Error class
// ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly code: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ────────────────────────────────────────────────────────────────
// Raw snake_case shapes coming from the backend
// ────────────────────────────────────────────────────────────────

interface RawProduct {
  id: number;
  sku: string;
  name: string;
  description: string;
  tagline: string;
  price: number;
  original_price: number;
  category: string;
  color: string;
  length: string;
  material: string;
  stock: number;
  status: string;
  tone: string;
  accent: string;
  sales: number;
  rating: number;
  reviews: number;
  features: string; // JSON-encoded []string
  images?: Array<{ id: number; url: string; sort_order: number }>;
}

interface RawCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  // computed by ListCustomers
  orders?: number;
  total?: number;
  last_order?: string;
  addresses?: Array<{
    id: number;
    address_line: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    is_default: boolean;
  }>;
}

interface RawOrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  sku: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  product?: RawProduct;
}

interface RawOrder {
  id: number;
  order_no: string;
  customer_id: number | null;
  status: string;
  subtotal: number;
  shipping_amount: number;
  discount: number;
  grand_total: number;
  shipping_method: string;
  coupon_code: string;
  note: string;
  ship_name: string;
  ship_phone: string;
  ship_address: string;
  ship_city: string;
  ship_state: string;
  ship_zip: string;
  ship_country: string;
  purchased_at: string | null;
  created_at: string;
  updated_at: string;
  customer?: RawCustomer;
  order_items?: RawOrderItem[];
}

interface RawCustomerDetail {
  customer: RawCustomer;
  orders: RawOrder[];
}

interface RawStats {
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  total_skus: number;
  avg_order: number;
  orders_today: number;
  revenue_today: number;
  shipping_revenue: number;
  items_shipped: number;
}

interface RawRevenueTrend {
  date: string;
  total: number;
  us: number;
  uk: number;
  de: number;
  orders: number;
  shipping: number;
}

interface RawCountryDist {
  code: string;
  name: string;
  flag: string;
  orders: number;
  revenue: number;
  share: number;
}

// ────────────────────────────────────────────────────────────────
// Flag helper
// ────────────────────────────────────────────────────────────────

export function flagFor(country: string): string {
  if (!country) return '🌐';
  const lower = country.toLowerCase();
  if (lower.includes('united states') || lower.includes('usa') || lower === 'us') return '🇺🇸';
  if (lower.includes('united kingdom') || lower === 'uk' || lower === 'gb') return '🇬🇧';
  if (lower.includes('germany') || lower === 'de') return '🇩🇪';
  return '🌐';
}

// ────────────────────────────────────────────────────────────────
// Mappers: snake_case → camelCase
// ────────────────────────────────────────────────────────────────

export function mapProduct(raw: RawProduct): Product {
  let features: string[] = [];
  if (typeof raw.features === 'string' && raw.features) {
    try {
      features = JSON.parse(raw.features) as string[];
    } catch {
      features = [];
    }
  } else if (Array.isArray(raw.features)) {
    features = raw.features as string[];
  }

  const images =
    raw.images && raw.images.length > 0
      ? raw.images
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((image) => ({
            id: image.id,
            url: image.url,
            sortOrder: image.sort_order,
          }))
      : [stableHairImageFor(raw.sku || raw.id)];

  return {
    id: raw.id,
    sku: raw.sku,
    name: raw.name,
    description: raw.description ?? '',
    tagline: raw.tagline ?? '',
    price: raw.price,
    originalPrice: raw.original_price,
    category: raw.category ?? '',
    color: raw.color ?? '',
    length: raw.length ?? '',
    material: raw.material ?? '',
    stock: raw.stock,
    status: raw.status,
    tone: raw.tone ?? '#3a2a1f',
    accent: raw.accent ?? '#b8895c',
    sales: raw.sales,
    rating: raw.rating,
    reviews: raw.reviews,
    features,
    images,
  };
}

export function mapCustomer(raw: RawCustomer): Customer {
  const city =
    raw.addresses?.find((a) => a.is_default)?.city ??
    raw.addresses?.[0]?.city ??
    '';

  return {
    id: raw.id,
    name: raw.name,
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    country: raw.country ?? '',
    flag: flagFor(raw.country),
    orders: raw.orders ?? 0,
    total: raw.total ?? 0,
    lastOrder: raw.last_order ?? '',
    city,
  };
}

function buildShipAddress(raw: RawOrder): string {
  const parts = [
    raw.ship_address,
    raw.ship_city,
    raw.ship_state,
    raw.ship_zip,
  ].filter(Boolean);
  return parts.join(', ');
}

export function mapOrder(raw: RawOrder): Order {
  const items = (raw.order_items ?? []).map((ri) => ({
    product: ri.product
      ? mapProduct(ri.product)
      : ({
          id: ri.product_id ?? 0,
          sku: ri.sku,
          name: ri.product_name,
          price: ri.price,
          originalPrice: ri.price,
          category: '',
          color: '',
          length: '',
          material: '',
          stock: 0,
          status: '',
          tone: '#3a2a1f',
          accent: '#b8895c',
          tagline: '',
          description: '',
          sales: 0,
          rating: 0,
          reviews: 0,
          features: [],
        } as Product),
    qty: ri.quantity,
    subtotal: ri.subtotal,
  }));

  const customer: Customer = raw.customer
    ? mapCustomer(raw.customer)
    : {
        id: raw.customer_id ?? 0,
        name: raw.ship_name ?? '',
        email: '',
        phone: raw.ship_phone ?? '',
        country: raw.ship_country ?? '',
        flag: flagFor(raw.ship_country),
        orders: 0,
        total: 0,
        lastOrder: '',
        city: raw.ship_city ?? '',
      };

  const dateStr = raw.purchased_at
    ? raw.purchased_at.slice(0, 10)
    : raw.created_at?.slice(0, 10) ?? '';

  return {
    id: raw.id,
    orderNo: raw.order_no,
    customer,
    items,
    subtotal: raw.subtotal,
    shipping: raw.shipping_amount,
    discount: raw.discount,
    total: raw.grand_total,
    status: raw.status,
    shippingMethod: raw.shipping_method ?? '',
    date: dateStr,
    shipAddress: buildShipAddress(raw),
  };
}

function mapCustomerDetail(raw: RawCustomerDetail): CustomerDetail {
  const orders = (raw.orders ?? []).map(mapOrder);
  const orderTotal = orders.reduce((sum, order) => sum + order.total, 0);
  const lastOrder = orders[0]?.date ?? '';

  return {
    customer: {
      ...mapCustomer(raw.customer),
      orders: orders.length,
      total: orderTotal,
      lastOrder,
    },
    orders,
  };
}

// ────────────────────────────────────────────────────────────────
// Core fetch helper
// ────────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  opts: RequestInit = {},
): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && opts.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(opts.headers as Record<string, string>),
  };

  if (typeof window !== 'undefined') {
    const isCustomer = path.startsWith('/api/v1/customer');
    const token = localStorage.getItem(isCustomer ? 'ledarise.customer_token' : 'ledarise.token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${getApiBaseUrl()}${path}`;
  let response: Response;
  try {
    response = await fetch(url, { ...opts, headers });
  } catch (err) {
    throw new ApiError(0, err instanceof Error ? err.message : 'Network error');
  }

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      const isCustomer = path.startsWith('/api/v1/customer');
      if (isCustomer) {
        localStorage.removeItem('ledarise.customer_token');
      } else {
        localStorage.removeItem('ledarise.token');
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }
      }
    }
    throw new ApiError(401, 'Unauthorized');
  }

  let json: { code: number; message: string; data: T };
  try {
    json = await response.json();
  } catch {
    throw new ApiError(response.status, `HTTP ${response.status}`);
  }

  if (json.code !== 200) {
    throw new ApiError(json.code, json.message ?? 'Unknown error');
  }

  return json.data;
}

// ────────────────────────────────────────────────────────────────
// Paginated response helper
// ────────────────────────────────────────────────────────────────

interface PagedData<T> {
  list: T[];
  total: number;
  page: number;
  page_size: number;
}

function qs(params: Record<string, string | number | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') p.set(k, String(v));
  }
  const str = p.toString();
  return str ? `?${str}` : '';
}

// ────────────────────────────────────────────────────────────────
// Param types for list endpoints
// ────────────────────────────────────────────────────────────────

export interface ProductListParams {
  page?: number;
  page_size?: number;
  category?: string;
  color?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
  keyword?: string;
  status?: string;
}

export interface OrderListParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  status?: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  sort?: string;
}

export interface CustomerListParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  country?: string;
}

// ────────────────────────────────────────────────────────────────
// Paged result type
// ────────────────────────────────────────────────────────────────

export interface PagedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ────────────────────────────────────────────────────────────────
// Order create body
// ────────────────────────────────────────────────────────────────

export interface OrderCreateBody {
  ship_name: string;
  ship_phone: string;
  ship_address: string;
  ship_city: string;
  ship_state: string;
  ship_zip: string;
  ship_country: string;
  shipping_method: string;
  items: Array<{ product_id?: number; sku: string; product_name: string; price: number; quantity: number }>;
}

// ────────────────────────────────────────────────────────────────
// Dashboard stats type returned from backend
// ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalSkus: number;
  avgOrder: number;
  ordersToday: number;
  revenueToday: number;
  shippingRevenue: number;
  itemsShipped: number;
}

function mapStats(raw: RawStats): DashboardStats {
  return {
    totalOrders: raw.total_orders,
    totalRevenue: raw.total_revenue,
    totalCustomers: raw.total_customers,
    totalSkus: raw.total_skus,
    avgOrder: raw.avg_order,
    ordersToday: raw.orders_today,
    revenueToday: raw.revenue_today,
    shippingRevenue: raw.shipping_revenue,
    itemsShipped: raw.items_shipped,
  };
}

// ────────────────────────────────────────────────────────────────
// Exported API object
// ────────────────────────────────────────────────────────────────

export const api = {
  // ── Auth ──────────────────────────────────────────────────────
  auth: {
    async login(email: string, password: string): Promise<{ token: string; user: { id: number; username: string; email: string; role: string } }> {
      return request('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    async me(): Promise<{ id: number; username: string; email: string; role: string }> {
      return request('/api/admin/me');
    },
  },

  // ── Customer Auth (storefront) ────────────────────────────────
  customer: {
    async register(payload: { name: string; email: string; password: string; phone?: string }): Promise<{ token: string; user: { id: number; name: string; email: string; phone: string; country: string; role: string } }> {
      return request('/api/v1/customer/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    async login(email: string, password: string): Promise<{ token: string; user: { id: number; name: string; email: string; phone: string; country: string; role: string } }> {
      return request('/api/v1/customer/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    async me(): Promise<{ id: number; name: string; email: string; phone: string; country: string; role: string }> {
      return request('/api/v1/customer/me');
    },
  },

  // ── Public Products ───────────────────────────────────────────
  publicProducts: {
    async list(params: ProductListParams = {}): Promise<PagedResult<Product>> {
      const data = await request<PagedData<RawProduct>>(
        `/api/v1/products${qs(params as Record<string, string | number | undefined>)}`,
      );
      return {
        list: data.list.map(mapProduct),
        total: data.total,
        page: data.page,
        pageSize: data.page_size,
      };
    },
    async get(id: number | string): Promise<Product> {
      const data = await request<RawProduct>(`/api/v1/products/${id}`);
      return mapProduct(data);
    },
  },

  // ── Public Orders ─────────────────────────────────────────────
  publicOrders: {
    async create(body: OrderCreateBody): Promise<Order> {
      const data = await request<RawOrder>('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return mapOrder(data);
    },
    async getByNo(no: string): Promise<Order> {
      const data = await request<RawOrder>(`/api/v1/orders/${no}`);
      return mapOrder(data);
    },
  },

  // ── Admin Products ────────────────────────────────────────────
  products: {
    async list(params: ProductListParams = {}): Promise<PagedResult<Product>> {
      const data = await request<PagedData<RawProduct>>(
        `/api/admin/products${qs(params as Record<string, string | number | undefined>)}`,
      );
      return {
        list: data.list.map(mapProduct),
        total: data.total,
        page: data.page,
        pageSize: data.page_size,
      };
    },
    async get(id: number | string): Promise<Product> {
      const data = await request<RawProduct>(`/api/admin/products/${id}`);
      return mapProduct(data);
    },
    async create(body: Partial<RawProduct>): Promise<Product> {
      const data = await request<RawProduct>('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return mapProduct(data);
    },
    async update(id: number | string, body: Partial<RawProduct>): Promise<Product> {
      const data = await request<RawProduct>(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return mapProduct(data);
    },
    async remove(id: number | string): Promise<void> {
      await request<null>(`/api/admin/products/${id}`, { method: 'DELETE' });
    },
  },

  // ── Admin Orders ──────────────────────────────────────────────
  orders: {
    async list(params: OrderListParams = {}): Promise<PagedResult<Order>> {
      const data = await request<PagedData<RawOrder>>(
        `/api/admin/orders${qs(params as Record<string, string | number | undefined>)}`,
      );
      return {
        list: data.list.map(mapOrder),
        total: data.total,
        page: data.page,
        pageSize: data.page_size,
      };
    },
    async get(id: number | string): Promise<Order> {
      const data = await request<RawOrder>(`/api/admin/orders/${id}`);
      return mapOrder(data);
    },
    async updateStatus(id: number | string, status: string): Promise<Order> {
      const data = await request<RawOrder>(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      return mapOrder(data);
    },
    async updateNote(id: number | string, note: string): Promise<Order> {
      const data = await request<RawOrder>(`/api/admin/orders/${id}/note`, {
        method: 'PUT',
        body: JSON.stringify({ note }),
      });
      return mapOrder(data);
    },
  },

  // ── Admin Customers ───────────────────────────────────────────
  customers: {
    async list(params: CustomerListParams = {}): Promise<PagedResult<Customer>> {
      const data = await request<PagedData<RawCustomer>>(
        `/api/admin/customers${qs(params as Record<string, string | number | undefined>)}`,
      );
      return {
        list: data.list.map(mapCustomer),
        total: data.total,
        page: data.page,
        pageSize: data.page_size,
      };
    },
    async get(id: number | string): Promise<CustomerDetail> {
      const data = await request<RawCustomerDetail>(`/api/admin/customers/${id}`);
      return mapCustomerDetail(data);
    },
    async update(id: number | string, body: Partial<RawCustomer>): Promise<Customer> {
      const data = await request<RawCustomer>(`/api/admin/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return mapCustomer(data);
    },
  },

  // ── Dashboard ─────────────────────────────────────────────────
  dashboard: {
    async stats(): Promise<DashboardStats> {
      const data = await request<RawStats>('/api/admin/dashboard/stats');
      return mapStats(data);
    },
    async revenueTrend(days = 30): Promise<RevenueTrendItem[]> {
      const data = await request<RawRevenueTrend[]>(
        `/api/admin/dashboard/revenue-trend?days=${days}`,
      );
      return data.map((d) => ({
        date: d.date,
        total: d.total,
        us: d.us,
        uk: d.uk,
        de: d.de,
        orders: d.orders,
        shipping: d.shipping,
      }));
    },
    async countryDist(): Promise<CountryDist[]> {
      const data = await request<RawCountryDist[]>('/api/admin/dashboard/country-dist');
      return data.map((d) => ({
        code: d.code,
        name: d.name,
        flag: d.flag || flagFor(d.name),
        orders: d.orders,
        revenue: d.revenue,
        share: d.share,
      }));
    },
    async recentOrders(): Promise<Order[]> {
      const data = await request<RawOrder[]>('/api/admin/dashboard/recent-orders');
      return data.map(mapOrder);
    },
  },

  // ── Import (Excel) ────────────────────────────────────────────
  imports: {
    async start(file: File): Promise<{ taskId: string }> {
      const fd = new FormData();
      fd.append('file', file);
      const data = await request<{ task_id: string }>('/api/admin/orders/import', {
        method: 'POST',
        body: fd,
      });
      return { taskId: data.task_id };
    },
    async status(taskId: string): Promise<ImportProgress> {
      const data = await request<RawImportProgress>(`/api/admin/orders/import/${taskId}`);
      return {
        taskId: data.task_id,
        status: data.status,
        totalRows: data.total_rows,
        processedRows: data.processed_rows,
        importedOrders: data.imported_orders,
        importedCustomers: data.imported_customers,
        importedProducts: data.imported_products,
        skippedRows: data.skipped_rows,
        errors: data.errors ?? [],
        errorMessage: data.error_message,
      };
    },
  },
};

// ── Import types ────────────────────────────────────────────────
interface RawImportProgress {
  task_id: string;
  status: string;
  total_rows: number;
  processed_rows: number;
  imported_orders: number;
  imported_customers: number;
  imported_products: number;
  skipped_rows: number;
  errors: Array<{ row: number; reason: string }>;
  error_message?: string;
}

export interface ImportProgress {
  taskId: string;
  status: string; // pending | running | completed | failed
  totalRows: number;
  processedRows: number;
  importedOrders: number;
  importedCustomers: number;
  importedProducts: number;
  skippedRows: number;
  errors: Array<{ row: number; reason: string }>;
  errorMessage?: string;
}

// Re-export Stats type alias for pages that use DashboardStats as Stats
export type { DashboardStats as ApiStats };
