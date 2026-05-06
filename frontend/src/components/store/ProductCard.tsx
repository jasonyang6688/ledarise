'use client';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import { useCart } from '@/lib/cart';
import { ProductSwatch } from './ProductSwatch';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const cart = useCart();

  return (
    <div className="product-card" onClick={() => router.push(`/product/${product.id}`)}>
      <div className="swatch">
        <ProductSwatch product={product} />
        <div className="quick-add" onClick={(e) => { e.stopPropagation(); cart.add(product); }}>
          + Add to Bag
        </div>
        {product.originalPrice > product.price && (
          <span style={{ position: 'absolute', top: 12, right: 12, background: 'var(--gold)', color: 'white', fontSize: 10, padding: '4px 8px', letterSpacing: '0.1em' }}>
            −{Math.round((1 - product.price/product.originalPrice)*100)}%
          </span>
        )}
      </div>
      <div style={{ padding: '20px 4px 8px' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 6 }}>{product.material} · {product.color}</div>
        <div className="serif" style={{ fontSize: 20, marginBottom: 6, color: 'var(--ink)' }}>{product.name}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>${product.price}</span>
          {product.originalPrice > product.price && (
            <span style={{ fontSize: 13, color: 'var(--ink-4)', textDecoration: 'line-through' }}>${product.originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}
