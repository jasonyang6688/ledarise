import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem } from './types';

interface CartStore {
  items: CartItem[];
  add: (product: Product, qty?: number) => void;
  remove: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product, qty = 1) => {
        const existing = get().items.find(i => i.product.id === product.id);
        if (existing) {
          set(state => ({
            items: state.items.map(i =>
              i.product.id === product.id ? { ...i, qty: i.qty + qty } : i
            ),
          }));
        } else {
          set(state => ({ items: [...state.items, { product, qty }] }));
        }
      },
      remove: (id) => set(state => ({ items: state.items.filter(i => i.product.id !== id) })),
      setQty: (id, qty) =>
        set(state => ({
          items: state.items.map(i =>
            i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i
          ),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((n, i) => n + i.qty, 0),
      subtotal: () => get().items.reduce((n, i) => n + i.product.price * i.qty, 0),
    }),
    { name: 'ledarise.cart' }
  )
);

export function useCart() {
  return useCartStore();
}
