import { Icon } from '@/components/icons';

interface StarsProps {
  value?: number;
  size?: number;
}

export function Stars({ value = 5, size = 12 }: StarsProps) {
  return (
    <div style={{ display: 'inline-flex', gap: 1, color: 'var(--gold)' }}>
      {[1,2,3,4,5].map(i => (
        <Icon.Star key={i} width={size} height={size} style={{ opacity: i <= Math.round(value) ? 1 : 0.25 }} />
      ))}
    </div>
  );
}
