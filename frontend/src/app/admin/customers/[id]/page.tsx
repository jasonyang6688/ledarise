'use client';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/Shell';
import { AdminHeader } from '@/components/admin/Header';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { RequireAuth } from '@/components/admin/RequireAuth';
import { Icon } from '@/components/icons';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { useAdminTheme } from '@/lib/adminTheme';
import type { CustomerDetail, Order } from '@/lib/types';

function CustomerDetailContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { dark } = useAdminTheme();

  const fetchCustomer = useCallback(() => api.customers.get(params.id), [params.id]);
  const { data: detail, loading, error } = useFetch<CustomerDetail>(fetchCustomer, [params.id]);
  const c = detail?.customer;

  if (loading) {
    return (
      <AdminShell>
        <div style={{ padding: 40, textAlign: 'center', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>Loading...</div>
      </AdminShell>
    );
  }

  if (error || !c) {
    return (
      <AdminShell>
        <div style={{ padding: 40 }}>
          <div style={{ padding: 16, background: '#fef2f2', color: '#dc2626', borderRadius: 4 }}>
            Failed to load: {error ?? 'Customer not found'}
          </div>
        </div>
      </AdminShell>
    );
  }

  const orders: Order[] = detail?.orders ?? [];

  return (
    <AdminShell>
      <AdminHeader
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="admin-btn admin-btn-secondary" style={{ padding: 7 }} onClick={() => router.push('/admin/customers')}><Icon.ArrowLeft /></button>
            <span>{c.name}</span>
            {c.orders >= 8 && <span className="badge badge-success"><Icon.Star width={9} height={9} />VIP</span>}
          </div>
        }
        subtitle={`${c.flag} ${c.city ? c.city + ', ' : ''}${c.country} · Customer since 2024`}
        actions={
          <>
            <button className="admin-btn admin-btn-secondary"><Icon.Mail /> Send Email</button>
            <button className="admin-btn"><Icon.Edit /> Edit Customer</button>
          </>
        }
      />
      <div style={{ padding: '24px 40px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { k: 'Total Orders', v: c.orders },
              { k: 'Lifetime Value', v: '$' + c.total.toLocaleString() },
              { k: 'Avg. Order', v: c.orders > 0 ? '$' + (c.total / c.orders).toFixed(0) : '—' },
              { k: 'Last Active', v: c.lastOrder || '—' },
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
              <thead><tr><th>Order</th><th>Items</th><th style={{ textAlign: 'right' }}>Total</th><th>Status</th><th>Placed</th><th></th></tr></thead>
              <tbody>
                {orders.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px 0', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', fontSize: 13 }}>No orders found</td></tr>
                )}
                {orders.map(o => (
                  <tr key={o.id} className="clickable" onClick={() => router.push('/admin/orders/' + o.id)}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{o.orderNo}</td>
                    <td>{o.items.reduce((a, i) => a + i.qty, 0)} item(s)</td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>${o.total.toFixed(2)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td style={{ color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>{o.date}</td>
                    <td><Icon.ChevRight style={{ color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="admin-card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #b8895c, #3a2a1f)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 18, margin: '0 auto 12px' }}>
              {(c.name || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', marginTop: 4 }}>Customer ID #{c.id != null ? String(c.id).padStart(5, '0') : '—'}</div>
          </div>
          <div className="admin-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12.5, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', fontWeight: 500, marginBottom: 12 }}>Contact</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Icon.Mail /> {c.email || '—'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Icon.Phone /> {c.phone || '—'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon.Pin />
                {[c.city, c.country].filter(Boolean).join(', ') || '—'}
              </span>
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
    </AdminShell>
  );
}

export default function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  return (
    <RequireAuth>
      <CustomerDetailContent params={params} />
    </RequireAuth>
  );
}
