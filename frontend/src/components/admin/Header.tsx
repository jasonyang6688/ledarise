'use client';
import type { ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { useAdminTheme } from '@/lib/adminTheme';

interface AdminHeaderProps {
  title: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
}

export function AdminHeader({ title, subtitle, actions }: AdminHeaderProps) {
  const { dark } = useAdminTheme();
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
