'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

/**
 * Wrap admin pages with this component to enforce authentication.
 * Redirects to /admin/login if no token is present after hydration.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace('/admin/login');
    }
  }, [hydrated, token, router]);

  if (!hydrated) {
    return (
      <div className="admin" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--a-text-3)' }}>Loading...</div>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return <>{children}</>;
}
