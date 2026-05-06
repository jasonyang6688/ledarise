export function Footer() {
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
