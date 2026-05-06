'use client';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/Shell';
import { AdminHeader } from '@/components/admin/Header';
import { MiniSpark } from '@/components/admin/MiniSpark';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { RequireAuth } from '@/components/admin/RequireAuth';
import { Icon } from '@/components/icons';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { useAdminTheme } from '@/lib/adminTheme';
import type { RevenueTrendItem, CountryDist, Order } from '@/lib/types';
import type { DashboardStats } from '@/lib/api';

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
      {label}
    </span>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { dark } = useAdminTheme();

  const { data: stats, loading: statsLoading } = useFetch<DashboardStats>(
    () => api.dashboard.stats(),
    [],
  );
  const { data: trend, loading: trendLoading } = useFetch<RevenueTrendItem[]>(
    () => api.dashboard.revenueTrend(3650),
    [],
  );
  const { data: countryDist, loading: distLoading } = useFetch<CountryDist[]>(
    () => api.dashboard.countryDist(),
    [],
  );
  const { data: recentOrders, loading: ordersLoading } = useFetch<Order[]>(
    () => api.dashboard.recentOrders(),
    [],
  );

  const trendData: RevenueTrendItem[] = trend ?? [];
  const totalRev = stats?.totalRevenue ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;
  const totalShipping = stats?.shippingRevenue ?? 0;
  const totalQty = Math.floor(totalOrders * 1.6);

  const isLoading = statsLoading || trendLoading || distLoading || ordersLoading;

  return (
    <AdminShell>
      <AdminHeader
        title="Dashboard"
        subtitle={`Dashboard · ${stats?.ordersToday ?? '—'} new orders today`}
      />

      <div style={{ padding: '32px 40px' }}>
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', fontSize: 13 }}>
            Loading dashboard...
          </div>
        )}

        {!isLoading && (
          <>
            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
              {[
                { label: 'Revenue', value: '$' + totalRev.toLocaleString(), delta: '+12.4%', up: true, color: '#16a34a', spark: trendData.map(d => d.total) },
                { label: 'Shipping Income', value: '$' + totalShipping.toLocaleString(), delta: '+8.1%', up: true, color: '#2563eb', spark: trendData.map(d => d.shipping) },
                { label: 'Items Shipped', value: totalQty.toLocaleString(), delta: '+5.6%', up: true, color: '#b8895c', spark: trendData.map(d => d.orders * 1.6) },
                { label: 'Orders', value: totalOrders.toLocaleString(), delta: '−2.1%', up: false, color: '#dc2626', spark: trendData.map(d => d.orders) },
              ].map((k, i) => (
                <div key={i} className="admin-card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: 12.5, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', fontWeight: 500 }}>{k.label}</span>
                    <span className={'badge badge-' + (k.up ? 'success' : 'danger')} style={{ fontSize: 11 }}>
                      {k.up ? <Icon.TrendUp width={10} height={10} /> : <Icon.TrendDown width={10} height={10} />}
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
                <RevenueChart data={trendData} dark={dark} />
              </div>
              <div className="admin-card" style={{ padding: 24 }}>
                <div style={{ fontSize: 13, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', marginBottom: 4 }}>Country Distribution</div>
                <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 24 }}>
                  {(stats?.totalOrders ?? 0).toLocaleString()} <span style={{ fontSize: 13, fontWeight: 400, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}>orders lifetime</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {(countryDist ?? []).map(c => (
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

            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 32 }}>
              <div className="admin-card" style={{ padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Quick Actions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { icon: <Icon.Plus />, title: 'Add new product', desc: 'Publish a new SKU to the catalog', action: () => router.push('/admin/products?new=1') },
                    { icon: <Icon.Upload />, title: 'Import historical orders', desc: 'Upload .xlsx of past orders', action: () => router.push('/admin/orders?import=1') },
                    { icon: <Icon.Receipt />, title: 'View pending orders', desc: 'Awaiting fulfillment', action: () => router.push('/admin/orders') },
                    { icon: <Icon.Users />, title: 'Customer insights', desc: 'Lifetime value & repeat rate', action: () => router.push('/admin/customers') },
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
              <div /> {/* spacer */}
            </div>

            {/* Recent orders */}
            <div className="admin-card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)') }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Recent Orders</div>
                  <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', marginTop: 2 }}>Last 10 placed</div>
                </div>
                <a onClick={() => router.push('/admin/orders')} style={{ fontSize: 12.5, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>View all <Icon.ChevRight /></a>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th><th>Customer</th><th>Country</th><th>Items</th><th>Total</th><th>Status</th><th>Placed</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {(recentOrders ?? []).slice(0, 8).map(o => (
                    <tr key={o.id} className="clickable" onClick={() => router.push('/admin/orders/' + o.id)}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{o.orderNo}</td>
                      <td style={{ fontWeight: 500 }}>{o.customer.name}</td>
                      <td>{o.customer.flag} {o.customer.country}</td>
                      <td>{o.items.reduce((a, i) => a + i.qty, 0)}</td>
                      <td style={{ fontWeight: 500 }}>${o.total.toFixed(2)}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td style={{ color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>{o.date}</td>
                      <td><Icon.ChevRight style={{ color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}

export default function AdminDashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
