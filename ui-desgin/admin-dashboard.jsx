/* global React, Icon, MiniSpark */
const D5 = window.LEDARISE_DATA;
const { useState: uS5, useMemo: uM5 } = React;

// ───────── Dashboard ─────────
function AdminDashboard({ navigate, dark, setDark }) {
  const [range, setRange] = uS5('30d');
  const stats = D5.stats;
  const trend = D5.revenueTrend;
  const totalRev = trend.reduce((a, b) => a + b.total, 0);
  const totalOrders = trend.reduce((a, b) => a + b.orders, 0);
  const totalShipping = trend.reduce((a, b) => a + b.shipping, 0);
  const totalQty = trend.reduce((a, b) => a + b.orders, 0) * 1.6 | 0;

  return (
    <window.AdminShell route="/admin/dashboard" navigate={navigate} dark={dark} setDark={setDark}>
      <window.AdminHeader title="Dashboard" subtitle={`Tuesday, April 28, 2026 · ${stats.ordersToday} new orders today`} dark={dark}
        actions={
          <>
            <div style={{ display: 'inline-flex', borderRadius: 8, border: '1px solid ' + (dark ? 'var(--ad-border-2)' : 'var(--a-border-2)'), overflow: 'hidden' }}>
              {['7d', '30d', '90d', 'YTD'].map(r => (
                <button key={r} onClick={() => setRange(r)} style={{
                  padding: '7px 14px', fontSize: 12.5, fontWeight: 500, border: 'none', cursor: 'pointer',
                  background: range === r ? (dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)') : 'transparent',
                  color: 'inherit', fontFamily: 'inherit',
                }}>{r}</button>
              ))}
            </div>
            <button className="admin-btn admin-btn-secondary"><Icon.Download /> Export</button>
            <button className="admin-btn"><Icon.Plus /> New Order</button>
          </>
        }
      />

      <div style={{ padding: '32px 40px' }}>
        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
          {[
            { label: 'Revenue', value: '$' + totalRev.toLocaleString(), delta: '+12.4%', up: true, color: '#16a34a', spark: trend.map(d => d.total) },
            { label: 'Shipping Income', value: '$' + totalShipping.toLocaleString(), delta: '+8.1%', up: true, color: '#2563eb', spark: trend.map(d => d.shipping) },
            { label: 'Items Shipped', value: totalQty.toLocaleString(), delta: '+5.6%', up: true, color: '#b8895c', spark: trend.map(d => d.orders * 1.6) },
            { label: 'Orders', value: totalOrders.toLocaleString(), delta: '−2.1%', up: false, color: '#dc2626', spark: trend.map(d => d.orders) },
          ].map((k, i) => (
            <div key={i} className="admin-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 12.5, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', fontWeight: 500 }}>{k.label}</span>
                <span className={'badge badge-' + (k.up ? 'success' : 'danger')} style={{ fontSize: 11 }}>
                  {k.up ? <Icon.TrendUp width={10} height={10}/> : <Icon.TrendDown width={10} height={10}/>}
                  {k.delta}
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>{k.value}</div>
              <div style={{ height: 32 }}><MiniSpark values={k.spark} color={k.color} height={32} /></div>
            </div>
          ))}
        </div>

        {/* Revenue chart + Country split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 32 }}>
          <div className="admin-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 13, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', marginBottom: 4 }}>Revenue Trend</div>
                <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>${totalRev.toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                <Legend color="#b8895c" label="US" />
                <Legend color="#3a2a1f" label="UK" />
                <Legend color="#d6b07e" label="DE" />
              </div>
            </div>
            <RevenueChart data={trend} dark={dark} />
          </div>
          <div className="admin-card" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', marginBottom: 4 }}>Country Distribution</div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 24 }}>{stats.totalOrders.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 400, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}>orders lifetime</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {D5.countryDist.map(c => (
                <div key={c.code}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14 }}>{c.flag}</span>
                      <span style={{ fontWeight: 500 }}>{c.name}</span>
                    </span>
                    <span style={{ color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}>{c.orders.toLocaleString()} · {c.share}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)' }}>
                    <div style={{ width: c.share + '%', height: '100%', borderRadius: 3, background: c.code === 'US' ? '#b8895c' : c.code === 'GB' ? '#3a2a1f' : '#d6b07e' }} />
                  </div>
                  <div style={{ fontSize: 11, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', marginTop: 4 }}>${(c.revenue / 1000).toFixed(0)}K revenue</div>
                </div>
              ))}
            </div>
            <button className="admin-btn admin-btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 24 }}>View Geo Report</button>
          </div>
        </div>

        {/* Top SKUs + Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 32 }}>
          <div className="admin-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Top SKUs by Quantity</div>
              <a onClick={() => navigate('/admin/products')} style={{ fontSize: 12, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>View all <Icon.ChevRight /></a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {D5.topSkus.map((s, i) => (
                <div key={s.sku} style={{ display: 'grid', gridTemplateColumns: '24px 36px 1fr 80px 80px', gap: 14, alignItems: 'center', padding: '10px 0', borderBottom: i < 5 ? '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)') : 'none' }}>
                  <span style={{ fontSize: 12, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', fontFamily: 'monospace' }}>0{i+1}</span>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: s.tone, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: '20% 25%', borderRadius: '50% 50% 40% 40%', background: s.accent }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', fontFamily: 'monospace' }}>{s.sku}</div>
                  </div>
                  <div style={{ fontSize: 13, textAlign: 'right' }}>{s.qty}</div>
                  <div style={{ fontSize: 13, textAlign: 'right', fontWeight: 500 }}>${(s.revenue / 1000).toFixed(0)}K</div>
                </div>
              ))}
            </div>
          </div>
          <div className="admin-card" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: <Icon.Plus/>, title: 'Add new product', desc: 'Publish a new SKU to the catalog', action: () => navigate('/admin/products?new=1') },
                { icon: <Icon.Upload/>, title: 'Import historical orders', desc: 'Upload .xlsx of past orders', action: () => navigate('/admin/orders?import=1') },
                { icon: <Icon.Receipt/>, title: 'View pending orders', desc: '14 awaiting fulfillment', action: () => navigate('/admin/orders') },
                { icon: <Icon.Users/>, title: 'Customer insights', desc: 'Lifetime value & repeat rate', action: () => navigate('/admin/customers') },
              ].map((a, i) => (
                <button key={i} onClick={a.action} style={{
                  display: 'grid', gridTemplateColumns: '32px 1fr 14px', gap: 12, alignItems: 'center',
                  padding: '12px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  background: dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)',
                  border: 'none', color: 'inherit', fontFamily: 'inherit',
                }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: dark ? 'var(--ad-bg)' : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: dark ? 'var(--ad-text)' : 'var(--a-text)',
                  }}>{a.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.title}</div>
                    <div style={{ fontSize: 11.5, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>{a.desc}</div>
                  </div>
                  <Icon.ChevRight />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="admin-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)') }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Recent Orders</div>
              <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', marginTop: 2 }}>Last 10 placed</div>
            </div>
            <a onClick={() => navigate('/admin/orders')} style={{ fontSize: 12.5, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>View all <Icon.ChevRight /></a>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th><th>Customer</th><th>Country</th><th>Items</th><th>Total</th><th>Status</th><th>Placed</th><th></th>
              </tr>
            </thead>
            <tbody>
              {D5.orders.slice(0, 8).map(o => (
                <tr key={o.id} className="clickable" onClick={() => navigate('/admin/orders/' + o.id)}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{o.orderNo}</td>
                  <td style={{ fontWeight: 500 }}>{o.customer.name}</td>
                  <td>{o.customer.flag} {o.customer.country}</td>
                  <td>{o.items.reduce((a,i)=>a+i.qty,0)}</td>
                  <td style={{ fontWeight: 500 }}>${o.total.toFixed(2)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td style={{ color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>{o.date}</td>
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
window.AdminDashboard = AdminDashboard;

function Legend({ color, label }) {
  return <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: color }}/>{label}</span>;
}
function StatusBadge({ status }) {
  const map = { complete: 'success', processing: 'info', pending: 'warning', cancelled: 'danger' };
  return <span className={'badge badge-' + map[status]}><span className="badge-dot" style={{ background: 'currentColor' }}/>{status}</span>;
}
window.StatusBadge = StatusBadge;

function RevenueChart({ data, dark }) {
  const w = 720, h = 220, p = { l: 40, r: 16, t: 16, b: 24 };
  const innerW = w - p.l - p.r, innerH = h - p.t - p.b;
  const max = Math.max(...data.map(d => d.total));
  const x = (i) => p.l + (i / (data.length - 1)) * innerW;
  const y = (v) => p.t + innerH - (v / max) * innerH;
  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.total)}`).join(' ');
  const areaPath = linePath + ` L ${x(data.length-1)} ${p.t + innerH} L ${x(0)} ${p.t + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="revArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#b8895c" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#b8895c" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* grid */}
      {[0, 0.25, 0.5, 0.75, 1].map(t => (
        <g key={t}>
          <line x1={p.l} x2={w-p.r} y1={p.t + innerH * t} y2={p.t + innerH * t} stroke={dark ? '#1f1f1f' : '#ececec'} strokeDasharray="2 4" />
          <text x={p.l - 8} y={p.t + innerH * t + 4} textAnchor="end" fontSize="10" fill={dark ? '#6b6b6b' : '#8e8e8e'}>${((max * (1-t))/1000).toFixed(0)}K</text>
        </g>
      ))}
      {/* x labels */}
      {data.filter((_, i) => i % 5 === 0).map((d, j, arr) => {
        const i = data.indexOf(d);
        return <text key={i} x={x(i)} y={h - 6} textAnchor="middle" fontSize="10" fill={dark ? '#6b6b6b' : '#8e8e8e'}>{d.date}</text>;
      })}
      <path d={areaPath} fill="url(#revArea)" />
      <path d={linePath} fill="none" stroke="#b8895c" strokeWidth="2" />
      {data.map((d, i) => i % 3 === 0 && (
        <circle key={i} cx={x(i)} cy={y(d.total)} r="2.5" fill="#b8895c" />
      ))}
    </svg>
  );
}
