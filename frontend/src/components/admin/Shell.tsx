'use client';
import { useRouter, usePathname } from 'next/navigation';
import { Icon } from '@/components/icons';
import { api } from '@/lib/api';
import { useAdminTheme } from '@/lib/adminTheme';
import { useFetch } from '@/lib/useFetch';
import type { ReactNode } from 'react';

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { dark, toggleDark } = useAdminTheme();
  const { data: stats } = useFetch(() => api.dashboard.stats(), []);

  const sections = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <Icon.Dashboard /> },
    { path: '/admin/orders', label: 'Orders', icon: <Icon.Receipt />, count: stats?.totalOrders },
    { path: '/admin/products', label: 'Products', icon: <Icon.Package /> },
    { path: '/admin/customers', label: 'Customers', icon: <Icon.Users /> },
  ];

  return (
    <div className={'admin' + (dark ? ' dark' : '')} style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '232px 1fr' }}>
      <aside style={{
        background: dark ? 'var(--ad-surface)' : 'var(--a-surface)',
        borderRight: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)'),
        padding: '20px 14px', display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px 18px' }}>
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
            <a key={s.path} className={'nav-item' + (pathname.startsWith(s.path) ? ' active' : '')} onClick={() => router.push(s.path)}>
              {s.icon}
              <span style={{ flex: 1 }}>{s.label}</span>
              {s.count !== undefined && <span style={{
                fontSize: 11, padding: '1px 6px', borderRadius: 4,
                background: pathname.startsWith(s.path) ? 'rgba(255,255,255,0.15)' : (dark ? 'var(--ad-border-2)' : 'var(--a-soft-neutral)'),
              }}>{s.count.toLocaleString()}</span>}
            </a>
          ))}
        </nav>

        <div style={{ marginBottom: 'auto' }} />

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
            <button onClick={toggleDark} title="Toggle theme" style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', padding: 4,
            }}>
              {dark ? <Icon.Sun /> : <Icon.Moon />}
            </button>
          </div>
        </div>
      </aside>

      <main style={{ minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
