/* global React, Icon, StatusBadge */
const D6 = window.LEDARISE_DATA;
const { useState: uS6, useMemo: uM6 } = React;

// ───────── Orders List ─────────
function AdminOrders({ navigate, dark, setDark, query }) {
  const [search, setSearch] = uS6('');
  const [status, setStatus] = uS6('all');
  const [country, setCountry] = uS6('all');
  const [importOpen, setImportOpen] = uS6(query.import === '1');
  const [selected, setSelected] = uS6([]);

  const filtered = uM6(() => {
    return D6.orders.filter(o =>
      (!search || o.orderNo.includes(search) || o.customer.name.toLowerCase().includes(search.toLowerCase())) &&
      (status === 'all' || o.status === status) &&
      (country === 'all' || o.customer.country === country)
    );
  }, [search, status, country]);

  return (
    <window.AdminShell route="/admin/orders" navigate={navigate} dark={dark} setDark={setDark}>
      <window.AdminHeader title="Orders" subtitle={`${filtered.length} of ${D6.orders.length} orders shown · ${D6.stats.totalOrders.toLocaleString()} all-time`} dark={dark}
        actions={
          <>
            <button className="admin-btn admin-btn-secondary"><Icon.Download /> Export</button>
            <button className="admin-btn admin-btn-secondary" onClick={() => setImportOpen(true)}><Icon.Upload /> Import Excel</button>
            <button className="admin-btn"><Icon.Plus /> New Order</button>
          </>
        }
      />

      <div style={{ padding: '24px 40px' }}>
        {/* Filters */}
        <div className="admin-card" style={{ padding: 14, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Icon.Search width={13} height={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }} />
            <input className="admin-input" placeholder="Search by order # or customer name..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30 }}/>
          </div>
          <FilterSelect value={status} onChange={setStatus} options={[['all','All status'],['complete','Complete'],['processing','Processing'],['pending','Pending'],['cancelled','Cancelled']]} dark={dark}/>
          <FilterSelect value={country} onChange={setCountry} options={[['all','All countries'],['United States','🇺🇸 US'],['United Kingdom','🇬🇧 UK'],['Germany','🇩🇪 DE']]} dark={dark}/>
          <button className="admin-btn admin-btn-secondary"><Icon.Calendar/> Date</button>
          <button className="admin-btn admin-btn-secondary"><Icon.Filter/> More</button>
        </div>

        {/* Bulk action bar */}
        {selected.length > 0 && (
          <div style={{ padding: '10px 16px', marginBottom: 12, borderRadius: 10, background: dark ? 'var(--ad-surface-2)' : 'var(--a-soft-info)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
            <span style={{ fontWeight: 500 }}>{selected.length} selected</span>
            <span style={{ flex: 1 }} />
            <button className="admin-btn admin-btn-secondary">Update status</button>
            <button className="admin-btn admin-btn-secondary">Export selected</button>
            <button className="admin-btn admin-btn-secondary" onClick={() => setSelected([])}>Clear</button>
          </div>
        )}

        {/* Table */}
        <div className="admin-card" style={{ overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={e => setSelected(e.target.checked ? filtered.map(o => o.id) : [])} />
                </th>
                <th>Order</th><th>Customer</th><th>Country</th><th>Items</th><th style={{ textAlign: 'right' }}>Total</th><th>Status</th><th>Placed</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className="clickable" onClick={() => navigate('/admin/orders/' + o.id)}>
                  <td onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.includes(o.id)} onChange={e => setSelected(s => e.target.checked ? [...s, o.id] : s.filter(x => x !== o.id))} />
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 500 }}>{o.orderNo}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{o.customer.name}</div>
                    <div style={{ fontSize: 11.5, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>{o.customer.email}</div>
                  </td>
                  <td>{o.customer.flag} {o.customer.city}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex' }}>
                        {o.items.slice(0,3).map((it, i) => (
                          <div key={i} style={{ width: 22, height: 22, borderRadius: 4, background: it.product.tone, marginLeft: i > 0 ? -6 : 0, border: '2px solid ' + (dark ? 'var(--ad-surface)' : 'white'), position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', inset: '25% 30%', borderRadius: '50% 50% 40% 40%', background: it.product.accent }} />
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: 12.5 }}>{o.items.reduce((a,i)=>a+i.qty,0)}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>${o.total.toFixed(2)}</td>
                  <td><StatusBadge status={o.status}/></td>
                  <td style={{ color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', fontSize: 12.5 }}>{o.date}</td>
                  <td><Icon.More style={{ color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}/></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)'), fontSize: 12.5, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}>
            <span>Showing 1–{filtered.length} of {D6.stats.totalOrders.toLocaleString()}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="admin-btn admin-btn-secondary" style={{ padding: '5px 9px' }}><Icon.ArrowLeft/></button>
              {[1,2,3,'…',451].map((n,i) => (
                <button key={i} className={'admin-btn ' + (n === 1 ? '' : 'admin-btn-secondary')} style={{ padding: '5px 11px', minWidth: 28 }}>{n}</button>
              ))}
              <button className="admin-btn admin-btn-secondary" style={{ padding: '5px 9px' }}><Icon.ArrowRight/></button>
            </div>
          </div>
        </div>
      </div>

      {importOpen && <ImportDialog onClose={() => setImportOpen(false)} dark={dark}/>}
    </window.AdminShell>
  );
}
window.AdminOrders = AdminOrders;

function FilterSelect({ value, onChange, options, dark }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="admin-input" style={{ width: 'auto', minWidth: 140, paddingRight: 28, cursor: 'pointer' }}>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

// ───────── Order Detail ─────────
function AdminOrderDetail({ navigate, dark, setDark, orderId }) {
  const order = D6.orders.find(o => o.id === +orderId) || D6.orders[0];
  const [orderStatus, setOrderStatus] = uS6(order.status);
  const [note, setNote] = uS6('Customer requested gift packaging.');

  return (
    <window.AdminShell route="/admin/orders" navigate={navigate} dark={dark} setDark={setDark}>
      <window.AdminHeader
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="admin-btn admin-btn-secondary" style={{ padding: 7 }} onClick={() => navigate('/admin/orders')}><Icon.ArrowLeft/></button>
            <span style={{ fontFamily: 'monospace', fontSize: 18 }}>{order.orderNo}</span>
            <StatusBadge status={orderStatus}/>
          </div>
        }
        subtitle={`Placed ${order.date} · ${order.customer.flag} ${order.customer.country}`}
        dark={dark}
        actions={
          <>
            <button className="admin-btn admin-btn-secondary"><Icon.Download/> Invoice PDF</button>
            <button className="admin-btn"><Icon.Truck/> Mark Shipped</button>
          </>
        }
      />

      <div style={{ padding: '24px 40px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Status timeline */}
          <div className="admin-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Order Lifecycle</div>
              <select value={orderStatus} onChange={e => setOrderStatus(e.target.value)} className="admin-input" style={{ width: 'auto', paddingRight: 28 }}>
                {D6.STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {[
                { key: 'pending', label: 'Placed', date: '04/22 09:14' },
                { key: 'processing', label: 'Processing', date: '04/22 14:32' },
                { key: 'shipped', label: 'Shipped', date: '04/24 11:08' },
                { key: 'complete', label: 'Delivered', date: '04/27 15:22' },
              ].map((s, i, arr) => {
                const idx = arr.findIndex(a => a.key === orderStatus);
                const done = i <= (idx >= 0 ? idx : 1);
                return (
                  <React.Fragment key={s.key}>
                    <div style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: done ? '#b8895c' : (dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)'),
                        color: done ? 'white' : (dark ? 'var(--ad-text-3)' : 'var(--a-text-3)'),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 8px', fontSize: 11, fontWeight: 600,
                      }}>{done ? <Icon.Check width={12} height={12}/> : i+1}</div>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', marginTop: 2 }}>{done ? s.date : '—'}</div>
                    </div>
                    {i < arr.length - 1 && <div style={{ flex: 0.5, height: 2, background: done && i < (D6.STATUSES.findIndex(x => x === orderStatus)) ? '#b8895c' : (dark ? 'var(--ad-border-2)' : 'var(--a-border-2)'), alignSelf: 'center', marginTop: -22 }}/>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Items */}
          <div className="admin-card" style={{ padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Items ({order.items.length})</div>
            {order.items.map((it, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto auto auto', gap: 16, padding: '14px 0', borderBottom: i < order.items.length - 1 ? '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)') : 'none', alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 8, background: it.product.tone, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: '25% 28%', borderRadius: '50% 50% 40% 40%', background: it.product.accent }} />
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{it.product.name}</div>
                  <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', marginTop: 2 }}>SKU {it.product.sku} · {it.product.color} · {it.product.length}</div>
                </div>
                <div style={{ fontSize: 13, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}>${it.product.price.toFixed(2)}</div>
                <div style={{ fontSize: 13, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}>× {it.qty}</div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>${it.subtotal.toFixed(2)}</div>
              </div>
            ))}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)') }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}><span>Shipping ({order.shippingMethod})</span><span>${order.shipping.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}><span>Discount</span><span>−${order.discount.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 600, padding: '8px 0 0', borderTop: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)'), marginTop: 8 }}><span>Total</span><span>${order.total.toFixed(2)}</span></div>
            </div>
          </div>

          {/* Note */}
          <div className="admin-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Internal Note</div>
              <span style={{ fontSize: 11, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>Auto-saved · just now</span>
            </div>
            <textarea className="admin-input" rows={3} value={note} onChange={e => setNote(e.target.value)} style={{ resize: 'vertical' }}/>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Customer */}
          <div className="admin-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12.5, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', fontWeight: 500, marginBottom: 12 }}>Customer</div>
            <a onClick={() => navigate('/admin/customers/' + order.customer.id)} style={{ display: 'flex', gap: 12, cursor: 'pointer', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #b8895c, #3a2a1f)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>{order.customer.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{order.customer.name}</div>
                <div style={{ fontSize: 11.5, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>{order.customer.orders} orders · ${order.customer.total.toFixed(0)} lifetime</div>
              </div>
            </a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon.Mail/> {order.customer.email}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon.Phone/> {order.customer.phone}</span>
            </div>
          </div>

          {/* Shipping address */}
          <div className="admin-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12.5, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', fontWeight: 500, marginBottom: 12 }}>Shipping Address</div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              <div style={{ fontWeight: 500 }}>{order.customer.name}</div>
              <div style={{ color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}>{order.shipAddress}</div>
              <div style={{ color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}>{order.customer.country}</div>
            </div>
            <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon.Truck/> <span style={{ flex: 1 }}>{order.shippingMethod}</span>
              <span style={{ fontFamily: 'monospace', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>1Z9X4...842</span>
            </div>
          </div>

          {/* Payment */}
          <div className="admin-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12.5, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', fontWeight: 500, marginBottom: 12 }}>Payment</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ padding: '5px 8px', borderRadius: 4, background: dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>VISA</div>
              <div style={{ fontSize: 13, fontFamily: 'monospace' }}>•••• 4582</div>
            </div>
            <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', marginTop: 8 }}>Authorized · {order.date} · 09:14 UTC</div>
          </div>
        </div>
      </div>
    </window.AdminShell>
  );
}
window.AdminOrderDetail = AdminOrderDetail;

// ───────── Import Dialog ─────────
function ImportDialog({ onClose, dark }) {
  const [step, setStep] = uS6(1);
  const [progress, setProgress] = uS6(0);

  uM6(() => {
    if (step === 3) {
      const t = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { clearInterval(t); setStep(4); return 100; }
          return Math.min(100, p + Math.floor(Math.random() * 8 + 3));
        });
      }, 120);
      return () => clearInterval(t);
    }
  }, [step]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
      <div className="admin-card" style={{ width: 640, maxWidth: '100%', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)'), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Import Historical Orders</div>
            <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', marginTop: 2 }}>Step {Math.min(step, 3)} of 3 · Excel upload · 9,027 estimated rows</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4 }}><Icon.X/></button>
        </div>

        <div style={{ padding: 24, minHeight: 280 }}>
          {step === 1 && (
            <div>
              <div style={{ padding: 36, borderRadius: 12, border: '2px dashed ' + (dark ? 'var(--ad-border-2)' : 'var(--a-border-2)'), textAlign: 'center', marginBottom: 12 }}>
                <Icon.Upload width={28} height={28} style={{ margin: '0 auto 12px', display: 'block', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}/>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Drag and drop your .xlsx file</div>
                <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>or click to browse · Max 50MB</div>
              </div>
              <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', display: 'flex', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 8, background: dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)' }}>
                <Icon.File/>
                <div>Expected columns: <code style={{ fontFamily: 'monospace', fontSize: 11 }}>ID, Bill-to Name, Ship-to Address, Tel, Status, Grand Total, SKU, Item Count, Country Id, Coupon Code, Purchase Date</code></div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <div style={{ padding: 14, borderRadius: 10, background: dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Icon.File/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>orders_export_2026.xlsx</div>
                  <div style={{ fontSize: 11.5, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>9,027 rows · 4.2 MB · 11 columns detected</div>
                </div>
                <span className="badge badge-success"><Icon.Check width={10} height={10}/>Valid</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Preview · first 5 rows</div>
              <div style={{ overflow: 'auto', borderRadius: 8, border: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)') }}>
                <table className="admin-table" style={{ fontSize: 11.5 }}>
                  <thead><tr><th>ID</th><th>Bill-to</th><th>SKU</th><th>Total</th><th>Country</th></tr></thead>
                  <tbody>
                    {D6.orders.slice(0,5).map(o => <tr key={o.id}><td style={{fontFamily:'monospace'}}>{o.orderNo}</td><td>{o.customer.name}</td><td>{o.items[0].product.sku}</td><td>${o.total}</td><td>{o.customer.country}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 24 }}>Importing... {progress}%</div>
              <div style={{ height: 8, borderRadius: 4, background: dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)', overflow: 'hidden', maxWidth: 400, margin: '0 auto' }}>
                <div style={{ width: progress + '%', height: '100%', background: 'linear-gradient(90deg, #b8895c, #d6b07e)', transition: 'width 0.2s' }}/>
              </div>
              <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', marginTop: 14 }}>
                Processing row {Math.floor(progress * 90.27)} of 9,027 · ~{Math.max(0, 60 - Math.floor(progress * 0.6))}s remaining
              </div>
            </div>
          )}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Icon.Check width={24} height={24}/></div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Import complete</div>
              <div style={{ fontSize: 13, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', marginBottom: 24 }}>9,027 rows processed in 47 seconds</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, maxWidth: 480, margin: '0 auto' }}>
                {[
                  { num: 8901, label: 'Orders' },
                  { num: 6841, label: 'Customers' },
                  { num: 384, label: 'Products' },
                  { num: 126, label: 'Skipped' },
                ].map(s => (
                  <div key={s.label} style={{ padding: 14, borderRadius: 8, background: dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)' }}>
                    <div style={{ fontSize: 20, fontWeight: 600 }}>{s.num.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)'), display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          {step < 4 && <button className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>}
          {step === 1 && <button className="admin-btn" onClick={() => setStep(2)}>Select File</button>}
          {step === 2 && <button className="admin-btn" onClick={() => { setStep(3); setProgress(0); }}>Start Import</button>}
          {step === 4 && <button className="admin-btn" onClick={onClose}>Done</button>}
        </div>
      </div>
    </div>
  );
}
