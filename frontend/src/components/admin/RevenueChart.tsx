import type { RevenueTrendItem } from '@/lib/types';

interface RevenueChartProps {
  data: RevenueTrendItem[];
  dark: boolean;
}

export function RevenueChart({ data, dark }: RevenueChartProps) {
  const w = 720, h = 220, p = { l: 40, r: 16, t: 16, b: 24 };
  const innerW = w - p.l - p.r, innerH = h - p.t - p.b;
  const max = Math.max(...data.map(d => d.total));
  const x = (i: number) => p.l + (i / (data.length - 1)) * innerW;
  const y = (v: number) => p.t + innerH - (v / max) * innerH;
  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.total)}`).join(' ');
  const areaPath = linePath + ` L ${x(data.length-1)} ${p.t + innerH} L ${x(0)} ${p.t + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="revArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#b8895c" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#b8895c" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(t => (
        <g key={t}>
          <line x1={p.l} x2={w-p.r} y1={p.t + innerH * t} y2={p.t + innerH * t} stroke={dark ? '#1f1f1f' : '#ececec'} strokeDasharray="2 4" />
          <text x={p.l - 8} y={p.t + innerH * t + 4} textAnchor="end" fontSize="10" fill={dark ? '#6b6b6b' : '#8e8e8e'}>${((max * (1-t))/1000).toFixed(0)}K</text>
        </g>
      ))}
      {data.filter((_, i) => i % 5 === 0).map((d) => {
        const i = data.indexOf(d);
        return <text key={i} x={x(i)} y={h - 6} textAnchor="middle" fontSize="10" fill={dark ? '#6b6b6b' : '#8e8e8e'}>{d.date}</text>;
      })}
      <path d={areaPath} fill="url(#revArea)" />
      <path d={linePath} fill="none" stroke="#b8895c" strokeWidth="2" />
      {data.map((d, i) => i % 3 === 0 && (
        <circle key={i} cx={x(i)} cy={y(d.total)} r="2.5" fill="#b8895c" />
      ))}
    </svg>
  );
}
