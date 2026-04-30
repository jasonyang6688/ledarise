/* global React, Icon, StatusBadge */
const D7 = window.LEDARISE_DATA;
const { useState: uS7, useMemo: uM7 } = React;

// ───────── Products ─────────
function AdminProducts({ navigate, dark, setDark, query }) {
  const [search, setSearch] = uS7('');
  const [view, setView] = uS7('grid');
  const [cat, setCat] = uS7('all');
  const [editing, setEditing] = uS7(query.new === '1' ? 'new' : null);

  const filtered = D7.products.filter(p =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())) &&
    (cat === 'all' || p.category === cat)
  );

  return (
    <window.AdminShell route="/admin/products" navigate={navigate} dark={dark} setDark={setDark}>
      <window.AdminHeader title="Products" subtitle={`${D7.products.length} active SKUs · 384 imported · 24 drafts`} dark={dark}
        actions={
          <>
            <button className="admin-btn admin-btn-secondary"><Icon.Download/> Export CSV</button>
            <button className="admin-btn" onClick={() => setEditing('new')}><Icon.Plus/> New Product</button>
          </>
        }
      />

      <div style={{ padding: '24px 40px' }}>
        {/* Filters */}
        <div className="admin-card" style={{ padding: 14, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Icon.Search width={13} height={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}/>
            <input className="admin-input" placeholder="Search by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30 }}/>
          </div>
          <select value={cat} onChange={e => setCat(e.target.value)} className="admin-input" style={{ width: 'auto', minWidth: 130 }}>
            <option value="all">All categories</option>
            {D7.CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="admin-input" style={{ width: 'auto', minWidth: 130 }}><option>All status</option><option>Published</option><option>Draft</option></select>
          <div style={{ display: 'inline-flex', borderRadius: 8, border: '1px solid ' + (dark ? 'var(--ad-border-2)' : 'var(--a-border-2)'), overflow: 'hidden' }}>
            {[
              { v: 'grid', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg> },
              { v: 'list', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="3" rx="1"/><rect x="3" y="10" width="18" height="3" rx="1"/><rect x="3" y="16" width="18" height="3" rx="1"/></svg> },
            ].map(b => (
              <button key={b.v} onClick={() => setView(b.v)} style={{ padding: '7px 11px', border: 'none', cursor: 'pointer', background: view === b.v ? (dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)') : 'transparent', color: 'inherit' }}>{b.icon}</button>
            ))}
          </div>
        </div>

        {view === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {filtered.map(p => (
              <div key={p.id} className="admin-card" style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={() => setEditing(p.id)}>
                <div style={{ aspectRatio: '4/5', background: p.tone, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: '20% 25%', borderRadius: '50% 50% 40% 40%', background: p.accent }}/>
                  <span style={{ position: 'absolute', top: 10, left: 10, fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em' }}>{p.sku}</span>
                  <span className="badge badge-success" style={{ position: 'absolute', top: 10, right: 10, fontSize: 10 }}>{p.status}</span>
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', marginBottom: 10 }}>{p.material} · {p.color}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>${p.price}</span>
                    <span style={{ fontSize: 11.5, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>{p.stock} in stock</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-card" style={{ overflow: 'hidden' }}>
            <table className="admin-table">
              <thead><tr><th></th><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Sales</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="clickable" onClick={() => setEditing(p.id)}>
                    <td>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: p.tone, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: '25% 28%', borderRadius: '50% 50% 40% 40%', background: p.accent }}/>
                      </div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.sku}</td>
                    <td>{p.category}</td>
                    <td style={{ fontWeight: 500 }}>${p.price}</td>
                    <td>{p.stock}</td>
                    <td>{p.sales}</td>
                    <td><span className="badge badge-success">{p.status}</span></td>
                    <td><Icon.More/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && <ProductEditor productId={editing} onClose={() => setEditing(null)} dark={dark}/>}
    </window.AdminShell>
  );
}
window.AdminProducts = AdminProducts;

function ProductEditor({ productId, onClose, dark }) {
  const isNew = productId === 'new';
  const product = isNew ? null : D7.products.find(p => p.id === productId);
  const [form, setForm] = uS7(product || {
    name: '', sku: '', description: '', price: 0, originalPrice: 0,
    category: 'Toupee', color: 'Dark Brown', length: '6 inch', material: 'Swiss Lace',
    stock: 0, status: 'draft', tone: '#3a2a1f', accent: '#b8895c', features: [],
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'flex-end', zIndex: 100 }} onClick={onClose}>
      <div className="admin-card" style={{ width: 720, height: '100vh', borderRadius: 0, overflow: 'auto', borderLeft: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)') }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)'), display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: dark ? 'var(--ad-surface)' : 'var(--a-surface)', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{isNew ? 'New Product' : form.name}</div>
            <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', marginTop: 2 }}>{isNew ? 'Add to catalog' : 'SKU ' + form.sku}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
            <button className="admin-btn">Save Product</button>
          </div>
        </div>

        <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Image upload */}
          <div>
            <div className="label">Product Images</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <div style={{ aspectRatio: '4/5', background: form.tone, borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: '20% 25%', borderRadius: '50% 50% 40% 40%', background: form.accent }}/>
                <span style={{ position: 'absolute', top: 6, left: 8, fontSize: 9, fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)' }}>1 · main</span>
              </div>
              {[2, 3].map(i => (
                <div key={i} style={{ aspectRatio: '4/5', background: form.tone, opacity: 0.6, borderRadius: 8, position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 6, left: 8, fontSize: 9, fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)' }}>{i}</span>
                </div>
              ))}
              <button style={{ aspectRatio: '4/5', borderRadius: 8, border: '2px dashed ' + (dark ? 'var(--ad-border-2)' : 'var(--a-border-2)'), background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', justifyContent: 'center', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>
                <Icon.Plus width={16} height={16}/>
                <span style={{ fontSize: 11 }}>Add image</span>
              </button>
            </div>
          </div>

          {/* Basic info */}
          <FormSection title="Basic Information" dark={dark}>
            <Grid cols={1}><FieldA label="Product name" value={form.name} onChange={v => set('name', v)}/></Grid>
            <Grid cols={2}>
              <FieldA label="SKU" value={form.sku} onChange={v => set('sku', v)} mono/>
              <FieldA label="Category" type="select" value={form.category} onChange={v => set('category', v)} options={D7.CATEGORIES}/>
            </Grid>
            <FieldA label="Tagline" value={form.tagline || ''} onChange={v => set('tagline', v)}/>
            <FieldA label="Description" type="textarea" value={form.description} onChange={v => set('description', v)}/>
          </FormSection>

          <FormSection title="Attributes" dark={dark}>
            <Grid cols={3}>
              <FieldA label="Color" type="select" value={form.color} onChange={v => set('color', v)} options={D7.COLORS}/>
              <FieldA label="Length" type="select" value={form.length} onChange={v => set('length', v)} options={D7.LENGTHS}/>
              <FieldA label="Material" type="select" value={form.material} onChange={v => set('material', v)} options={D7.MATERIALS}/>
            </Grid>
          </FormSection>

          <FormSection title="Pricing & Inventory" dark={dark}>
            <Grid cols={3}>
              <FieldA label="Price (USD)" value={form.price} onChange={v => set('price', +v)} prefix="$"/>
              <FieldA label="Compare at" value={form.originalPrice} onChange={v => set('originalPrice', +v)} prefix="$"/>
              <FieldA label="Stock on hand" value={form.stock} onChange={v => set('stock', +v)}/>
            </Grid>
          </FormSection>

          <FormSection title="Visibility" dark={dark}>
            <div style={{ display: 'flex', gap: 8 }}>
              {['published', 'draft'].map(s => (
                <button key={s} onClick={() => set('status', s)} className={'admin-btn ' + (form.status === s ? '' : 'admin-btn-secondary')}>
                  {form.status === s && <Icon.Check/>}{s}
                </button>
              ))}
            </div>
          </FormSection>
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, children, dark }) {
  return (
    <div className="admin-card" style={{ padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  );
}
function Grid({ cols, children }) { return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>{children}</div>; }
function FieldA({ label, value, onChange, type = 'text', options, mono, prefix }) {
  return (
    <div>
      <div className="label">{label}</div>
      {type === 'textarea' ? (
        <textarea className="admin-input" rows={4} value={value || ''} onChange={e => onChange?.(e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }}/>
      ) : type === 'select' ? (
        <select className="admin-input" value={value} onChange={e => onChange?.(e.target.value)}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <div style={{ position: 'relative' }}>
          {prefix && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--a-text-3)' }}>{prefix}</span>}
          <input className="admin-input" value={value || ''} onChange={e => onChange?.(e.target.value)} style={{ paddingLeft: prefix ? 24 : 12, fontFamily: mono ? 'monospace' : 'inherit' }}/>
        </div>
      )}
    </div>
  );
}

// ───────── Customers ─────────
function AdminCustomers({ navigate, dark, setDark }) {
  const [search, setSearch] = uS7('');
  const [country, setCountry] = uS7('all');

  const filtered = D7.customers.filter(c =>
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())) &&
    (country === 'all' || c.country === country)
  );

  return (
    <window.AdminShell route="/admin/customers" navigate={navigate} dark={dark} setDark={setDark}>
      <window.AdminHeader title="Customers" subtitle={`${D7.stats.totalCustomers.toLocaleString()} customers · 23% repeat rate · $266 avg order`} dark={dark}
        actions={<>
          <button className="admin-btn admin-btn-secondary"><Icon.Download/> Export</button>
          <button className="admin-btn"><Icon.Plus/> Add Customer</button>
        </>}
      />
      <div style={{ padding: '24px 40px' }}>
        {/* Cohort cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'New this month', value: '347', delta: '+18%' },
            { label: 'Returning', value: '1,572', delta: '+4%' },
            { label: 'VIP (5+ orders)', value: '284', delta: '+12%' },
            { label: 'At-risk', value: '92', delta: '−6%', danger: true },
          ].map(s => (
            <div key={s.label} className="admin-card" style={{ padding: 18 }}>
              <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 600 }}>{s.value}</span>
                <span className={'badge badge-' + (s.danger ? 'danger' : 'success')} style={{ fontSize: 10 }}>{s.delta}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="admin-card" style={{ padding: 14, marginBottom: 20, display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Icon.Search width={13} height={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}/>
            <input className="admin-input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30 }}/>
          </div>
          <select value={country} onChange={e => setCountry(e.target.value)} className="admin-input" style={{ width: 160 }}>
            <option value="all">All countries</option>
            <option value="United States">🇺🇸 United States</option>
            <option value="United Kingdom">🇬🇧 United Kingdom</option>
            <option value="Germany">🇩🇪 Germany</option>
          </select>
        </div>

        <div className="admin-card" style={{ overflow: 'hidden' }}>
          <table className="admin-table">
            <thead><tr><th>Customer</th><th>Country</th><th style={{textAlign:'right'}}>Orders</th><th style={{textAlign:'right'}}>Lifetime</th><th style={{textAlign:'right'}}>Avg Order</th><th>Last Order</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="clickable" onClick={() => navigate('/admin/customers/' + c.id)}>
                  <td>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #b8895c, #3a2a1f)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 11 }}>{c.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{c.name}</div>
                        <div style={{ fontSize: 11.5, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.flag} {c.city}</td>
                  <td style={{ textAlign: 'right' }}>{c.orders}</td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>${c.total.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>${(c.total / c.orders).toFixed(0)}</td>
                  <td style={{ color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', fontSize: 12.5 }}>{c.lastOrder}</td>
                  <td>
                    {c.orders >= 8 ? <span className="badge badge-success"><Icon.Star width={9} height={9}/>VIP</span>
                     : c.orders >= 4 ? <span className="badge badge-info">Returning</span>
                     : <span className="badge badge-neutral">New</span>}
                  </td>
                  <td><Icon.ChevRight style={{ color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </window.AdminShell>
  );
}
window.AdminCustomers = AdminCustomers;

// ───────── Customer Detail ─────────
function AdminCustomerDetail({ navigate, dark, setDark, customerId }) {
  const c = D7.customers.find(x => x.id === +customerId) || D7.customers[0];
  const customerOrders = D7.orders.filter(o => o.customer.id === c.id);
  const orderHistory = customerOrders.length > 0 ? customerOrders : D7.orders.slice(0, 5);

  return (
    <window.AdminShell route="/admin/customers" navigate={navigate} dark={dark} setDark={setDark}>
      <window.AdminHeader
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="admin-btn admin-btn-secondary" style={{ padding: 7 }} onClick={() => navigate('/admin/customers')}><Icon.ArrowLeft/></button>
            <span>{c.name}</span>
            {c.orders >= 8 && <span className="badge badge-success"><Icon.Star width={9} height={9}/>VIP</span>}
          </div>
        }
        subtitle={`${c.flag} ${c.city} · Customer since 2024`}
        dark={dark}
        actions={<>
          <button className="admin-btn admin-btn-secondary"><Icon.Mail/> Send Email</button>
          <button className="admin-btn"><Icon.Edit/> Edit Customer</button>
        </>}
      />
      <div style={{ padding: '24px 40px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { k: 'Total Orders', v: c.orders },
              { k: 'Lifetime Value', v: '$' + c.total.toLocaleString() },
              { k: 'Avg. Order', v: '$' + (c.total / c.orders).toFixed(0) },
              { k: 'Last Active', v: c.lastOrder },
            ].map(s => (
              <div key={s.k} className="admin-card" style={{ padding: 18 }}>
                <div style={{ fontSize: 11.5, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', marginBottom: 6 }}>{s.k}</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Order history */}
          <div className="admin-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)') }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Order History</div>
              <span style={{ fontSize: 12, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>{c.orders} orders</span>
            </div>
            <table className="admin-table">
              <thead><tr><th>Order</th><th>Items</th><th style={{textAlign:'right'}}>Total</th><th>Status</th><th>Placed</th><th></th></tr></thead>
              <tbody>
                {orderHistory.map(o => (
                  <tr key={o.id} className="clickable" onClick={() => navigate('/admin/orders/' + o.id)}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{o.orderNo}</td>
                    <td>{o.items.reduce((a,i)=>a+i.qty,0)} item(s)</td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>${o.total.toFixed(2)}</td>
                    <td><StatusBadge status={o.status}/></td>
                    <td style={{ color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>{o.date}</td>
                    <td><Icon.ChevRight style={{ color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="admin-card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #b8895c, #3a2a1f)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 18, margin: '0 auto 12px' }}>{c.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', marginTop: 4 }}>Customer ID #{c.id.toString().padStart(5, '0')}</div>
          </div>
          <div className="admin-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12.5, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', fontWeight: 500, marginBottom: 12 }}>Contact</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Icon.Mail/> {c.email}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Icon.Phone/> {c.phone}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Icon.Pin/> {c.city}, {c.country}</span>
            </div>
          </div>
          <div className="admin-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12.5, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', fontWeight: 500, marginBottom: 12 }}>Tags</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['VIP', 'High AOV', 'Toupee buyer', 'Wholesale lead'].slice(0, c.orders >= 8 ? 4 : 2).map(t => (
                <span key={t} className="badge badge-neutral">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </window.AdminShell>
  );
}
window.AdminCustomerDetail = AdminCustomerDetail;
