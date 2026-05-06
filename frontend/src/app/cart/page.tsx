'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/store/Nav';
import { Footer } from '@/components/store/Footer';
import { ProductSwatch } from '@/components/store/ProductSwatch';
import { Icon } from '@/components/icons';
import { useCart } from '@/lib/cart';

export default function CartPage() {
  const router = useRouter();
  const cart = useCart();
  const [coupon, setCoupon] = useState('');
  const subtotal = cart.subtotal();
  const shipping = subtotal > 300 ? 0 : 25;

  if (cart.items.length === 0) {
    return (
      <div className="store">
        <Nav />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '120px 32px', textAlign: 'center' }}>
          <Icon.Cart width={48} height={48} style={{ color: 'var(--ink-4)', margin: '0 auto 24px', display: 'block' }} />
          <h1 className="serif" style={{ fontSize: 44, marginBottom: 12 }}>Your bag is empty.</h1>
          <p style={{ color: 'var(--ink-4)', marginBottom: 32 }}>Begin with a hand-tied system from our collection.</p>
          <button className="btn" onClick={() => router.push('/shop')}>Shop the Collection</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="store">
      <Nav />
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '48px 32px 96px' }}>
        <div className="eyebrow">Step 1 of 3</div>
        <h1 className="serif" style={{ fontSize: 48, margin: '8px 0 40px' }}>Your Bag</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 64 }}>
          <div>
            <div style={{ borderTop: '1px solid var(--line)' }}>
              {cart.items.map(it => (
                <div key={it.product.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 24, padding: '24px 0', borderBottom: '1px solid var(--line)' }}>
                  <div style={{ aspectRatio: '4/5', background: it.product.tone, position: 'relative', overflow: 'hidden', cursor: 'pointer' }} onClick={() => router.push('/product/' + it.product.id)}>
                    <ProductSwatch product={it.product} size="lg" />
                  </div>
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 4 }}>{it.product.material}</div>
                    <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>{it.product.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-4)', marginBottom: 16 }}>{it.product.color} · {it.product.length} · SKU {it.product.sku}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)' }}>
                        <button onClick={() => cart.setQty(it.product.id, it.qty - 1)} style={{ padding: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}><Icon.Minus /></button>
                        <span style={{ padding: '0 14px', fontSize: 14 }}>{it.qty}</span>
                        <button onClick={() => cart.setQty(it.product.id, it.qty + 1)} style={{ padding: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}><Icon.Plus /></button>
                      </div>
                      <button onClick={() => cart.remove(it.product.id)} style={{ background: 'transparent', border: 'none', fontSize: 12, color: 'var(--ink-4)', textDecoration: 'underline', cursor: 'pointer', letterSpacing: '0.06em' }}>Remove</button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 500 }}>${(it.product.price * it.qty).toFixed(2)}</div>
                    {it.qty > 1 && <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>${it.product.price} each</div>}
                  </div>
                </div>
              ))}
            </div>
            <a onClick={() => router.push('/shop')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 24, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', color: 'var(--ink-3)' }}>
              <Icon.ArrowLeft /> Continue shopping
            </a>
          </div>

          {/* Summary */}
          <div>
            <div style={{ background: 'var(--paper)', padding: 32 }}>
              <div className="eyebrow" style={{ marginBottom: 20 }}>Order Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, paddingBottom: 20, borderBottom: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-4)' }}>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-4)' }}>Shipping</span><span>{shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-4)' }}>Estimated tax</span><span>Calculated at checkout</span></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '20px 0' }}>
                <span style={{ fontSize: 14 }}>Total</span>
                <span className="serif" style={{ fontSize: 28 }}>${(subtotal + shipping).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Promo code" style={{ flex: 1, padding: '12px 14px', border: '1px solid var(--line)', background: 'transparent', fontSize: 13, fontFamily: 'inherit' }} />
                <button className="btn btn-ghost" style={{ padding: '12px 20px' }}>Apply</button>
              </div>
              <button className="btn" style={{ width: '100%' }} onClick={() => router.push('/checkout')}>Proceed to Checkout</button>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16, color: 'var(--ink-4)', fontSize: 11, letterSpacing: '0.06em' }}>
                <span>VISA</span><span>MC</span><span>AMEX</span><span>PAYPAL</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
