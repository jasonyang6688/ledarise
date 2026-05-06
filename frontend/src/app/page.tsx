'use client';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/store/Nav';
import { Footer } from '@/components/store/Footer';
import { ProductCard } from '@/components/store/ProductCard';
import { Stars } from '@/components/store/Stars';
import { Icon } from '@/components/icons';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import type { Product } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const { data, loading, error } = useFetch<Product[]>(
    () => api.publicProducts.list({ page_size: 8, sort: 'best_seller' }).then((r) => r.list),
    [],
  );
  const featured: Product[] = data ?? [];

  return (
    <div className="store">
      <Nav />

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="noise" />
        <div style={{
          maxWidth: 1320, margin: '0 auto',
          padding: '72px 32px 96px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center',
        }}>
          <div className="fade-up">
            <div className="eyebrow">Atelier-Made · Since 2018</div>
            <div className="ornament" />
            <h1 className="serif" style={{ fontSize: 76, lineHeight: 1.02, margin: '0 0 28px', letterSpacing: '-0.015em' }}>
              The art of<br/>looking like<br/><em style={{ color: 'var(--gold-2)', fontStyle: 'italic' }}>yourself.</em>
            </h1>
            <p style={{ fontSize: 16.5, color: 'var(--ink-3)', lineHeight: 1.6, maxWidth: 460, marginBottom: 36 }}>
              Hand-tied hair systems built knot by knot in our atelier. Indistinguishable from your scalp — even at six inches.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn" onClick={() => router.push('/shop')}>Shop the Collection</button>
              <button className="btn btn-outline" onClick={() => router.push('/about')}>Our Craft</button>
            </div>
            <div style={{ display: 'flex', gap: 32, marginTop: 56, fontSize: 12, letterSpacing: '0.05em', color: 'var(--ink-4)' }}>
              <div><strong style={{ display: 'block', fontSize: 22, color: 'var(--ink)', fontFamily: 'Cormorant Garamond' }}>9,000+</strong>SHIPPED WORLDWIDE</div>
              <div><strong style={{ display: 'block', fontSize: 22, color: 'var(--ink)', fontFamily: 'Cormorant Garamond' }}>4.9/5</strong>VERIFIED REVIEWS</div>
              <div><strong style={{ display: 'block', fontSize: 22, color: 'var(--ink)', fontFamily: 'Cormorant Garamond' }}>6mo</strong>WEAR GUARANTEE</div>
            </div>
          </div>
          <div style={{ position: 'relative', aspectRatio: '4/5' }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: '#ead2d3',
              overflow: 'hidden',
            }}>
              <img
                src="/hair/hair-05.jpeg"
                alt="Ledarise men's hair system styling"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  display: 'block',
                }}
              />
            </div>
            <div style={{
              position: 'absolute', bottom: -24, right: -24,
              background: 'var(--paper)', padding: '20px 24px',
              border: '1px solid var(--line)',
              maxWidth: 240,
            }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Featured</div>
              <div className="serif" style={{ fontSize: 22, lineHeight: 1.2, marginBottom: 4 }}>The Edinburgh</div>
              <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>Swiss lace · Hand-tied · From $289</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section style={{ background: 'var(--paper)', padding: '64px 32px', borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {[
            { icon: <Icon.Hand width={20} height={20}/>, title: 'Hand-Tied', desc: 'Every knot tied by master craftspeople — no machine wefting, ever.' },
            { icon: <Icon.Award width={20} height={20}/>, title: 'Indian Remy', desc: 'Cuticle-aligned strands sourced single-origin, dyed in small batches.' },
            { icon: <Icon.Sparkle width={20} height={20}/>, title: 'Custom Density', desc: 'Density grades from crown to hairline for an unmistakably real edge.' },
            { icon: <Icon.Truck width={20} height={20}/>, title: 'Discreet Delivery', desc: 'Shipped in unmarked packaging from our New Jersey atelier.' },
          ].map((p, i) => (
            <div key={i} style={{ paddingTop: 24, borderTop: '1px solid var(--line)' }}>
              <div style={{ color: 'var(--gold-2)', marginBottom: 16 }}>{p.icon}</div>
              <div className="serif" style={{ fontSize: 24, marginBottom: 8 }}>{p.title}</div>
              <p style={{ fontSize: 13.5, color: 'var(--ink-4)', lineHeight: 1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

          {/* Featured products */}
      <section style={{ padding: '96px 32px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
            <div>
              <div className="eyebrow">The Collection</div>
              <h2 className="serif" style={{ fontSize: 48, margin: '12px 0 0', letterSpacing: '-0.01em' }}>Bestsellers, hand-picked.</h2>
            </div>
            <a onClick={() => router.push('/shop')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--ink)', paddingBottom: 4 }}>
              View All <Icon.ArrowRight />
            </a>
          </div>
          {loading && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-4)' }}>Loading...</div>
          )}
          {error && (
            <div style={{ padding: 16, background: '#fef2f2', color: '#dc2626', borderRadius: 4 }}>
              Failed to load: {error}
            </div>
          )}
          {!loading && !error && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Editorial split */}
      <section style={{ background: 'var(--ink)', color: 'var(--ivory)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '96px 32px', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--gold-soft)' }}>Inside the Atelier</div>
            <h2 className="serif" style={{ fontSize: 56, lineHeight: 1.05, margin: '20px 0 28px' }}>Six weeks.<br/>Forty thousand knots.<br/>One <em style={{ color: 'var(--gold-soft)' }}>system.</em></h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16, lineHeight: 1.7, maxWidth: 480, marginBottom: 32 }}>
              A Ledarise system passes through eleven hands across six weeks of hand-tying, ventilation, and color blending. Density is graded zone-by-zone — heavier at the crown for fullness, lighter at the temples for a hairline that disappears.
            </p>
            <button className="btn btn-outline" style={{ borderColor: 'var(--ivory)', color: 'var(--ivory)' }} onClick={() => router.push('/about')}>
              See the Process
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { num: '01', title: 'Source', desc: 'Single-origin Indian Remy' },
              { num: '02', title: 'Mold', desc: 'Custom cap to your scalp' },
              { num: '03', title: 'Tie', desc: 'Knot by knot, by hand' },
              { num: '04', title: 'Blend', desc: 'Color matched to your roots' },
              { num: '05', title: 'Ventilate', desc: 'Density graded zone by zone' },
              { num: '06', title: 'Ship', desc: 'Discreet, packaged, ready' },
            ].map(s => (
              <div key={s.num} style={{ padding: '24px 20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="serif" style={{ fontSize: 28, color: 'var(--gold-soft)', marginBottom: 12 }}>{s.num}</div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '96px 32px', background: 'var(--ivory-2)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div className="eyebrow" style={{ textAlign: 'center' }}>Verified Reviews</div>
          <h2 className="serif" style={{ fontSize: 44, textAlign: 'center', margin: '12px 0 56px' }}>From the gentlemen who wear them.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { name: 'Robert M.', city: 'Chicago', system: 'Edinburgh · Dark Brown', text: "My barber didn't notice for three months. When I finally told him, he asked me where to send his clients.", rating: 5 },
              { name: 'James W.', city: 'London', system: 'Hollywood · Natural Black', text: 'I work in television. The full lace gives me freedom on camera that no system has matched. Worth every pound.', rating: 5 },
              { name: 'Klaus B.', city: 'Berlin', system: 'Heritage · Salt & Pepper', text: 'Discreet shipping was important to me. The packaging is plain, the system is exceptional. I am on my third now.', rating: 5 },
            ].map((t, i) => (
              <div key={i} style={{ background: 'var(--paper)', padding: 32, position: 'relative' }}>
                <Stars value={t.rating} size={14} />
                <p className="serif" style={{ fontSize: 22, lineHeight: 1.4, margin: '20px 0 28px', color: 'var(--ink-2)' }}>&ldquo;{t.text}&rdquo;</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 20, borderTop: '1px solid var(--line)' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>{t.city}</div>
                  </div>
                  <div style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--gold-2)' }}>{t.system}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
