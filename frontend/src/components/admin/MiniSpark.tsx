interface MiniSparkProps {
  values: number[];
  color?: string;
  height?: number;
}

export function MiniSpark({ values, color = 'var(--a-accent)', height = 40 }: MiniSparkProps) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 120;
  const points = values.map((v, i) => `${(i / (values.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`);
  const safeColor = color.replace(/\W/g, '');
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height, overflow: 'visible' }}>
      <defs>
        <linearGradient id={'g' + safeColor} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon className="spark" points={`0,${height} ${points.join(' ')} ${w},${height}`} fill={`url(#g${safeColor})`} stroke="none" />
      <polyline className="spark" points={points.join(' ')} fill="none" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}
