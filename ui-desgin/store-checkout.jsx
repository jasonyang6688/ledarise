/* global React, Icon, useCart, ProductSwatch */
const D3 = window.LEDARISE_DATA;
const { useState: uS3, useEffect: uE3 } = React;

// ───────── CART ─────────
function StoreCart({ navigate }) {
  const cart = useCart();
  const [coupon, setCoupon] = uS3('');
  const subtotal = cart.subtotal();
  const shipping = subtotal > 300 ? 0 : 25;

  if (cart.items.length === 0) {
    return (
      <div className="store">
        <window.StoreNav route="/cart" navigate={navigate} cartCount={0} />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '120px 32px', textAlign: 'center' }}>
          <Icon.Cart width={48} height={48} style={{ color: 'var(--ink-4)', margin: '0 auto 24px', display: 'block' }} />
          <h1 className="serif" style={{ fontSize: 44, marginBottom: 12 }}>Your bag is empty.</h1>
          <p style={{ color: 'var(--ink-4)', marginBottom: 32 }}>Begin with a hand-tied system from our collection.</p>
          <button className="btn" onClick={() => navigate('/shop')}>Shop the Collection</button>
        </div>
        <window.StoreFooter />
      </div>
    );
  }

  return (
    <div className="store">
      <window.StoreNav route="/cart" navigate={navigate} cartCount={cart.count()} />
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '48px 32px 96px' }}>
        <div className="eyebrow">Step 1 of 3</div>
        <h1 className="serif" style={{ fontSize: 48, margin: '8px 0 40px' }}>Your Bag</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 64 }}>
          <div>
            <div style={{ borderTop: '1px solid var(--line)' }}>
              {cart.items.map(it => (
                <div key={it.product.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 24, padding: '24px 0', borderBottom: '1px solid var(--line)' }}>
                  <div style={{ aspectRatio: '4/5', background: it.product.tone, position: 'relative', overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate('/product/' + it.product.id)}>
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
            <a onClick={() => navigate('/shop')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 24, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', color: 'var(--ink-3)' }}>
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
              <button className="btn" style={{ width: '100%' }} onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16, color: 'var(--ink-4)', fontSize: 11, letterSpacing: '0.06em' }}>
                <span>VISA</span><span>MC</span><span>AMEX</span><span>PAYPAL</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <window.StoreFooter />
    </div>
  );
}
window.StoreCart = StoreCart;

// ───────── CHECKOUT ─────────
function StoreCheckout({ navigate }) {
  const cart = useCart();
  const [step, setStep] = uS3(1);
  const [shipMethod, setShipMethod] = uS3('standard');
  const [form, setForm] = uS3({ first: '', last: '', email: '', phone: '', addr1: '', addr2: '', city: '', state: '', zip: '', country: 'United States' });
  const subtotal = cart.subtotal();
  const shippingCost = shipMethod === 'express' ? 45 : 25;
  const total = subtotal + shippingCost;

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="store">
      <window.StoreNav route="/checkout" navigate={navigate} cartCount={cart.count()} />
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '48px 32px 96px' }}>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
          {[
            { n: 1, label: 'Information' },
            { n: 2, label: 'Shipping' },
            { n: 3, label: 'Payment' },
          ].map((s, i) => (
            <React.Fragment key={s.n}>
              <div className="step-pill">
                <div className={`step-num ${step === s.n ? 'active' : step > s.n ? 'done' : ''}`}>
                  {step > s.n ? <Icon.Check width={12} height={12} /> : s.n}
                </div>
                <span style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: step >= s.n ? 'var(--ink)' : 'var(--ink-4)' }}>{s.label}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />}
            </React.Fragment>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64 }}>
          <div>
            {step === 1 && (
              <div className="fade-up">
                <h2 className="serif" style={{ fontSize: 36, marginBottom: 24 }}>Contact & Shipping</h2>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
                  <button className="btn btn-ghost" onClick={() => setStep(2)}><Icon.ArrowLeft /> Back</button>
                  <button className="btn btn-gold" onClick={() => navigate('/order-success?no=PO000419' + Math.floor(Math.random()*900+100))}>Place Order · ${total.toFixed(2)}</button>
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
      <window.StoreFooter />
    </div>
  );
}
window.StoreCheckout = StoreCheckout;

function Field({ label, value, onChange, type = 'text', placeholder, options }) {
  return (
    <div>
      <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 6 }}>{label}</div>
      {type === 'select' ? (
        <select value={value} onChange={e => onChange?.(e.target.value)} style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--line)', background: 'transparent', fontSize: 14, fontFamily: 'inherit' }}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input value={value || ''} onChange={e => onChange?.(e.target.value)} type={type} placeholder={placeholder}
          style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--line)', background: 'transparent', fontSize: 14, fontFamily: 'inherit' }}
        />
      )}
    </div>
  );
}

// ───────── ORDER SUCCESS ─────────
function StoreSuccess({ navigate, query }) {
  const cart = useCart();
  uE3(() => { cart.clear(); }, []);
  const orderNo = query.no || 'PO000419xxx';
  return (
    <div className="store">
      <window.StoreNav route="/order-success" navigate={navigate} cartCount={0} />
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '96px 32px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gold)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Icon.Check width={28} height={28} />
        </div>
        <div className="eyebrow">Confirmation</div>
        <h1 className="serif" style={{ fontSize: 56, margin: '12px 0 16px', lineHeight: 1.1 }}>Thank you.</h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 16, lineHeight: 1.6, marginBottom: 8 }}>
          Your order is confirmed. A receipt is on its way to your inbox.
        </p>
        <p style={{ fontSize: 13, color: 'var(--ink-4)', marginBottom: 32, fontFamily: 'monospace', letterSpacing: '0.08em' }}>Order #{orderNo}</p>

        <div style={{ background: 'var(--paper)', padding: 32, textAlign: 'left', marginBottom: 32 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>What happens next</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { num: '01', title: 'Confirmation email', desc: 'Within 5 minutes — check your inbox.' },
              { num: '02', title: 'Atelier preparation', desc: 'Your system is hand-finished and quality-checked.' },
              { num: '03', title: 'Discreet shipping', desc: 'Tracking sent the moment it leaves our New Jersey atelier.' },
            ].map(s => (
              <div key={s.num} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 16, alignItems: 'center' }}>
                <span className="serif" style={{ fontSize: 24, color: 'var(--gold-2)' }}>{s.num}</span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{s.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-4)' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn" onClick={() => navigate('/shop')}>Continue Shopping</button>
      </section>
      <window.StoreFooter />
    </div>
  );
}
window.StoreSuccess = StoreSuccess;
