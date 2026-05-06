'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Icon } from '@/components/icons';
import { useCartStore } from '@/lib/cart';

export function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const count = useCartStore(s => s.count());

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted ? count : 0;

  const submitSearch = () => {
    const q = searchValue.trim();
    setSearchOpen(false);
    if (q) router.push('/shop?q=' + encodeURIComponent(q));
    else router.push('/shop');
  };

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
            <a key={it.label} onClick={() => router.push(it.path)} style={{
              cursor: 'pointer', color: 'var(--ink)', fontWeight: 500,
              borderBottom: pathname.startsWith(it.path.split('?')[0]) && it.path !== '/about' ? '1px solid var(--gold)' : '1px solid transparent',
              paddingBottom: 4,
            }}>{it.label}</a>
          ))}
        </nav>
        <a onClick={() => router.push('/')} style={{
          cursor: 'pointer', textAlign: 'center',
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 30, fontWeight: 500, letterSpacing: '0.32em',
          color: 'var(--ink)',
        }}>LEDARISE</a>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18, alignItems: 'center', color: 'var(--ink)' }}>
          <Icon.Search style={{ cursor: 'pointer' }} onClick={() => setSearchOpen(s => !s)} />
          <Icon.User style={{ cursor: 'pointer' }} onClick={() => router.push('/account')} />
          <Icon.Heart style={{ cursor: 'pointer' }} />
          <a onClick={() => router.push('/cart')} style={{ cursor: 'pointer', position: 'relative', color: 'inherit' }}>
            <Icon.Cart />
            {mounted && cartCount > 0 && (
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
      {searchOpen && (
        <div style={{ borderTop: '1px solid var(--line-soft)', background: 'var(--ivory)' }}>
          <div style={{ maxWidth: 1320, margin: '0 auto', padding: '20px 32px', display: 'flex', gap: 12 }}>
            <input
              autoFocus
              type="text"
              placeholder="Search hair systems, color, length..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
              style={{
                flex: 1, padding: '12px 16px', fontSize: 14,
                border: '1px solid var(--line-soft)', background: 'white',
                color: 'var(--ink)', fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button onClick={submitSearch} style={{
              padding: '12px 24px', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
              background: 'var(--ink)', color: 'var(--ivory)', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 500,
            }}>Search</button>
            <button onClick={() => setSearchOpen(false)} style={{
              padding: '12px 16px', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
              background: 'transparent', color: 'var(--ink-2)', border: '1px solid var(--line-soft)',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>Cancel</button>
          </div>
        </div>
      )}
    </header>
  );
}
