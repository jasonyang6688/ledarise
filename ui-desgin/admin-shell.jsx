/* global React, Icon */
const D4 = window.LEDARISE_DATA;
const { useState: uS4, useMemo: uM4, useEffect: uE4 } = React;

// ───────── Admin Shell ─────────
function AdminShell({ route, navigate, children, dark, setDark }) {
  const sections = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <Icon.Dashboard /> },
    { path: '/admin/orders', label: 'Orders', icon: <Icon.Receipt />, count: 47 },
    { path: '/admin/products', label: 'Products', icon: <Icon.Package /> },
    { path: '/admin/customers', label: 'Customers', icon: <Icon.Users /> },
  ];
  const settings = [
    { path: '/admin/users', label: 'Team', icon: <Icon.Users /> },
    { path: '/admin/settings', label: 'Settings', icon: <Icon.Settings /> },
  ];

  return (
    <div className={'admin' + (dark ? ' dark' : '')} style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '232px 1fr' }}>
      {/* Sidebar */}
      <aside style={{
        background: dark ? 'var(--ad-surface)' : 'var(--a-surface)',
        borderRight: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)'),
        padding: '20px 14px', display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 10px 18px',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'linear-gradient(135deg, #b8895c, #3a2a1f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 12, letterSpacing: '0.05em',
          }}>L</div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: '0.02em' }}>Ledarise</div>
            <div style={{ fontSize: 11, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>Admin Console</div>
          </div>
        </div>

        <div style={{ position: 'relative', marginBottom: 18 }}>
          <Icon.Search width={13} height={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }} />
          <input className="admin-input" placeholder="Search..." style={{ paddingLeft: 30, fontSize: 12.5, padding: '7px 10px 7px 30px' }} />
          <kbd style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            fontSize: 10, padding: '2px 5px', borderRadius: 4, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)',
            border: '1px solid ' + (dark ? 'var(--ad-border-2)' : 'var(--a-border-2)'),
          }}>⌘K</kbd>
        </div>

        <div style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', padding: '0 12px 6px', marginTop: 6 }}>Workspace</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 16 }}>
          {sections.map(s => (
            <a key={s.path} className={'nav-item' + (route.startsWith(s.path) ? ' active' : '')} onClick={() => navigate(s.path)}>
              {s.icon}
              <span style={{ flex: 1 }}>{s.label}</span>
              {s.count && <span style={{
                fontSize: 11, padding: '1px 6px', borderRadius: 4,
                background: route.startsWith(s.path) ? 'rgba(255,255,255,0.15)' : (dark ? 'var(--ad-border-2)' : 'var(--a-soft-neutral)'),
              }}>{s.count}</span>}
            </a>
          ))}
        </nav>

        <div style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', padding: '0 12px 6px' }}>System</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 'auto' }}>
          {settings.map(s => (
            <a key={s.path} className="nav-item" onClick={() => navigate(s.path)}>
              {s.icon}<span>{s.label}</span>
            </a>
          ))}
        </nav>

        <div style={{
          padding: 12, marginTop: 16, borderRadius: 10,
          background: dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #b8895c, #3a2a1f)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600,
            }}>RZ</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500 }}>Ren Zhao</div>
              <div style={{ fontSize: 11, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>Super Admin</div>
            </div>
            <button onClick={() => setDark(!dark)} title="Toggle theme" style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', padding: 4,
            }}>
              {dark ? <Icon.Sun /> : <Icon.Moon />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
window.AdminShell = AdminShell;

// ───────── Topbar ─────────
function AdminHeader({ title, subtitle, dark, actions }) {
  return (
    <div style={{
      padding: '24px 40px',
      borderBottom: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)'),
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: dark ? 'var(--ad-bg)' : 'var(--a-bg)',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 13, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', marginTop: 4 }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {actions}
        <button className="admin-btn admin-btn-secondary" style={{ padding: 8 }}><Icon.Bell /></button>
      </div>
    </div>
  );
}
window.AdminHeader = AdminHeader;

// ───────── Spark/Area Mini Chart ─────────
function MiniSpark({ values, color = 'var(--a-accent)', height = 40 }) {
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const w = 120;
  const points = values.map((v, i) => `${(i / (values.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`);
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height, overflow: 'visible' }}>
      <defs>
        <linearGradient id={'g'+color.replace(/\W/g,'')} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon className="spark" points={`0,${height} ${points.join(' ')} ${w},${height}`} fill={`url(#g${color.replace(/\W/g,'')})`} stroke="none" />
      <polyline className="spark" points={points.join(' ')} fill="none" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}
window.MiniSpark = MiniSpark;

// ───────── Login ─────────
function AdminLogin({ navigate, dark, setDark }) {
  return (
    <div className={'admin' + (dark ? ' dark' : '')} style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1.2fr' }}>
      <div style={{ padding: 64, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #b8895c, #3a2a1f)', color: 'white', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>L</div>
          <div style={{ fontWeight: 600, letterSpacing: '0.04em' }}>LEDARISE</div>
        </div>
        <div style={{ margin: 'auto 0', maxWidth: 360 }}>
          <h1 style={{ fontSize: 30, margin: '0 0 8px', fontWeight: 600, letterSpacing: '-0.02em' }}>Welcome back.</h1>
          <p style={{ fontSize: 14, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', marginBottom: 28 }}>Sign in to your administrator account.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div className="label">Email</div>
              <input className="admin-input" defaultValue="ren@ledarise.com" />
            </div>
            <div>
              <div className="label">Password</div>
              <input className="admin-input" type="password" defaultValue="••••••••••" />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}>
              <input type="checkbox" defaultChecked /> Keep me signed in for 30 days
            </label>
            <button className="admin-btn" style={{ width: '100%', justifyContent: 'center', padding: 11 }} onClick={() => navigate('/admin/dashboard')}>Sign in <Icon.ArrowRight /></button>
          </div>
        </div>
        <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>© 2026 Ledarise · v2.0</div>
      </div>
      <div style={{ background: '#0a0a0a', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 30%, rgba(184,137,92,0.25), transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(184,137,92,0.15), transparent 60%)' }} />
        <div style={{ position: 'relative', textAlign: 'center', padding: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
            {[...Array(3)].map((_,i) => <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: 'rgba(184,137,92,0.5)' }} />)}
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 56, lineHeight: 1.1, marginBottom: 16, fontStyle: 'italic' }}>"Built one knot<br/>at a time."</div>
          <div style={{ fontSize: 12, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)' }}>9,027 ORDERS · 6,841 CUSTOMERS · 3 MARKETS</div>
        </div>
      </div>
    </div>
  );
}
window.AdminLogin = AdminLogin;
