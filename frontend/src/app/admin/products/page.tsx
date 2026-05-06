'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AdminShell } from '@/components/admin/Shell';
import { AdminHeader } from '@/components/admin/Header';
import { ProductEditor } from '@/components/admin/ProductEditor';
import { RequireAuth } from '@/components/admin/RequireAuth';
import { Icon } from '@/components/icons';
import { ProductSwatch } from '@/components/store/ProductSwatch';
import { LEDARISE_DATA } from '@/lib/data';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { useAdminTheme } from '@/lib/adminTheme';
import type { Product } from '@/lib/types';

const { CATEGORIES } = LEDARISE_DATA;
const PAGE_SIZE = 24;

function ProductsContent() {
  const searchParams = useSearchParams();
  const { dark } = useAdminTheme();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [view, setView] = useState('grid');
  const [cat, setCat] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<number | 'new' | null>(searchParams.get('new') === '1' ? 'new' : null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, cat, status]);

  const fetchProducts = useCallback(
    () =>
      api.products.list({
        page,
        page_size: PAGE_SIZE,
        keyword: debouncedSearch || undefined,
        category: cat !== 'all' ? cat : undefined,
        status: status !== 'all' ? status : undefined,
      }),
    [page, debouncedSearch, cat, status],
  );

  const { data, loading, error, refetch } = useFetch(fetchProducts, [fetchProducts]);
  const products: Product[] = data?.list ?? [];
  const total = data?.total ?? 0;
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
    setPage(Math.min(totalPages, Math.max(1, nextPage)));
  };

  const handleEditorClose = () => {
    setEditing(null);
    refetch();
  };

  return (
    <AdminShell>
      <AdminHeader
        title="Products"
        subtitle={`${products.length} of ${total} SKUs shown`}
        actions={
          <>
            <button className="admin-btn" onClick={() => setEditing('new')}><Icon.Plus /> New Product</button>
          </>
        }
      />

      <div style={{ padding: '24px 40px' }}>
        {/* Filters */}
        <div className="admin-card" style={{ padding: 14, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Icon.Search width={13} height={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }} />
            <input className="admin-input" placeholder="Search by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30 }} />
          </div>
          <select value={cat} onChange={e => setCat(e.target.value)} className="admin-input" style={{ width: 'auto', minWidth: 130 }}>
            <option value="all">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)} className="admin-input" style={{ width: 'auto', minWidth: 130 }}>
            <option value="all">All status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <div style={{ display: 'inline-flex', borderRadius: 8, border: '1px solid ' + (dark ? 'var(--ad-border-2)' : 'var(--a-border-2)'), overflow: 'hidden' }}>
            {[
              { v: 'grid', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /></svg> },
              { v: 'list', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="3" rx="1" /><rect x="3" y="10" width="18" height="3" rx="1" /><rect x="3" y="16" width="18" height="3" rx="1" /></svg> },
            ].map(b => (
              <button key={b.v} onClick={() => setView(b.v)} style={{ padding: '7px 11px', border: 'none', cursor: 'pointer', background: view === b.v ? (dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)') : 'transparent', color: 'inherit' }}>{b.icon}</button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ padding: 16, background: '#fef2f2', color: '#dc2626', borderRadius: 4, marginBottom: 16 }}>
            Failed to load products: {error}
          </div>
        )}

        <div className="admin-card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', fontSize: 13 }}>Loading products...</div>
          ) : view === 'grid' ? (
            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {products.map(p => (
                <div
                  key={p.id}
                  style={{
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)'),
                    borderRadius: 8,
                    background: dark ? 'var(--ad-surface)' : 'white',
                  }}
                  onClick={() => setEditing(p.id)}
                >
                  <div style={{ position: 'relative' }}>
                    <ProductSwatch product={p} />
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
            <table className="admin-table">
              <thead><tr><th></th><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Sales</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="clickable" onClick={() => setEditing(p.id)}>
                    <td>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: p.tone, position: 'relative', overflow: 'hidden' }}>
                        {p.images?.[0]?.url ? (
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              backgroundImage: `url("${p.images[0].url}")`,
                              backgroundPosition: 'center top',
                              backgroundSize: 'cover',
                            }}
                          />
                        ) : (
                          <div style={{ position: 'absolute', inset: '25% 28%', borderRadius: '50% 50% 40% 40%', background: p.accent }} />
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.sku}</td>
                    <td>{p.category}</td>
                    <td style={{ fontWeight: 500 }}>${p.price}</td>
                    <td>{p.stock}</td>
                    <td>{p.sales}</td>
                    <td><span className="badge badge-success">{p.status}</span></td>
                    <td><Icon.More /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && products.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', fontSize: 13 }}>No products found.</div>
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

      {editing !== null && (
        <ProductEditor
          productId={editing}
          onClose={handleEditorClose}
          dark={dark}
        />
      )}
    </AdminShell>
  );
}

export default function AdminProductsPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<div className="admin" style={{ minHeight: '100vh' }} />}>
        <ProductsContent />
      </Suspense>
    </RequireAuth>
  );
}
