'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/Shell';
import { AdminHeader } from '@/components/admin/Header';
import { RequireAuth } from '@/components/admin/RequireAuth';
import { Icon } from '@/components/icons';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { useAdminTheme } from '@/lib/adminTheme';
import type { Customer } from '@/lib/types';

export default function AdminCustomersPage() {
  const router = useRouter();
  const { dark } = useAdminTheme();
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('all');

  const fetchCustomers = useCallback(
    () =>
      api.customers.list({
        page_size: 100,
        keyword: search || undefined,
        country: country !== 'all' ? country : undefined,
      }),
    [search, country],
  );

  const { data, loading, error } = useFetch(fetchCustomers, [fetchCustomers]);
  const customers: Customer[] = data?.list ?? [];

  return (
    <RequireAuth>
      <AdminShell>
        <AdminHeader
          title="Customers"
          subtitle={`${data?.total ?? customers.length} customers`}
        />
        <div style={{ padding: '24px 40px' }}>
          {/* Cohort cards — static summary */}
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
              <Icon.Search width={13} height={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }} />
              <input className="admin-input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30 }} />
            </div>
            <select value={country} onChange={e => setCountry(e.target.value)} className="admin-input" style={{ width: 160 }}>
              <option value="all">All countries</option>
              <option value="United States">🇺🇸 United States</option>
              <option value="United Kingdom">🇬🇧 United Kingdom</option>
              <option value="Germany">🇩🇪 Germany</option>
            </select>
          </div>

          {error && (
            <div style={{ padding: 16, background: '#fef2f2', color: '#dc2626', borderRadius: 4, marginBottom: 16 }}>
              Failed to load customers: {error}
            </div>
          )}

          <div className="admin-card" style={{ overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', fontSize: 13 }}>Loading customers...</div>
            ) : (
              <table className="admin-table">
                <thead><tr><th>Customer</th><th>Country</th><th style={{ textAlign: 'right' }}>Orders</th><th style={{ textAlign: 'right' }}>Lifetime</th><th style={{ textAlign: 'right' }}>Avg Order</th><th>Last Order</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id} className="clickable" onClick={() => router.push('/admin/customers/' + c.id)}>
                      <td>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #b8895c, #3a2a1f)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 11 }}>
                            {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{c.name}</div>
                            <div style={{ fontSize: 11.5, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{c.flag} {c.city || c.country}</td>
                      <td style={{ textAlign: 'right' }}>{c.orders}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>${c.total.toLocaleString()}</td>
                      <td style={{ textAlign: 'right' }}>{c.orders > 0 ? `$${(c.total / c.orders).toFixed(0)}` : '—'}</td>
                      <td style={{ color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', fontSize: 12.5 }}>{c.lastOrder || '—'}</td>
                      <td>
                        {c.orders >= 8 ? <span className="badge badge-success"><Icon.Star width={9} height={9} />VIP</span>
                          : c.orders >= 4 ? <span className="badge badge-info">Returning</span>
                            : <span className="badge badge-neutral">New</span>}
                      </td>
                      <td><Icon.ChevRight style={{ color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </AdminShell>
    </RequireAuth>
  );
}
