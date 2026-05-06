import type { Product } from '@/lib/types';

interface ProductSwatchProps {
  product: Product;
  size?: 'card' | 'lg' | 'sm';
}

export function ProductSwatch({ product, size = 'card' }: ProductSwatchProps) {
  const heightClass = size === 'card' ? 'aspect-[4/5]' : size === 'lg' ? 'aspect-[1/1]' : 'aspect-[3/4]';
  const imageUrl = product.images?.[0]?.url;

  return (
    <div className={`${heightClass} relative w-full overflow-hidden`} style={{ background: product.tone }}>
      {imageUrl ? (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url("${imageUrl}")`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.18))',
            }}
          />
        </>
      ) : (
        <>
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse 70% 50% at 50% 30%, ${product.accent}33, transparent 60%)`,
          }} />
          <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMax meet" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <ellipse cx="100" cy="155" rx="50" ry="62" fill="#dcb88a" opacity="0.55" />
            <path
              d={`M50 130
                  C 50 80, 70 55, 100 50
                  C 130 55, 150 80, 150 130
                  C 152 145, 155 165, 152 185
                  C 145 200, 120 195, 100 195
                  C 80 195, 55 200, 48 185
                  C 45 165, 48 145, 50 130 Z`}
              fill={product.accent}
              opacity="0.95"
            />
            <path d="M65 80 Q 75 110 70 165" stroke={product.tone} strokeWidth="0.8" fill="none" opacity="0.5" />
            <path d="M85 70 Q 92 105 88 175" stroke={product.tone} strokeWidth="0.8" fill="none" opacity="0.5" />
            <path d="M115 70 Q 110 110 112 175" stroke={product.tone} strokeWidth="0.8" fill="none" opacity="0.5" />
            <path d="M135 80 Q 128 110 130 165" stroke={product.tone} strokeWidth="0.8" fill="none" opacity="0.5" />
            <path d="M75 75 Q 85 95 80 130" stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.18" />
            <path d="M120 75 Q 115 95 122 130" stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.18" />
          </svg>
        </>
      )}
      <div style={{
        position: 'absolute', top: 12, left: 12,
        fontSize: 10, letterSpacing: '0.15em',
        color: 'rgba(255,255,255,0.7)', fontWeight: 500,
        fontFamily: 'monospace',
      }}>{product.sku}</div>
    </div>
  );
}
