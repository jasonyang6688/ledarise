interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<string, string> = { complete: 'success', processing: 'info', pending: 'warning', cancelled: 'danger' };
  const cls = map[status] || 'neutral';
  return <span className={'badge badge-' + cls}><span className="badge-dot" style={{ background: 'currentColor' }}/>{status}</span>;
}
