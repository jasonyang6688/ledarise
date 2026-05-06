'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/store/Nav';
import { Footer } from '@/components/store/Footer';
import { ProductCard } from '@/components/store/ProductCard';
import { ProductSwatch } from '@/components/store/ProductSwatch';
import { Stars } from '@/components/store/Stars';
import { Icon } from '@/components/icons';
import { LEDARISE_DATA } from '@/lib/data';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { useCart } from '@/lib/cart';
import type { Product } from '@/lib/types';

const { COLORS } = LEDARISE_DATA;

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [thumb, setThumb] = useState(0);
  const cart = useCart();

  const productId = params.id;

  const fetchProduct = useCallback(
    () => api.publicProducts.get(productId),
    [productId],
  );

  const { data: product, loading, error } = useFetch<Product>(fetchProduct, [productId]);

  const [color, setColor] = useState<string>('');

  // Fetch related once we have the product category
  const fetchRelated = useCallback(
    () =>
      product
        ? api.publicProducts
            .list({ category: product.category, page_size: 5 })
            .then((r) => r.list.filter((p) => p.id !== product.id).slice(0, 4))
        : Promise.resolve([]),
    [product],
  );
  const { data: related } = useFetch<Product[]>(fetchRelated, [product?.category, product?.id]);

  if (loading) {
    return (
      <div className="store">
        <Nav />
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '96px 32px', textAlign: 'center', color: 'var(--ink-4)' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="store">
        <Nav />
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '96px 32px' }}>
          <div style={{ padding: 16, background: '#fef2f2', color: '#dc2626', borderRadius: 4 }}>
            Failed to load: {error ?? 'Product not found'}
          </div>
        </div>
      </div>
    );
  }

  const activeColor = color || product.color;

  return (
    <div className="store">
      <Nav />

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '24px 32px', fontSize: 12, color: 'var(--ink-4)', letterSpacing: '0.06em' }}>
        <a onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>HOME</a>
        <span style={{ margin: '0 8px' }}>/</span>
        <a onClick={() => router.push('/shop')} style={{ cursor: 'pointer' }}>SHOP</a>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--ink)' }}>{product.name.toUpperCase()}</span>
      </div>

      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '0 32px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
        <div>
          <div style={{ background: product.tone, marginBottom: 12, position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
            <ProductSwatch product={product} size="lg" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[0,1,2,3].map(i => (
              <div key={i} onClick={() => setThumb(i)} style={{
                aspectRatio: '1/1', cursor: 'pointer',
                border: thumb === i ? '1px solid var(--ink)' : '1px solid var(--line)',
                background: product.tone, position: 'relative', overflow: 'hidden',
              }}>
                <ProductSwatch product={product} size="lg" />
              </div>
            ))}
          </div>
        </div>

        <div style={{ paddingTop: 8 }}>
          <div className="eyebrow" style={{ color: 'var(--gold-2)' }}>{product.material}</div>
          <h1 className="serif" style={{ fontSize: 48, margin: '12px 0 12px', letterSpacing: '-0.01em' }}>{product.name}</h1>
          <p style={{ fontSize: 16, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 20, fontStyle: 'italic' }}>{product.tagline}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <Stars value={product.rating} size={14} />
            <span style={{ fontSize: 12.5, color: 'var(--ink-4)' }}>{product.rating} · {product.reviews} reviews</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '20px 0', borderBottom: '1px solid var(--line)' }}>
            <span className="serif" style={{ fontSize: 36 }}>${product.price}</span>
            {product.originalPrice > product.price && (
              <>
                <span style={{ fontSize: 18, color: 'var(--ink-4)', textDecoration: 'line-through' }}>${product.originalPrice}</span>
                <span style={{ fontSize: 11, padding: '4px 10px', background: 'var(--gold)', color: 'white', letterSpacing: '0.1em' }}>SAVE ${product.originalPrice - product.price}</span>
              </>
            )}
          </div>

          <div style={{ padding: '24px 0', borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="eyebrow">Color</span>
              <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{activeColor}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{
                  padding: '8px 14px', fontSize: 12,
                  border: '1px solid ' + (activeColor === c ? 'var(--ink)' : 'var(--line)'),
                  background: activeColor === c ? 'var(--ink)' : 'transparent',
                  color: activeColor === c ? 'var(--ivory)' : 'var(--ink-3)',
                  cursor: 'pointer', borderRadius: 0, fontFamily: 'inherit',
                }}>{c}</button>
              ))}
            </div>
          </div>

          <div style={{ padding: '24px 0', display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--ink)' }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '13px 16px', background: 'transparent', border: 'none', cursor: 'pointer' }}><Icon.Minus /></button>
              <span style={{ padding: '0 20px', minWidth: 40, textAlign: 'center', fontWeight: 500 }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} style={{ padding: '13px 16px', background: 'transparent', border: 'none', cursor: 'pointer' }}><Icon.Plus /></button>
            </div>
            <button className="btn" style={{ flex: 1 }} onClick={() => { cart.add(product, qty); router.push('/cart'); }}>
              Add to Bag · ${(product.price * qty).toFixed(2)}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, padding: '20px 0', borderTop: '1px solid var(--line)' }}>
            {product.features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-3)' }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)' }} />
                {f}
              </div>
            ))}
          </div>

          <div style={{ paddingTop: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>The Detail</div>
            <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-3)' }}>{product.description}</p>
          </div>

          <div style={{ marginTop: 32, padding: '24px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px 32px', fontSize: 13.5 }}>
              {[['SKU', product.sku],['Material', product.material],['Length', product.length],['Color', product.color],['Density', '120%'],['Knot Type', 'Single, Hand-Tied']].map(([k,v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-4)' }}>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, marginTop: 24, fontSize: 12, color: 'var(--ink-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon.Truck width={14} height={14} /> Free shipping over $300</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon.Lock /> 30-day exchange</div>
          </div>
        </div>
      </section>

      {related && related.length > 0 && (
        <section style={{ background: 'var(--paper)', padding: '64px 32px', borderTop: '1px solid var(--line-soft)' }}>
          <div style={{ maxWidth: 1320, margin: '0 auto' }}>
            <div className="eyebrow">You May Also Like</div>
            <h2 className="serif" style={{ fontSize: 36, margin: '12px 0 32px' }}>From the {product.category} collection</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
