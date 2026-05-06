'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/store/Nav';
import { Footer } from '@/components/store/Footer';
import { ProductSwatch } from '@/components/store/ProductSwatch';
import { Icon } from '@/components/icons';
import { useCart } from '@/lib/cart';
import { api, ApiError } from '@/lib/api';

interface FormState {
  first: string;
  last: string;
  email: string;
  phone: string;
  addr1: string;
  addr2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

function Field({ label, value, onChange, type = 'text', placeholder, options }: {
  label: string;
  value?: string | number;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
  options?: string[];
}) {
  return (
    <div>
      <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 6 }}>{label}</div>
      {type === 'select' ? (
        <select value={value as string} onChange={e => onChange?.(e.target.value)} style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--line)', background: 'transparent', fontSize: 14, fontFamily: 'inherit' }}>
          {options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input value={value ?? ''} onChange={e => onChange?.(e.target.value)} type={type} placeholder={placeholder}
          style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--line)', background: 'transparent', fontSize: 14, fontFamily: 'inherit' }}
        />
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const [step, setStep] = useState(1);
  const [shipMethod, setShipMethod] = useState('standard');
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ first: '', last: '', email: '', phone: '', addr1: '', addr2: '', city: '', state: '', zip: '', country: 'United States' });
  const subtotal = cart.subtotal();
  const shippingCost = shipMethod === 'express' ? 45 : 25;
  const total = subtotal + shippingCost;

  const setField = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setOrderError(null);
    try {
      const orderItems = cart.items.map(it => ({
        product_id: it.product.id,
        sku: it.product.sku,
        product_name: it.product.name,
        price: it.product.price,
        quantity: it.qty,
      }));
      const order = await api.publicOrders.create({
        ship_name: `${form.first} ${form.last}`.trim(),
        ship_phone: form.phone,
        ship_address: form.addr1 + (form.addr2 ? `, ${form.addr2}` : ''),
        ship_city: form.city,
        ship_state: form.state,
        ship_zip: form.zip,
        ship_country: form.country,
        shipping_method: shipMethod === 'express' ? 'Express Shipping' : 'Standard Shipping',
        items: orderItems,
      });
      cart.clear();
      router.push(`/order-success?no=${order.orderNo}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to place order. Please try again.';
      setOrderError(msg);
      setPlacing(false);
    }
  };

  return (
    <div className="store">
      <Nav />
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '48px 32px 96px' }}>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
          {[
            { n: 1, label: 'Information' },
            { n: 2, label: 'Shipping' },
            { n: 3, label: 'Payment' },
          ].map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 24, flex: i < 2 ? 1 : 'initial' }}>
              <div className="step-pill">
                <div className={`step-num ${step === s.n ? 'active' : step > s.n ? 'done' : ''}`}>
                  {step > s.n ? <Icon.Check width={12} height={12} /> : s.n}
                </div>
                <span style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: step >= s.n ? 'var(--ink)' : 'var(--ink-4)' }}>{s.label}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64 }}>
          <div>
            {step === 1 && (
              <div className="fade-up">
                <h2 className="serif" style={{ fontSize: 36, marginBottom: 24 }}>Contact &amp; Shipping</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-row">
                    <Field label="First name" value={form.first} onChange={v => setField('first', v)} />
                    <Field label="Last name" value={form.last} onChange={v => setField('last', v)} />
                  </div>
                  <Field label="Email" value={form.email} onChange={v => setField('email', v)} type="email" />
                  <Field label="Phone" value={form.phone} onChange={v => setField('phone', v)} />
                  <Field label="Address line 1" value={form.addr1} onChange={v => setField('addr1', v)} />
                  <Field label="Address line 2 (optional)" value={form.addr2} onChange={v => setField('addr2', v)} />
                  <div className="form-row">
                    <Field label="City" value={form.city} onChange={v => setField('city', v)} />
                    <Field label="State / Region" value={form.state} onChange={v => setField('state', v)} />
                    <Field label="ZIP" value={form.zip} onChange={v => setField('zip', v)} />
                  </div>
                  <Field label="Country" type="select" value={form.country} onChange={v => setField('country', v)}
                    options={['United States', 'United Kingdom', 'Germany']} />
                </div>
                <button className="btn" style={{ marginTop: 28 }} onClick={() => setStep(2)}>Continue to Shipping <Icon.ArrowRight /></button>
              </div>
            )}
            {step === 2 && (
              <div className="fade-up">
                <h2 className="serif" style={{ fontSize: 36, marginBottom: 24 }}>Shipping Method</h2>
                {[
                  { id: 'standard', name: 'Standard Shipping', time: '5–10 business days', price: 25 },
                  { id: 'express', name: 'Express Shipping', time: '2–3 business days', price: 45 },
                ].map(opt => (
                  <label key={opt.id} onClick={() => setShipMethod(opt.id)} style={{
                    display: 'grid', gridTemplateColumns: '20px 1fr auto', gap: 16, alignItems: 'center',
                    padding: 20, marginBottom: 12, cursor: 'pointer',
                    border: '1px solid ' + (shipMethod === opt.id ? 'var(--ink)' : 'var(--line)'),
                    background: shipMethod === opt.id ? 'var(--paper)' : 'transparent',
                  }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {shipMethod === opt.id && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ink)' }} />}
                    </span>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>{opt.name}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--ink-4)' }}>{opt.time} · Discreet packaging · Tracking included</div>
                    </div>
                    <span style={{ fontWeight: 500 }}>${opt.price.toFixed(2)}</span>
                  </label>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
                  <button className="btn btn-ghost" onClick={() => setStep(1)}><Icon.ArrowLeft /> Back</button>
                  <button className="btn" onClick={() => setStep(3)}>Continue to Payment <Icon.ArrowRight /></button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="fade-up">
                <h2 className="serif" style={{ fontSize: 36, marginBottom: 8 }}>Payment</h2>
                <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-4)', marginBottom: 24 }}>
                  <Icon.Lock /> Secured by 256-bit encryption
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Field label="Card number" placeholder="•••• •••• •••• ••••" />
                  <Field label="Cardholder name" />
                  <div className="form-row">
                    <Field label="Expiry (MM/YY)" placeholder="MM/YY" />
                    <Field label="CVV" placeholder="•••" />
                  </div>
                </div>
                {orderError && (
                  <div style={{ marginTop: 16, padding: 12, background: '#fef2f2', color: '#dc2626', borderRadius: 4, fontSize: 13 }}>
                    {orderError}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
                  <button className="btn btn-ghost" onClick={() => setStep(2)}><Icon.ArrowLeft /> Back</button>
                  <button
                    className="btn btn-gold"
                    onClick={handlePlaceOrder}
                    disabled={placing}
                  >
                    {placing ? 'Placing Order...' : `Place Order · $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div style={{ background: 'var(--paper)', padding: 32, alignSelf: 'flex-start', position: 'sticky', top: 140 }}>
            <div className="eyebrow" style={{ marginBottom: 20 }}>Order ({cart.items.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 20, borderBottom: '1px solid var(--line)' }}>
              {cart.items.map(it => (
                <div key={it.product.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 12, alignItems: 'center' }}>
                  <div style={{ aspectRatio: '4/5', background: it.product.tone, position: 'relative', overflow: 'hidden' }}>
                    <ProductSwatch product={it.product} size="lg" />
                    <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--ink)', color: 'white', borderRadius: 12, width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.qty}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{it.product.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{it.product.color}</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>${(it.product.price * it.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-4)' }}>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--ink-4)' }}>Shipping ({shipMethod})</span><span>${shippingCost.toFixed(2)}</span></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '16px 0' }}>
              <span style={{ fontSize: 14 }}>Total</span>
              <span className="serif" style={{ fontSize: 26 }}>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
