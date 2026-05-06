'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasAdminSession } from '@/lib/auth';

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(hasAdminSession() ? '/admin/dashboard' : '/admin/login');
  }, [router]);

  return (
    <div className="admin" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 13, color: 'var(--a-text-3)' }}>Loading...</div>
    </div>
  );
}
