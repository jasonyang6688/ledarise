'use client';
import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdminShell } from '@/components/admin/Shell';
import { AdminHeader } from '@/components/admin/Header';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ImportDialog } from '@/components/admin/ImportDialog';
import { RequireAuth } from '@/components/admin/RequireAuth';
import { Icon } from '@/components/icons';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { useAdminTheme } from '@/lib/adminTheme';
import type { Order } from '@/lib/types';

const PAGE_SIZE = 100;
type PlacedSort = 'placed_desc' | 'placed_asc';

function FilterSelect({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="admin-input" style={{ width: 'auto', minWidth: 140, paddingRight: 28, cursor: 'pointer' }}>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dark } = useAdminTheme();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [country, setCountry] = useState('all');
  const [importOpen, setImportOpen] = useState(searchParams.get('import') === '1');
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [placedSort, setPlacedSort] = useState<PlacedSort>('placed_desc');

  // Debounce search input 300ms
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [search]);

  useEffect(() => {
    setPage(1);
    setSelected([]);
  }, [debouncedSearch, status, country, startDate, endDate, placedSort]);

  const fetchOrders = useCallback(
    () =>
      api.orders.list({
        page,
        page_size: PAGE_SIZE,
        keyword: debouncedSearch || undefined,
        status: status !== 'all' ? status : undefined,
        country: country !== 'all' ? country : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        sort: placedSort,
      }),
    [page, debouncedSearch, status, country, startDate, endDate, placedSort],
  );

  const { data, loading, error, refetch } = useFetch(fetchOrders, [fetchOrders]);
  const orders: Order[] = data?.list ?? [];
  const total: number = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startRow = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(currentPage * PAGE_SIZE, total);
  const canGoPrev = currentPage > 1 && !loading;
  const canGoNext = currentPage < totalPages && !loading;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const goToPage = (nextPage: number) => {
    setSelected([]);
    setPage(Math.min(totalPages, Math.max(1, nextPage)));
  };

  const togglePlacedSort = () => {
    setPlacedSort((current) => current === 'placed_desc' ? 'placed_asc' : 'placed_desc');
  };

  return (
    <AdminShell>
      <AdminHeader
        title="Orders"
        subtitle={`${orders.length} of ${total} orders shown`}
        actions={
          <>
            <button className="admin-btn admin-btn-secondary" onClick={() => setImportOpen(true)}><Icon.Upload /> Import Excel</button>
          </>
        }
      />

      <div style={{ padding: '24px 40px' }}>
        {/* Filters */}
        <div className="admin-card" style={{ padding: 14, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Icon.Search width={13} height={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }} />
            <input className="admin-input" placeholder="Search by order # or customer name..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30 }} />
          </div>
          <FilterSelect value={status} onChange={setStatus} options={[['all', 'All status'], ['complete', 'Complete'], ['processing', 'Processing'], ['pending', 'Pending'], ['cancelled', 'Cancelled']]} />
          <FilterSelect value={country} onChange={setCountry} options={[['all', 'All countries'], ['United States', '🇺🇸 US'], ['United Kingdom', '🇬🇧 UK'], ['Germany', '🇩🇪 DE']]} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon.Calendar width={13} height={13} style={{ color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }} />
            <input
              aria-label="Start date"
              className="admin-input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: 142 }}
            />
            <span style={{ color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', fontSize: 12 }}>to</span>
            <input
              aria-label="End date"
              className="admin-input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: 142 }}
            />
          </div>
          {(startDate || endDate) && (
            <button className="admin-btn admin-btn-secondary" onClick={() => { setStartDate(''); setEndDate(''); }}>
              Clear dates
            </button>
          )}
          <button className="admin-btn admin-btn-secondary"><Icon.Filter /> More</button>
        </div>

        {/* Bulk action bar */}
        {selected.length > 0 && (
          <div style={{ padding: '10px 16px', marginBottom: 12, borderRadius: 10, background: dark ? 'var(--ad-surface-2)' : 'var(--a-soft-info)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
            <span style={{ fontWeight: 500 }}>{selected.length} selected</span>
            <span style={{ flex: 1 }} />
            <button className="admin-btn admin-btn-secondary">Update status</button>
            <button className="admin-btn admin-btn-secondary" onClick={() => setSelected([])}>Clear</button>
          </div>
        )}

        {error && (
          <div style={{ padding: 16, background: '#fef2f2', color: '#dc2626', borderRadius: 4, marginBottom: 16 }}>
            Failed to load orders: {error}
          </div>
        )}

        {/* Table */}
        <div className="admin-card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', fontSize: 13 }}>Loading orders...</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input type="checkbox" checked={selected.length === orders.length && orders.length > 0}
                      onChange={e => setSelected(e.target.checked ? orders.map(o => o.id) : [])} />
                  </th>
                  <th>Order</th><th>Customer</th><th>Country</th><th>Items</th><th style={{ textAlign: 'right' }}>Total</th><th>Status</th>
                  <th>
                    <button
                      type="button"
                      onClick={togglePlacedSort}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        border: 'none',
                        background: 'transparent',
                        color: 'inherit',
                        font: 'inherit',
                        fontWeight: 600,
                        padding: 0,
                        cursor: 'pointer',
                      }}
                    >
                      Placed
                      <span style={{ fontSize: 10 }}>{placedSort === 'placed_desc' ? '↓' : '↑'}</span>
                    </button>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="clickable" onClick={() => router.push('/admin/orders/' + o.id)}>
                    <td onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.includes(o.id)} onChange={e => setSelected(s => e.target.checked ? [...s, o.id] : s.filter(x => x !== o.id))} />
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 500 }}>{o.orderNo}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{o.customer.name}</div>
                      <div style={{ fontSize: 11.5, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>{o.customer.email}</div>
                    </td>
                    <td>{o.customer.flag} {o.customer.city || o.customer.country}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex' }}>
                          {o.items.slice(0, 3).map((it, i) => (
                            <div key={i} style={{ width: 22, height: 22, borderRadius: 4, background: it.product.tone, marginLeft: i > 0 ? -6 : 0, border: '2px solid ' + (dark ? 'var(--ad-surface)' : 'white'), position: 'relative', overflow: 'hidden' }}>
                              <div style={{ position: 'absolute', inset: '25% 30%', borderRadius: '50% 50% 40% 40%', background: it.product.accent }} />
                            </div>
                          ))}
                        </div>
                        <span style={{ fontSize: 12.5 }}>{o.items.reduce((a, i) => a + i.qty, 0)}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>${o.total.toFixed(2)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td style={{ color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', fontSize: 12.5 }}>{o.date}</td>
                    <td><Icon.More style={{ color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)'), fontSize: 12.5, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}>
            <span>Showing {startRow.toLocaleString()}–{endRow.toLocaleString()} of {total.toLocaleString()}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="admin-btn admin-btn-secondary"
                disabled={!canGoPrev}
                onClick={() => goToPage(currentPage - 1)}
                style={{ padding: '5px 9px', opacity: canGoPrev ? 1 : 0.45, cursor: canGoPrev ? 'pointer' : 'not-allowed' }}
              >
                <Icon.ArrowLeft />
              </button>
              <button className="admin-btn" style={{ padding: '5px 11px', minWidth: 72 }}>
                {currentPage} / {totalPages}
              </button>
              <button
                className="admin-btn admin-btn-secondary"
                disabled={!canGoNext}
                onClick={() => goToPage(currentPage + 1)}
                style={{ padding: '5px 9px', opacity: canGoNext ? 1 : 0.45, cursor: canGoNext ? 'pointer' : 'not-allowed' }}
              >
                <Icon.ArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      {importOpen && <ImportDialog onClose={() => setImportOpen(false)} dark={dark} onCompleted={refetch} />}
    </AdminShell>
  );
}

export default function AdminOrdersPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<div className="admin" style={{ minHeight: '100vh' }} />}>
        <OrdersContent />
      </Suspense>
    </RequireAuth>
  );
}
