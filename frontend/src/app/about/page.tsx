'use client';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/store/Nav';
import { Footer } from '@/components/store/Footer';

const PILLARS = [
  {
    n: '01',
    title: 'Hand-Selected Hair',
    body: 'Every strand is sourced from a single donor and cuticle-aligned, preserving the natural flow and reflectance that machine-blended hair can never replicate.',
  },
  {
    n: '02',
    title: 'Bespoke Construction',
    body: 'Bases are tailored to your scalp contour using Swiss lace, French lace, mono-top or skin variants — chosen for the climate you live in and the parting you prefer.',
  },
  {
    n: '03',
    title: 'Hand-Tied, Not Wefted',
    body: 'Each knot is tied by hand. A standard Ledarise system carries 40,000–60,000 single knots, taking 90 to 140 hours per piece.',
  },
  {
    n: '04',
    title: 'Color, Carefully',
    body: 'Pigments are applied in three layers — base tone, mid-tone and highlight — to mimic how light moves through hair grown naturally on the head.',
  },
];

const PROCESS = [
  { step: 'Consultation', detail: 'Measurements, density and parting captured remotely or in-studio.' },
  { step: 'Pattern', detail: 'A custom mold is cut for your head shape. No two patterns are identical.' },
  { step: 'Ventilation', detail: 'Master craftsmen tie the hair, knot by knot, in our atelier.' },
  { step: 'Color & Cut', detail: 'Hand-painted color, then sculpted to your reference styling.' },
  { step: 'Quality', detail: 'A 14-point inspection before the piece leaves our studio.' },
  { step: 'Delivery', detail: 'Discreet, signature-required shipping with lifetime servicing.' },
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="store">
      <Nav />

      {/* Hero */}
      <section style={{
        background: 'var(--ivory)',
        padding: '96px 32px 80px',
        borderBottom: '1px solid var(--line-soft)',
      }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 24 }}>
            The Ledarise Craft
          </div>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 62, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.01em',
            color: 'var(--ink)', margin: 0,
          }}>
            One donor. One pattern.<br />One pair of hands.
          </h1>
          <p style={{
            fontSize: 16, lineHeight: 1.8, color: 'var(--ink-2)',
            maxWidth: 640, margin: '32px auto 0',
          }}>
            Ledarise is a small atelier of master ventilators making bespoke hair systems for people who refuse to compromise. Everything we deliver is single-donor, hand-tied, and built to a pattern cut for one head — yours.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section style={{ padding: '96px 32px', background: 'white' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>
              What sets us apart
            </div>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 42, fontWeight: 400, letterSpacing: '-0.01em',
              color: 'var(--ink)', margin: 0,
            }}>
              Four pillars of the house
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 48 }}>
            {PILLARS.map(p => (
              <div key={p.n} style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 28 }}>
                <div style={{ fontSize: 13, color: 'var(--gold)', letterSpacing: '0.18em', marginBottom: 14 }}>{p.n}</div>
                <h3 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 26, fontWeight: 500, color: 'var(--ink)', margin: '0 0 12px',
                }}>{p.title}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.8, color: 'var(--ink-2)', margin: 0 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section style={{ padding: '96px 32px', background: 'var(--ivory)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>
              The journey
            </div>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 42, fontWeight: 400, letterSpacing: '-0.01em',
              color: 'var(--ink)', margin: 0,
            }}>
              From consultation to your door
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--ink-2)', maxWidth: 560, margin: '20px auto 0', lineHeight: 1.8 }}>
              A typical Ledarise piece takes between 6 and 10 weeks. We never rush a knot — but we never make you wait without reason.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--line-soft)', border: '1px solid var(--line-soft)' }}>
            {PROCESS.map((p, i) => (
              <div key={p.step} style={{ background: 'var(--ivory)', padding: '36px 32px' }}>
                <div style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.18em', marginBottom: 12 }}>
                  STEP {String(i + 1).padStart(2, '0')}
                </div>
                <h3 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 24, fontWeight: 500, color: 'var(--ink)', margin: '0 0 10px',
                }}>{p.step}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-2)', margin: 0 }}>{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section style={{ padding: '80px 32px', background: 'var(--ink)', color: 'var(--ivory)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, textAlign: 'center' }}>
          {[
            { v: '14', l: 'Years of craft' },
            { v: '60K+', l: 'Knots per system' },
            { v: '120h', l: 'Average hand-time' },
            { v: '38', l: 'Countries served' },
          ].map(s => (
            <div key={s.l}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 56, fontWeight: 400, color: 'var(--gold)', lineHeight: 1 }}>{s.v}</div>
              <div style={{ marginTop: 10, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '96px 32px', background: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 42, fontWeight: 400, color: 'var(--ink)', margin: 0,
          }}>
            Ready to be measured?
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--ink-2)', margin: '20px 0 36px' }}>
            Begin with our ready-to-wear collection, or speak with a consultant about a fully bespoke commission.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn" onClick={() => router.push('/shop')}>Shop the collection</button>
            <button className="btn btn-outline" onClick={() => router.push('/account')}>Book a consultation</button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
