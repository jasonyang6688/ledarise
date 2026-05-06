'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/icons';
import { useAdminTheme } from '@/lib/adminTheme';
import { useAuth } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const { dark } = useAdminTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@ledarise.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  };

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
              <input
                className="admin-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
              />
            </div>
            <div>
              <div className="label">Password</div>
              <input
                className="admin-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div style={{ padding: '10px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 6, fontSize: 13 }}>
                {error}
              </div>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}>
              <input type="checkbox" defaultChecked /> Keep me signed in for 30 days
            </label>
            <button
              className="admin-btn"
              style={{ width: '100%', justifyContent: 'center', padding: 11 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'} {!loading && <Icon.ArrowRight />}
            </button>
          </div>
        </div>
        <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>© 2026 Ledarise · v2.0</div>
      </div>
      <div style={{ background: '#0a0a0a', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 30%, rgba(184,137,92,0.25), transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(184,137,92,0.15), transparent 60%)' }} />
        <div style={{ position: 'relative', textAlign: 'center', padding: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: 'rgba(184,137,92,0.5)' }} />)}
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 56, lineHeight: 1.1, marginBottom: 16, fontStyle: 'italic' }}>&ldquo;Built one knot<br/>at a time.&rdquo;</div>
          <div style={{ fontSize: 12, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)' }}>9,027 ORDERS · 6,841 CUSTOMERS · 3 MARKETS</div>
        </div>
      </div>
    </div>
  );
}
