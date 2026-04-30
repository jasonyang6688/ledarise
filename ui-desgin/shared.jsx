/* global React */
const { useState, useEffect, useMemo, useRef } = React;

// ───────── Icon set (inline SVG, hand-tuned) ─────────
const Icon = {
  Search: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  Cart: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  User: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>,
  Heart: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  Plus: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M5 12h14M12 5v14"/></svg>,
  Minus: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M5 12h14"/></svg>,
  X: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Check: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M20 6 9 17l-5-5"/></svg>,
  ChevDown: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="m6 9 6 6 6-6"/></svg>,
  ChevRight: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="m9 18 6-6-6-6"/></svg>,
  Star: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2 15.1 8.3 22 9.3l-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z"/></svg>,
  Truck: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M5 17h14V7H5z"/><path d="M19 17h2v-3l-2-3h-3v6"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/></svg>,
  Lock: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Globe: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/></svg>,
  Award: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><circle cx="12" cy="9" r="6"/><path d="m9 14-2 8 5-3 5 3-2-8"/></svg>,
  Hand: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v9.5"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-1-5.5-2.5l-3.5-5.5c-.7-1.1-.5-2.5.5-3.2.9-.7 2.1-.5 2.8.4l1.7 2"/></svg>,
  Box: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="m21 8-9 5-9-5"/><path d="M21 8v8a2 2 0 0 1-1 1.7l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8"/><path d="m3 8 9-5 9 5"/></svg>,
  // Admin
  Dashboard: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
  Package: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="m21 8-9 5-9-5"/><path d="M21 8v8a2 2 0 0 1-1 1.7l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8"/><path d="m3 8 9-5 9 5"/></svg>,
  Receipt: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M4 2h16v20l-3-2-3 2-3-2-3 2-4-2z"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>,
  Users: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><circle cx="9" cy="8" r="4"/><path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/><circle cx="17" cy="6" r="3"/><path d="M22 18a5 5 0 0 0-5-5"/></svg>,
  Settings: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><circle cx="12" cy="12" r="3"/><path d="m19.4 15-.5.9a2 2 0 0 0 .4 2.4l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a2 2 0 0 0-2.4-.4l-.9.5a2 2 0 0 0-1.2 1.8V23a2 2 0 0 1-4 0v-.1a2 2 0 0 0-1.2-1.8l-.9-.5a2 2 0 0 0-2.4.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a2 2 0 0 0 .4-2.4l-.5-.9a2 2 0 0 0-1.8-1.2H1a2 2 0 0 1 0-4h.1a2 2 0 0 0 1.8-1.2l.5-.9a2 2 0 0 0-.4-2.4l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a2 2 0 0 0 2.4.4l.9-.5A2 2 0 0 0 10.1 1V1a2 2 0 0 1 4 0v.1a2 2 0 0 0 1.2 1.8l.9.5a2 2 0 0 0 2.4-.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a2 2 0 0 0-.4 2.4l.5.9a2 2 0 0 0 1.8 1.2H23a2 2 0 0 1 0 4h-.1a2 2 0 0 0-1.8 1.2z"/></svg>,
  Upload: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8 12 3 7 8M12 3v12"/></svg>,
  Download: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/></svg>,
  TrendUp: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M22 7 13.5 15.5 8.5 10.5 2 17M16 7h6v6"/></svg>,
  TrendDown: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M22 17 13.5 8.5 8.5 13.5 2 7M16 17h6v-6"/></svg>,
  Filter: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z"/></svg>,
  More: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" {...p}><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>,
  Edit: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>,
  Trash: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Eye: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>,
  Bell: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  Logout: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  Sun: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>,
  Moon: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>,
  ArrowRight: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  ArrowLeft: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M19 12H5M12 5l-7 7 7 7"/></svg>,
  File: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>,
  Mail: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>,
  Phone: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>,
  Pin: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Calendar: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  Sparkle: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M5.6 18.4 18.4 5.6"/></svg>,
};

window.Icon = Icon;

// ───────── Stylized wig portrait swatch ─────────
function ProductSwatch({ product, size = 'card' }) {
  const heightClass = size === 'card' ? 'aspect-[4/5]' : size === 'lg' ? 'aspect-[1/1]' : 'aspect-[3/4]';
  return (
    <div className={`${heightClass} relative w-full overflow-hidden`} style={{ background: product.tone }}>
      {/* Subtle radial light */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 70% 50% at 50% 30%, ${product.accent}33, transparent 60%)`,
      }} />
      {/* Stylized wig silhouette - top crown */}
      <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMax meet" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Skin/scalp suggestion */}
        <ellipse cx="100" cy="155" rx="50" ry="62" fill="#dcb88a" opacity="0.55" />
        {/* Hair mass — top */}
        <path
          d={`M50 130
              C 50 80, 70 55, 100 50
              C 130 55, 150 80, 150 130
              C 152 145, 155 165, 152 185
              C 145 200, 120 195, 100 195
              C 80 195, 55 200, 48 185
              C 45 165, 48 145, 50 130 Z`}
          fill={product.accent}
          opacity="0.95"
        />
        {/* Highlights/strands */}
        <path d="M65 80 Q 75 110 70 165" stroke={product.tone} strokeWidth="0.8" fill="none" opacity="0.5" />
        <path d="M85 70 Q 92 105 88 175" stroke={product.tone} strokeWidth="0.8" fill="none" opacity="0.5" />
        <path d="M115 70 Q 110 110 112 175" stroke={product.tone} strokeWidth="0.8" fill="none" opacity="0.5" />
        <path d="M135 80 Q 128 110 130 165" stroke={product.tone} strokeWidth="0.8" fill="none" opacity="0.5" />
        {/* Light highlights */}
        <path d="M75 75 Q 85 95 80 130" stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.18" />
        <path d="M120 75 Q 115 95 122 130" stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.18" />
      </svg>
      {/* SKU corner mark */}
      <div style={{
        position: 'absolute', top: 12, left: 12,
        fontSize: 10, letterSpacing: '0.15em',
        color: 'rgba(255,255,255,0.7)', fontWeight: 500,
        fontFamily: 'monospace',
      }}>{product.sku}</div>
    </div>
  );
}
window.ProductSwatch = ProductSwatch;

// Star rating display
function Stars({ value = 5, size = 12 }) {
  return (
    <div style={{ display: 'inline-flex', gap: 1, color: 'var(--gold)' }}>
      {[1,2,3,4,5].map(i => (
        <Icon.Star key={i} width={size} height={size} style={{ opacity: i <= Math.round(value) ? 1 : 0.25 }} />
      ))}
    </div>
  );
}
window.Stars = Stars;

// ───────── Storefront Navbar ─────────
function StoreNav({ route, navigate, cartCount }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--line-soft)',
      background: 'var(--ivory)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1320, margin: '0 auto',
        padding: '8px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 12, color: 'var(--ink-4)',
        letterSpacing: '0.05em',
      }}>
        <span>Free shipping on orders over $300 — US, UK, DE</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon.Globe width={12} height={12}/> EN / USD</span>
          <a onClick={() => navigate('/admin/login')} style={{ cursor: 'pointer', color: 'var(--ink-4)' }}>Admin</a>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--line-soft)' }} />
      <div style={{
        maxWidth: 1320, margin: '0 auto',
        padding: '20px 32px',
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 32,
      }}>
        <nav style={{ display: 'flex', gap: 28, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {[
            { label: 'Shop', path: '/shop' },
            { label: 'Toupees', path: '/shop?category=Toupee' },
            { label: 'Hair Systems', path: '/shop?category=Medium' },
            { label: 'Craft', path: '/about' },
          ].map(it => (
            <a key={it.label} onClick={() => navigate(it.path)} style={{
              cursor: 'pointer', color: 'var(--ink)', fontWeight: 500,
              borderBottom: route.startsWith(it.path) ? '1px solid var(--gold)' : '1px solid transparent',
              paddingBottom: 4,
            }}>{it.label}</a>
          ))}
        </nav>
        <a onClick={() => navigate('/')} style={{
          cursor: 'pointer', textAlign: 'center',
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 30, fontWeight: 500, letterSpacing: '0.32em',
          color: 'var(--ink)',
        }}>LEDARISE</a>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18, alignItems: 'center', color: 'var(--ink)' }}>
          <Icon.Search style={{ cursor: 'pointer' }} />
          <Icon.User style={{ cursor: 'pointer' }} />
          <Icon.Heart style={{ cursor: 'pointer' }} />
          <a onClick={() => navigate('/cart')} style={{ cursor: 'pointer', position: 'relative', color: 'inherit' }}>
            <Icon.Cart />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -8,
                background: 'var(--gold)', color: 'white',
                width: 16, height: 16, borderRadius: 8,
                fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600,
              }}>{cartCount}</span>
            )}
          </a>
        </div>
      </div>
    </header>
  );
}
window.StoreNav = StoreNav;

function StoreFooter() {
  return (
    <footer style={{
      background: 'var(--ink)',
      color: 'var(--ivory)',
      marginTop: 80,
      padding: '64px 32px 32px',
    }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48,
          paddingBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 28, letterSpacing: '0.32em', marginBottom: 16,
            }}>LEDARISE</div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13.5, lineHeight: 1.7, maxWidth: 360 }}>
              Hand-tied hair systems for the considered gentleman. Built one knot at a time, in our atelier, since 2018.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              {['United States 🇺🇸', 'United Kingdom 🇬🇧', 'Germany 🇩🇪'].map(c => (
                <span key={c} style={{
                  fontSize: 11, padding: '6px 12px',
                  border: '1px solid rgba(255,255,255,0.18)',
                  letterSpacing: '0.05em',
                }}>{c}</span>
              ))}
            </div>
          </div>
          {[
            { title: 'Shop', links: ['All Systems', 'Toupees', 'Lace Front', 'Mono Top', 'Skin Base'] },
            { title: 'Care', links: ['Sizing Guide', 'Color Match', 'Care & Maintenance', 'Shipping & Returns', 'FAQ'] },
            { title: 'House', links: ['Our Atelier', 'The Craft', 'Journal', 'Contact', 'Wholesale'] },
          ].map(col => (
            <div key={col.title}>
              <div style={{
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'var(--gold)', marginBottom: 18, fontWeight: 500,
              }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(l => (
                  <a key={l} style={{ color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 13.5, textDecoration: 'none' }}>{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{
          paddingTop: 32, display: 'flex', justifyContent: 'space-between',
          color: 'rgba(255,255,255,0.4)', fontSize: 12,
        }}>
          <span>© 2026 Ledarise. All rights reserved.</span>
          <span>Privacy · Terms · Cookies</span>
        </div>
      </div>
    </footer>
  );
}
window.StoreFooter = StoreFooter;

// Cart state — Zustand-style global
window.cartStore = {
  items: JSON.parse(localStorage.getItem('ledarise.cart') || '[]'),
  listeners: new Set(),
  subscribe(cb) { this.listeners.add(cb); return () => this.listeners.delete(cb); },
  emit() {
    localStorage.setItem('ledarise.cart', JSON.stringify(this.items));
    this.listeners.forEach(cb => cb());
  },
  add(product, qty = 1) {
    const existing = this.items.find(i => i.product.id === product.id);
    if (existing) existing.qty += qty;
    else this.items.push({ product, qty });
    this.emit();
  },
  remove(id) { this.items = this.items.filter(i => i.product.id !== id); this.emit(); },
  setQty(id, qty) {
    const item = this.items.find(i => i.product.id === id);
    if (item) { item.qty = Math.max(1, qty); this.emit(); }
  },
  clear() { this.items = []; this.emit(); },
  count() { return this.items.reduce((n, i) => n + i.qty, 0); },
  subtotal() { return this.items.reduce((n, i) => n + i.product.price * i.qty, 0); },
};

function useCart() {
  const [, force] = useState(0);
  useEffect(() => window.cartStore.subscribe(() => force(n => n + 1)), []);
  return window.cartStore;
}
window.useCart = useCart;
