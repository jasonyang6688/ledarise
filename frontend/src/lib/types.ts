import type { ProductImage } from './product-images';

export interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  color: string;
  length: string;
  material: string;
  stock: number;
  status: string;
  tone: string;
  accent: string;
  tagline: string;
  description: string;
  sales: number;
  rating: number;
  reviews: number;
  features: string[];
  images?: ProductImage[];
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  flag: string;
  orders: number;
  total: number;
  lastOrder: string;
  city: string;
}

export interface OrderItem {
  product: Product;
  qty: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNo: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: string;
  shippingMethod: string;
  date: string;
  shipAddress: string;
}

export interface CustomerDetail {
  customer: Customer;
  orders: Order[];
}

export interface RevenueTrendItem {
  date: string;
  total: number;
  us: number;
  uk: number;
  de: number;
  orders: number;
  shipping: number;
}

export interface CountryDist {
  code: string;
  name: string;
  flag: string;
  orders: number;
  revenue: number;
  share: number;
}

export interface TopSku {
  sku: string;
  name: string;
  qty: number;
  revenue: number;
  tone: string;
  accent: string;
}

export interface Stats {
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

export interface LedariseData {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  revenueTrend: RevenueTrendItem[];
  countryDist: CountryDist[];
  topSkus: TopSku[];
  COLORS: string[];
  LENGTHS: string[];
  MATERIALS: string[];
  CATEGORIES: string[];
  STATUSES: string[];
  stats: Stats;
}

export interface CartItem {
  product: Product;
  qty: number;
}
