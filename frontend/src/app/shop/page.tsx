'use client';
import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Nav } from '@/components/store/Nav';
import { Footer } from '@/components/store/Footer';
import { ProductCard } from '@/components/store/ProductCard';
import { Icon } from '@/components/icons';
import { LEDARISE_DATA } from '@/lib/data';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import type { Product } from '@/lib/types';

const { COLORS, LENGTHS, MATERIALS, CATEGORIES } = LEDARISE_DATA;

interface Filters {
  category: string;
  colors: string[];
  lengths: string[];
  materials: string[];
  minPrice: number;
  maxPrice: number;
  sort: string;
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--line-soft)' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 14, color: 'var(--ink)' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </div>
  );
}

function CheckLabel({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) {
  return (
    <label onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, cursor: 'pointer', padding: '4px 0', color: 'var(--ink-3)' }}>
      <span style={{
        width: 14, height: 14, border: '1px solid ' + (checked ? 'var(--ink)' : 'var(--line)'),
        background: checked ? 'var(--ink)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && <Icon.Check width={9} height={9} style={{ color: 'var(--ivory)' }} />}
      </span>
      {label}
    </label>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialKeyword = searchParams.get('q') || '';

  const [filters, setFilters] = useState<Filters>({
    category: initialCategory,
    colors: [],
    lengths: [],
    materials: [],
    minPrice: 0,
    maxPrice: 700,
    sort: 'featured',
  });
  const [keyword, setKeyword] = useState(initialKeyword);

  // Map frontend sort values to backend sort param
  const backendSort = useMemo(() => {
    if (filters.sort === 'best') return 'best_seller';
    if (filters.sort === 'price_asc') return 'price_asc';
    if (filters.sort === 'price_desc') return 'price_desc';
    return 'newest';
  }, [filters.sort]);

  const fetchFn = useCallback(
    () =>
      api.publicProducts
        .list({
          page_size: 100,
          category: filters.category !== 'all' ? filters.category : undefined,
          max_price: filters.maxPrice < 700 ? filters.maxPrice : undefined,
          min_price: filters.minPrice > 0 ? filters.minPrice : undefined,
          keyword: keyword.trim() || undefined,
          sort: backendSort,
        })
        .then((r) => r.list),
    [filters.category, filters.maxPrice, filters.minPrice, backendSort, keyword],
  );

  const { data, loading, error } = useFetch<Product[]>(fetchFn, [fetchFn]);

  // Client-side filter for color/length/material (multi-select not supported by backend)
  const filtered = useMemo(() => {
    let list: Product[] = data ?? [];
    if (filters.colors.length) list = list.filter(p => filters.colors.includes(p.color));
    if (filters.lengths.length) list = list.filter(p => filters.lengths.includes(p.length));
    if (filters.materials.length) list = list.filter(p => filters.materials.includes(p.material));
    return list;
  }, [data, filters.colors, filters.lengths, filters.materials]);

  const toggle = (key: 'colors' | 'lengths' | 'materials', val: string) => {
    setFilters(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val] }));
  };

  return (
    <div className="store">
      <Nav />

      <section style={{ padding: '56px 32px 32px', borderBottom: '1px solid var(--line-soft)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div className="eyebrow">Collection</div>
          <h1 className="serif" style={{ fontSize: 56, margin: '12px 0 8px', letterSpacing: '-0.01em' }}>All Hair Systems</h1>
          <p style={{ color: 'var(--ink-4)', fontSize: 14 }}>{filtered.length} systems shown · Hand-tied in our atelier</p>
          <div style={{ marginTop: 20, display: 'flex', gap: 8, maxWidth: 480 }}>
            <input
              type="text"
              placeholder="Search by name, SKU, color..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{
                flex: 1, padding: '10px 14px', fontSize: 13.5,
                border: '1px solid var(--line-soft)', background: 'white',
                color: 'var(--ink)', fontFamily: 'inherit', outline: 'none',
              }}
            />
            {keyword && (
              <button onClick={() => setKeyword('')} style={{
                padding: '10px 16px', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
                background: 'transparent', border: '1px solid var(--line-soft)', cursor: 'pointer',
                color: 'var(--ink-2)', fontFamily: 'inherit',
              }}>Clear</button>
            )}
          </div>
        </div>
      </section>

      <section style={{ padding: '24px 32px', borderBottom: '1px solid var(--line-soft)', background: 'var(--paper)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['all', ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setFilters(f => ({ ...f, category: c }))} style={{
              padding: '8px 18px', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
              border: '1px solid ' + (filters.category === c ? 'var(--ink)' : 'var(--line)'),
              background: filters.category === c ? 'var(--ink)' : 'transparent',
              color: filters.category === c ? 'var(--ivory)' : 'var(--ink)',
              cursor: 'pointer', borderRadius: 0, fontWeight: 500,
            }}>{c === 'all' ? 'All' : c}</button>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '40px 32px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 48 }}>
        <aside style={{ position: 'sticky', top: 140, alignSelf: 'flex-start' }}>
          <FilterGroup title="Price">
            <div style={{ padding: '8px 4px' }}>
              <input type="range" min="0" max="700" step="10" value={filters.maxPrice}
                onChange={e => setFilters(f => ({ ...f, maxPrice: +e.target.value }))}
                style={{ width: '100%', accentColor: 'var(--gold)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}>
                <span>$0</span><span>up to ${filters.maxPrice}</span>
              </div>
            </div>
          </FilterGroup>
          <FilterGroup title="Color">
            {COLORS.map(c => (
              <CheckLabel key={c} checked={filters.colors.includes(c)} onClick={() => toggle('colors', c)} label={c} />
            ))}
          </FilterGroup>
          <FilterGroup title="Length">
            {LENGTHS.map(c => (
              <CheckLabel key={c} checked={filters.lengths.includes(c)} onClick={() => toggle('lengths', c)} label={c} />
            ))}
          </FilterGroup>
          <FilterGroup title="Cap Material">
            {MATERIALS.map(c => (
              <CheckLabel key={c} checked={filters.materials.includes(c)} onClick={() => toggle('materials', c)} label={c} />
            ))}
          </FilterGroup>
        </aside>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>{loading ? 'Loading...' : `${filtered.length} results`}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--ink-4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Sort</span>
              <select value={filters.sort} onChange={e => setFilters(f => ({...f, sort: e.target.value}))} style={{
                padding: '8px 28px 8px 12px', fontSize: 13, border: '1px solid var(--line)',
                background: 'transparent', borderRadius: 0, fontFamily: 'inherit', cursor: 'pointer',
              }}>
                <option value="featured">Featured</option>
                <option value="best">Best Sellers</option>
                <option value="price_asc">Price · Low to High</option>
                <option value="price_desc">Price · High to Low</option>
              </select>
            </div>
          </div>
          {error && (
            <div style={{ padding: 16, background: '#fef2f2', color: '#dc2626', borderRadius: 4, marginBottom: 24 }}>
              Failed to load: {error}
            </div>
          )}
          {!loading && !error && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="store"><Nav /></div>}>
      <ShopContent />
    </Suspense>
  );
}
