'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/store/Nav';
import { Footer } from '@/components/store/Footer';
import { api } from '@/lib/api';

interface CustomerProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  role: string;
}

const CUSTOMER_TOKEN_KEY = 'ledarise.customer_token';
const CUSTOMER_USER_KEY = 'ledarise.customer_user';

export default function AccountPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(CUSTOMER_TOKEN_KEY) : null;
    if (!token) {
      setLoading(false);
      return;
    }
    api.customer
      .me()
      .then((u) => setProfile(u))
      .catch(() => {
        localStorage.removeItem(CUSTOMER_TOKEN_KEY);
        localStorage.removeItem(CUSTOMER_USER_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res =
        mode === 'login'
          ? await api.customer.login(email, password)
          : await api.customer.register({ name, email, password, phone });
      localStorage.setItem(CUSTOMER_TOKEN_KEY, res.token);
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(res.user));
      setProfile(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_USER_KEY);
    setProfile(null);
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
  };

  return (
    <div className="store">
      <Nav />
      <section style={{ padding: '72px 32px', minHeight: 'calc(100vh - 200px)', background: 'var(--ivory)' }}>
        <div style={{ maxWidth: 460, margin: '0 auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--ink-4)', padding: '60px 0' }}>Loading...</div>
          ) : profile ? (
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 18 }}>
                Account
              </div>
              <h1 className="serif" style={{ fontSize: 42, fontWeight: 400, margin: '0 0 12px', color: 'var(--ink)' }}>
                Welcome, {profile.name}
              </h1>
              <p style={{ color: 'var(--ink-2)', marginBottom: 32, fontSize: 14.5 }}>
                Glad to have you back at Ledarise.
              </p>
              <div style={{ background: 'white', border: '1px solid var(--line-soft)', padding: 28, marginBottom: 24 }}>
                <Row label="Name" value={profile.name} />
                <Row label="Email" value={profile.email} />
                <Row label="Phone" value={profile.phone || '—'} />
                <Row label="Country" value={profile.country || '—'} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn" onClick={() => router.push('/shop')} style={{ flex: 1 }}>Continue shopping</button>
                <button className="btn btn-outline" onClick={logout} style={{ flex: 1 }}>Sign out</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 18, textAlign: 'center' }}>
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </div>
              <h1 className="serif" style={{ fontSize: 42, fontWeight: 400, margin: '0 0 32px', color: 'var(--ink)', textAlign: 'center' }}>
                {mode === 'login' ? 'Welcome back' : 'Join Ledarise'}
              </h1>
              <form onSubmit={submit} style={{ background: 'white', border: '1px solid var(--line-soft)', padding: 32 }}>
                {mode === 'register' && (
                  <Field label="Full name">
                    <input required value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
                  </Field>
                )}
                <Field label="Email">
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
                </Field>
                {mode === 'register' && (
                  <Field label="Phone (optional)">
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
                  </Field>
                )}
                <Field label="Password">
                  <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
                </Field>
                {error && <div style={{ color: '#b91c1c', fontSize: 13, marginBottom: 16 }}>{error}</div>}
                <button className="btn" type="submit" disabled={submitting} style={{ width: '100%', marginTop: 8 }}>
                  {submitting ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
                </button>
              </form>
              <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--ink-2)' }}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <a
                  onClick={() => {
                    setError('');
                    setMode(mode === 'login' ? 'register' : 'login');
                  }}
                  style={{ cursor: 'pointer', color: 'var(--gold)', fontWeight: 500 }}
                >
                  {mode === 'login' ? 'Register' : 'Sign in'}
                </a>
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', fontSize: 14,
  border: '1px solid var(--line-soft)', background: 'var(--ivory)',
  color: 'var(--ink)', fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-2)', marginBottom: 8 }}>{label}</label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line-soft)', fontSize: 14 }}>
      <span style={{ color: 'var(--ink-4)', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
