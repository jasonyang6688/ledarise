/* global React, Icon, Stars, ProductSwatch, useCart, ProductCard */
const D2 = window.LEDARISE_DATA;
const { useState: uS2, useMemo: uM2, useEffect: uE2 } = React;

// ───────── SHOP ─────────
function StoreShop({ navigate, query }) {
  const [filters, setFilters] = uS2({
    category: query.category || 'all',
    colors: [],
    lengths: [],
    materials: [],
    minPrice: 0,
    maxPrice: 700,
    sort: 'featured',
  });

  const filtered = uM2(() => {
    let list = D2.products.slice();
    if (filters.category !== 'all') list = list.filter(p => p.category === filters.category);
    if (filters.colors.length) list = list.filter(p => filters.colors.includes(p.color));
    if (filters.lengths.length) list = list.filter(p => filters.lengths.includes(p.length));
    if (filters.materials.length) list = list.filter(p => filters.materials.includes(p.material));
    list = list.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);
    if (filters.sort === 'price_asc') list.sort((a,b)=>a.price-b.price);
    else if (filters.sort === 'price_desc') list.sort((a,b)=>b.price-a.price);
    else if (filters.sort === 'best') list.sort((a,b)=>b.sales-a.sales);
    return list;
  }, [filters]);

  const toggle = (key, val) => {
    setFilters(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val] }));
  };

  return (
    <div className="store">
      <window.StoreNav route="/shop" navigate={navigate} cartCount={useCart().count()} />

      {/* Header */}
      <section style={{ padding: '56px 32px 32px', borderBottom: '1px solid var(--line-soft)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div className="eyebrow">Collection</div>
          <h1 className="serif" style={{ fontSize: 56, margin: '12px 0 8px', letterSpacing: '-0.01em' }}>All Hair Systems</h1>
          <p style={{ color: 'var(--ink-4)', fontSize: 14 }}>{filtered.length} of {D2.products.length} systems · Hand-tied in our atelier</p>
        </div>
      </section>

      {/* Category pills */}
      <section style={{ padding: '24px 32px', borderBottom: '1px solid var(--line-soft)', background: 'var(--paper)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['all', ...D2.CATEGORIES].map(c => (
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
        {/* Sidebar filters */}
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
            {D2.COLORS.map(c => (
              <CheckLabel key={c} checked={filters.colors.includes(c)} onClick={() => toggle('colors', c)} label={c} />
            ))}
          </FilterGroup>
          <FilterGroup title="Length">
            {D2.LENGTHS.map(c => (
              <CheckLabel key={c} checked={filters.lengths.includes(c)} onClick={() => toggle('lengths', c)} label={c} />
            ))}
          </FilterGroup>
          <FilterGroup title="Cap Material">
            {D2.MATERIALS.map(c => (
              <CheckLabel key={c} checked={filters.materials.includes(c)} onClick={() => toggle('materials', c)} label={c} />
            ))}
          </FilterGroup>
        </aside>

        {/* Grid */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>{filtered.length} results</div>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {filtered.map(p => <ProductCard key={p.id} product={p} navigate={navigate} />)}
          </div>
        </div>
      </div>

      <window.StoreFooter />
    </div>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--line-soft)' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 14, color: 'var(--ink)' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </div>
  );
}
function CheckLabel({ checked, onClick, label }) {
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
window.StoreShop = StoreShop;

// ───────── PRODUCT DETAIL ─────────
function StoreProduct({ navigate, productId }) {
  const product = D2.products.find(p => p.id === +productId) || D2.products[0];
  const [color, setColor] = uS2(product.color);
  const [qty, setQty] = uS2(1);
  const [thumb, setThumb] = uS2(0);
  const cart = useCart();
  const related = D2.products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="store">
      <window.StoreNav route="/product" navigate={navigate} cartCount={cart.count()} />

      {/* Breadcrumb */}
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '24px 32px', fontSize: 12, color: 'var(--ink-4)', letterSpacing: '0.06em' }}>
        <a onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>HOME</a>
        <span style={{ margin: '0 8px' }}>/</span>
        <a onClick={() => navigate('/shop')} style={{ cursor: 'pointer' }}>SHOP</a>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--ink)' }}>{product.name.toUpperCase()}</span>
      </div>

      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '0 32px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
        {/* Gallery */}
        <div>
          <div style={{ background: product.tone, marginBottom: 12, position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
            <ProductSwatch product={product} size="lg" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[0,1,2,3].map(i => (
              <div key={i} onClick={() => setThumb(i)} style={{
                aspectRatio: '1/1', cursor: 'pointer',
                border: thumb === i ? '1px solid var(--ink)' : '1px solid var(--line)',
                background: product.tone, position: 'relative', overflow: 'hidden',
              }}>
                <ProductSwatch product={product} size="lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={{ paddingTop: 8 }}>
          <div className="eyebrow" style={{ color: 'var(--gold-2)' }}>{product.material}</div>
          <h1 className="serif" style={{ fontSize: 48, margin: '12px 0 12px', letterSpacing: '-0.01em' }}>{product.name}</h1>
          <p style={{ fontSize: 16, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 20, fontStyle: 'italic' }}>{product.tagline}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <Stars value={product.rating} size={14} />
            <span style={{ fontSize: 12.5, color: 'var(--ink-4)' }}>{product.rating} · {product.reviews} reviews</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '20px 0', borderBottom: '1px solid var(--line)' }}>
            <span className="serif" style={{ fontSize: 36 }}>${product.price}</span>
            {product.originalPrice > product.price && (
              <>
                <span style={{ fontSize: 18, color: 'var(--ink-4)', textDecoration: 'line-through' }}>${product.originalPrice}</span>
                <span style={{ fontSize: 11, padding: '4px 10px', background: 'var(--gold)', color: 'white', letterSpacing: '0.1em' }}>SAVE ${product.originalPrice - product.price}</span>
              </>
            )}
          </div>

          {/* Color selector */}
          <div style={{ padding: '24px 0', borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="eyebrow">Color</span>
              <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{color}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {D2.COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{
                  padding: '8px 14px', fontSize: 12,
                  border: '1px solid ' + (color === c ? 'var(--ink)' : 'var(--line)'),
                  background: color === c ? 'var(--ink)' : 'transparent',
                  color: color === c ? 'var(--ivory)' : 'var(--ink-3)',
                  cursor: 'pointer', borderRadius: 0, fontFamily: 'inherit',
                }}>{c}</button>
              ))}
            </div>
          </div>

          {/* Quantity + CTA */}
          <div style={{ padding: '24px 0', display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--ink)' }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '13px 16px', background: 'transparent', border: 'none', cursor: 'pointer' }}><Icon.Minus /></button>
              <span style={{ padding: '0 20px', minWidth: 40, textAlign: 'center', fontWeight: 500 }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} style={{ padding: '13px 16px', background: 'transparent', border: 'none', cursor: 'pointer' }}><Icon.Plus /></button>
            </div>
            <button className="btn" style={{ flex: 1 }} onClick={() => { cart.add(product, qty); navigate('/cart'); }}>
              Add to Bag · ${(product.price * qty).toFixed(2)}
            </button>
          </div>

          {/* Features */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, padding: '20px 0', borderTop: '1px solid var(--line)' }}>
            {product.features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-3)' }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)' }} />
                {f}
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{ paddingTop: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>The Detail</div>
            <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-3)' }}>{product.description}</p>
          </div>

          {/* Specs grid */}
          <div style={{ marginTop: 32, padding: '24px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px 32px', fontSize: 13.5 }}>
              {[['SKU', product.sku],['Material', product.material],['Length', product.length],['Color', product.color],['Density', '120%'],['Knot Type', 'Single, Hand-Tied']].map(([k,v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-4)' }}>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust */}
          <div style={{ display: 'flex', gap: 24, marginTop: 24, fontSize: 12, color: 'var(--ink-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon.Truck width={14} height={14} /> Free shipping over $300</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon.Lock /> 30-day exchange</div>
          </div>
        </div>
      </section>

      {/* Related */}
      <section style={{ background: 'var(--paper)', padding: '64px 32px', borderTop: '1px solid var(--line-soft)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div className="eyebrow">You May Also Like</div>
          <h2 className="serif" style={{ fontSize: 36, margin: '12px 0 32px' }}>From the {product.category} collection</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {related.map(p => <ProductCard key={p.id} product={p} navigate={navigate} />)}
          </div>
        </div>
      </section>

      <window.StoreFooter />
    </div>
  );
}
window.StoreProduct = StoreProduct;
