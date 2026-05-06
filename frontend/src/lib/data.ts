import type { LedariseData, Product, Customer, Order, RevenueTrendItem, CountryDist, TopSku } from './types';

const COLORS = ['Natural Black', 'Dark Brown', 'Medium Brown', 'Ash Blonde', 'Honey Blonde', 'Salt & Pepper', 'Silver Gray'];
const LENGTHS = ['4 inch', '6 inch', '8 inch', '10 inch', '12 inch'];
const MATERIALS = ['Swiss Lace', 'French Lace', 'Mono Top', 'Skin Base', 'Full Lace'];
const CATEGORIES = ['Short', 'Medium', 'Long', 'Curly', 'Gray', 'Toupee'];

const products: Product[] = [
  {
    id: 1, sku: 'EBP-1208', name: 'Edinburgh Hand-Tied Toupee',
    price: 289, originalPrice: 349, category: 'Toupee', color: 'Dark Brown', length: '6 inch', material: 'Swiss Lace',
    stock: 24, status: 'Published', tone: '#3a2a1f', accent: '#a07b51',
    tagline: 'Ultra-thin Swiss lace with a hand-tied front hairline.',
    description: 'A 0.03mm Swiss lace base with single-knot hand-tied front knots produces a parting indistinguishable from natural scalp. Density grades from 90% at the crown down to 70% at the hairline for a lived-in look.',
    sales: 412, rating: 4.9, reviews: 187,
    features: ['100% Hand-Tied', 'Natural Hairline', 'Breathable Cap', '6-Month Guarantee'],
  },
  {
    id: 2, sku: 'BRIGHT-09', name: 'Brighton Mono Top System',
    price: 339, originalPrice: 399, category: 'Medium', color: 'Medium Brown', length: '8 inch', material: 'Mono Top',
    stock: 18, status: 'Published', tone: '#2c1f17', accent: '#c89865',
    tagline: 'Reinforced mono-top base built for daily wear.',
    description: 'A reinforced fine-mono crown gives Brighton its durability — the kind of system you can wear, swim, and sleep in for six months without thinning.',
    sales: 358, rating: 4.8, reviews: 142,
    features: ['Mono Top', 'Polyurethane Perimeter', 'Tape-Friendly', '180% Density'],
  },
  {
    id: 3, sku: 'HOLLY-22', name: 'Hollywood Full Lace',
    price: 549, originalPrice: 649, category: 'Long', color: 'Natural Black', length: '10 inch', material: 'Full Lace',
    stock: 9, status: 'Published', tone: '#1a1410', accent: '#d4a574',
    tagline: 'Full lace cap, multi-direction parting, runway-grade.',
    description: 'Built for editorial shoots and on-camera work. The full lace cap allows multi-direction parting, the 10-inch indian remy strands handle styling heat without fiber stress.',
    sales: 198, rating: 5.0, reviews: 88,
    features: ['Full Lace Cap', 'Indian Remy', 'Multi-Direction Parting', 'Heat Stylable'],
  },
  {
    id: 4, sku: 'HS-04', name: 'Heritage Salt & Pepper',
    price: 269, originalPrice: 329, category: 'Gray', color: 'Salt & Pepper', length: '6 inch', material: 'French Lace',
    stock: 31, status: 'Published', tone: '#3d3833', accent: '#bfb4a3',
    tagline: 'Distinguished gray blend for the considered gentleman.',
    description: 'A 60/40 salt-and-pepper blend hand-mixed at the root. Built for men who want presence without pretense.',
    sales: 287, rating: 4.7, reviews: 116,
    features: ['Hand-Blended Color', 'French Lace Front', 'Skin Perimeter', 'Easy Maintenance'],
  },
  {
    id: 5, sku: 'EBP-1404', name: 'Cambridge Skin Base',
    price: 219, originalPrice: 269, category: 'Short', color: 'Dark Brown', length: '4 inch', material: 'Skin Base',
    stock: 42, status: 'Published', tone: '#2e2018', accent: '#b8895c',
    tagline: 'Ultra-thin skin base — the most discreet system we make.',
    description: 'A 0.06mm transparent polyurethane base disappears against the scalp. Engineered for active men who refuse compromise on natural appearance.',
    sales: 521, rating: 4.8, reviews: 234,
    features: ['0.06mm Skin', 'Invisible Edge', 'Sweat Resistant', 'Tape Compatible'],
  },
  {
    id: 6, sku: 'BRIGHT-15', name: 'Mayfair Lace Front',
    price: 389, originalPrice: 449, category: 'Medium', color: 'Honey Blonde', length: '8 inch', material: 'Swiss Lace',
    stock: 12, status: 'Published', tone: '#3d2e20', accent: '#d6b07e',
    tagline: 'Honey-blonde lace front with hand-tied knots throughout.',
    description: 'Each knot is single-tied by hand for a parting that holds up under bright light and close inspection. The honey blonde is a custom warm blend developed for Western complexions.',
    sales: 156, rating: 4.9, reviews: 73,
    features: ['Single-Knot', 'Hand-Tied', 'Custom Color', 'Light Density'],
  },
  {
    id: 7, sku: 'HS-09', name: 'Westminster Curly',
    price: 319, originalPrice: 379, category: 'Curly', color: 'Natural Black', length: '6 inch', material: 'Mono Top',
    stock: 16, status: 'Published', tone: '#1f1812', accent: '#a87a4f',
    tagline: 'A natural curl pattern, hand-set at the root.',
    description: 'Curl memory is hand-set at the root and locked with a steam treatment. Holds its shape through humidity, sweat, and a full day of meetings.',
    sales: 144, rating: 4.7, reviews: 61,
    features: ['Curl Memory', 'Hand-Set', 'Mono Crown', 'Humidity Resistant'],
  },
  {
    id: 8, sku: 'HOLLY-31', name: 'Manhattan Toupee',
    price: 459, originalPrice: 529, category: 'Toupee', color: 'Ash Blonde', length: '6 inch', material: 'Swiss Lace',
    stock: 7, status: 'Published', tone: '#2a2218', accent: '#c4a57f',
    tagline: 'Ash blonde with a bleached-knot front for invisible parting.',
    description: 'Bleached front knots make the parting visually disappear at any angle. The ash-blonde tone is engineered to neither yellow nor brass under fluorescent light.',
    sales: 198, rating: 4.9, reviews: 92,
    features: ['Bleached Knots', 'Color Stable', 'Swiss Lace', 'Invisible Parting'],
  },
  {
    id: 9, sku: 'EBP-1801', name: 'Oxford Standard',
    price: 189, originalPrice: 229, category: 'Short', color: 'Medium Brown', length: '4 inch', material: 'Mono Top',
    stock: 58, status: 'Published', tone: '#332518', accent: '#a87a4f',
    tagline: 'The starter system — entry price, professional finish.',
    description: 'Our most accessible system without compromising the hand-tied front. Indian Remy throughout, mono crown, six-month wear life.',
    sales: 642, rating: 4.6, reviews: 298,
    features: ['Indian Remy', 'Mono Crown', '6-Month Life', 'Tape & Bond Compatible'],
  },
  {
    id: 10, sku: 'HS-12', name: 'Knightsbridge Silver',
    price: 309, originalPrice: 369, category: 'Gray', color: 'Silver Gray', length: '6 inch', material: 'French Lace',
    stock: 14, status: 'Published', tone: '#3a3835', accent: '#c8c2b6',
    tagline: 'Pure silver-gray, hand-blended without dye.',
    description: 'A no-dye silver gray achieved through selective sourcing rather than chemical bleaching. Color will not fade or shift to yellow over its wear life.',
    sales: 167, rating: 4.9, reviews: 84,
    features: ['No-Dye Color', 'French Lace', 'Color Permanent', 'Hand-Blended'],
  },
  {
    id: 11, sku: 'BRIGHT-22', name: 'Chelsea Lace Top',
    price: 369, originalPrice: 429, category: 'Medium', color: 'Dark Brown', length: '8 inch', material: 'Swiss Lace',
    stock: 21, status: 'Published', tone: '#241a13', accent: '#b8895c',
    tagline: 'A full lace top, perimeter-reinforced for daily wear.',
    description: 'The lace top extends across the entire crown for maximum styling freedom — comb back, side part, or wear it forward without exposing the base.',
    sales: 234, rating: 4.8, reviews: 117,
    features: ['Lace Top', 'Reinforced Edge', 'Style-Free', '180% Density'],
  },
  {
    id: 12, sku: 'HOLLY-44', name: 'Park Avenue Long',
    price: 599, originalPrice: 699, category: 'Long', color: 'Dark Brown', length: '12 inch', material: 'Full Lace',
    stock: 5, status: 'Published', tone: '#1f1611', accent: '#c89865',
    tagline: '12-inch full lace, our longest standard system.',
    description: 'A full 12 inches of European-textured Indian Remy, hand-tied across a Swiss lace cap. Built for men who want length without the wig look.',
    sales: 89, rating: 5.0, reviews: 41,
    features: ['12-inch Length', 'Full Lace', 'European Texture', 'Multi-Style'],
  },
];

const customers: Customer[] = [
  { id: 1, name: 'David Van Buren', email: 'd.vanburen@example.com', phone: '+1 778-228-2828', country: 'United States', flag: '🇺🇸', orders: 7, total: 2143.50, lastOrder: '2026-04-22', city: 'Griffin, GA' },
  { id: 2, name: 'Marcus Holloway', email: 'm.holloway@example.com', phone: '+1 415-552-9001', country: 'United States', flag: '🇺🇸', orders: 4, total: 1289.00, lastOrder: '2026-04-19', city: 'San Francisco, CA' },
  { id: 3, name: 'James Whitfield', email: 'james.w@example.com', phone: '+44 20 7946 0521', country: 'United Kingdom', flag: '🇬🇧', orders: 12, total: 4287.30, lastOrder: '2026-04-26', city: 'London' },
  { id: 4, name: 'Klaus Brenner', email: 'k.brenner@example.de', phone: '+49 30 8765 4321', country: 'Germany', flag: '🇩🇪', orders: 3, total: 989.00, lastOrder: '2026-04-15', city: 'Berlin' },
  { id: 5, name: 'Robert McKenzie', email: 'r.mckenzie@example.com', phone: '+1 312-808-1144', country: 'United States', flag: '🇺🇸', orders: 9, total: 3122.40, lastOrder: '2026-04-25', city: 'Chicago, IL' },
  { id: 6, name: 'William Ashford', email: 'w.ashford@example.co.uk', phone: '+44 161 882 4421', country: 'United Kingdom', flag: '🇬🇧', orders: 5, total: 1798.20, lastOrder: '2026-04-18', city: 'Manchester' },
  { id: 7, name: 'Henrik Mueller', email: 'h.mueller@example.de', phone: '+49 89 4421 0098', country: 'Germany', flag: '🇩🇪', orders: 2, total: 658.00, lastOrder: '2026-04-12', city: 'Munich' },
  { id: 8, name: 'Thomas Reinhardt', email: 't.reinhardt@example.com', phone: '+1 212-554-7799', country: 'United States', flag: '🇺🇸', orders: 6, total: 2018.50, lastOrder: '2026-04-21', city: 'New York, NY' },
  { id: 9, name: 'Edward Pemberton', email: 'e.pem@example.co.uk', phone: '+44 117 909 1212', country: 'United Kingdom', flag: '🇬🇧', orders: 8, total: 2891.00, lastOrder: '2026-04-24', city: 'Bristol' },
  { id: 10, name: 'Charles Henderson', email: 'c.h@example.com', phone: '+1 503-222-9889', country: 'United States', flag: '🇺🇸', orders: 4, total: 1421.00, lastOrder: '2026-04-17', city: 'Portland, OR' },
  { id: 11, name: 'Sebastian Vogel', email: 's.vogel@example.de', phone: '+49 40 7654 3322', country: 'Germany', flag: '🇩🇪', orders: 5, total: 1689.50, lastOrder: '2026-04-20', city: 'Hamburg' },
  { id: 12, name: 'Frank Donovan', email: 'f.donovan@example.com', phone: '+1 617-441-2287', country: 'United States', flag: '🇺🇸', orders: 11, total: 3892.20, lastOrder: '2026-04-27', city: 'Boston, MA' },
];

const STATUSES = ['complete', 'processing', 'pending', 'cancelled'];

const orderSeeds = [
  { no: 'PO000418277', cust: 0, items: [[0,1]] as [number,number][], sub: 289, ship: 25, status: 'complete', date: '2026-04-22' },
  { no: 'PO000418421', cust: 2, items: [[2,1],[5,1]] as [number,number][], sub: 938, ship: 45, status: 'complete', date: '2026-04-21' },
  { no: 'PO000418502', cust: 4, items: [[8,2]] as [number,number][], sub: 378, ship: 25, status: 'processing', date: '2026-04-25' },
  { no: 'PO000418517', cust: 11, items: [[11,1]] as [number,number][], sub: 599, ship: 45, status: 'complete', date: '2026-04-26' },
  { no: 'PO000418601', cust: 3, items: [[3,1]] as [number,number][], sub: 269, ship: 25, status: 'complete', date: '2026-04-15' },
  { no: 'PO000418645', cust: 8, items: [[6,1],[1,1]] as [number,number][], sub: 658, ship: 25, status: 'complete', date: '2026-04-23' },
  { no: 'PO000418709', cust: 5, items: [[4,1]] as [number,number][], sub: 219, ship: 25, status: 'pending', date: '2026-04-27' },
  { no: 'PO000418815', cust: 1, items: [[7,1]] as [number,number][], sub: 459, ship: 45, status: 'processing', date: '2026-04-26' },
  { no: 'PO000418892', cust: 6, items: [[3,1]] as [number,number][], sub: 269, ship: 25, status: 'complete', date: '2026-04-12' },
  { no: 'PO000418951', cust: 9, items: [[0,1],[8,1]] as [number,number][], sub: 478, ship: 25, status: 'complete', date: '2026-04-17' },
  { no: 'PO000419023', cust: 7, items: [[5,1]] as [number,number][], sub: 389, ship: 45, status: 'complete', date: '2026-04-20' },
  { no: 'PO000419088', cust: 10, items: [[9,1]] as [number,number][], sub: 309, ship: 25, status: 'cancelled', date: '2026-04-19' },
  { no: 'PO000419145', cust: 11, items: [[2,1],[11,1]] as [number,number][], sub: 1148, ship: 45, status: 'processing', date: '2026-04-27' },
  { no: 'PO000419201', cust: 0, items: [[10,1]] as [number,number][], sub: 369, ship: 25, status: 'complete', date: '2026-04-25' },
  { no: 'PO000419244', cust: 8, items: [[1,1]] as [number,number][], sub: 339, ship: 25, status: 'pending', date: '2026-04-28' },
];

const streetNames = ['Country Club', 'Park Ave', 'Main St', 'Oak Lane', 'Westminster Rd'];

const orders: Order[] = orderSeeds.map((s, i) => {
  const customer = customers[s.cust];
  const items = s.items.map(([pi, q]) => ({
    product: products[pi],
    qty: q,
    subtotal: products[pi].price * q,
  }));
  return {
    id: i + 1,
    orderNo: s.no,
    customer,
    items,
    subtotal: s.sub,
    shipping: s.ship,
    discount: 0,
    total: s.sub + s.ship,
    status: s.status,
    shippingMethod: s.ship === 45 ? 'Express Shipping' : 'Standard Shipping',
    date: s.date,
    shipAddress: `${Math.floor(i * 137 + 100)} ${streetNames[i % 5]}, ${customer.city}`,
  };
});

const revenueTrend: RevenueTrendItem[] = [];
const baseDate = new Date('2026-04-29');
for (let i = 29; i >= 0; i--) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() - i);
  const wk = d.getDay();
  const weekendBoost = (wk === 0 || wk === 6) ? 1.15 : 1;
  const noise = 0.85 + ((i * 7919 + 1) % 100) / 250;
  const total = Math.round(8500 * weekendBoost * noise);
  const us = Math.round(total * 0.768);
  const uk = Math.round(total * 0.173);
  const de = total - us - uk;
  revenueTrend.push({
    date: d.toISOString().slice(5, 10),
    total, us, uk, de,
    orders: Math.round(total / 320),
    shipping: Math.round(total * 0.08),
  });
}

const countryDist: CountryDist[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', orders: 6933, revenue: 1845200, share: 76.8 },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', orders: 1562, revenue: 412800, share: 17.3 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', orders: 532, revenue: 142400, share: 5.9 },
];

const topSkus: TopSku[] = [...products]
  .map(p => ({ sku: p.sku, name: p.name, qty: p.sales, revenue: p.sales * p.price, tone: p.tone, accent: p.accent }))
  .sort((a, b) => b.qty - a.qty)
  .slice(0, 6);

export const LEDARISE_DATA: LedariseData = {
  products,
  customers,
  orders,
  revenueTrend,
  countryDist,
  topSkus,
  COLORS,
  LENGTHS,
  MATERIALS,
  CATEGORIES,
  STATUSES,
  stats: {
    totalOrders: 9027,
    totalRevenue: 2400400,
    totalCustomers: 6841,
    totalSkus: 384,
    avgOrder: 266.05,
    ordersToday: 47,
    revenueToday: 12894,
    shippingRevenue: 192030,
    itemsShipped: 14628,
  },
};
