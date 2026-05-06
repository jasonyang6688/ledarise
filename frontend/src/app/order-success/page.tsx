'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Nav } from '@/components/store/Nav';
import { Footer } from '@/components/store/Footer';
import { Icon } from '@/components/icons';
import { useCart } from '@/lib/cart';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import type { Order } from '@/lib/types';

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cart = useCart();
  const orderNo = searchParams.get('no') || '';

  useEffect(() => {
    cart.clear();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: order, loading } = useFetch<Order | null>(
    () => orderNo ? api.publicOrders.getByNo(orderNo) : Promise.resolve(null),
    [orderNo],
  );

  const displayNo = orderNo || 'PO000419xxx';

  return (
    <div className="store">
      <Nav />
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '96px 32px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gold)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Icon.Check width={28} height={28} />
        </div>
        <div className="eyebrow">Confirmation</div>
        <h1 className="serif" style={{ fontSize: 56, margin: '12px 0 16px', lineHeight: 1.1 }}>Thank you.</h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 16, lineHeight: 1.6, marginBottom: 8 }}>
          Your order is confirmed. A receipt is on its way to your inbox.
        </p>
        <p style={{ fontSize: 13, color: 'var(--ink-4)', marginBottom: 32, fontFamily: 'monospace', letterSpacing: '0.08em' }}>Order #{displayNo}</p>

        {/* Order summary from API */}
        {order && !loading && (
          <div style={{ background: 'var(--paper)', padding: 24, textAlign: 'left', marginBottom: 24, borderTop: '1px solid var(--line)' }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Order Summary</div>
            {order.items.map((it, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--line-soft)' }}>
                <span>{it.product.name} × {it.qty}</span>
                <span>${it.subtotal.toFixed(2)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, paddingTop: 12, marginTop: 4 }}>
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div style={{ background: 'var(--paper)', padding: 32, textAlign: 'left', marginBottom: 32 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>What happens next</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { num: '01', title: 'Confirmation email', desc: 'Within 5 minutes — check your inbox.' },
              { num: '02', title: 'Atelier preparation', desc: 'Your system is hand-finished and quality-checked.' },
              { num: '03', title: 'Discreet shipping', desc: 'Tracking sent the moment it leaves our New Jersey atelier.' },
            ].map(s => (
              <div key={s.num} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 16, alignItems: 'center' }}>
                <span className="serif" style={{ fontSize: 24, color: 'var(--gold-2)' }}>{s.num}</span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{s.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-4)' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn" onClick={() => router.push('/shop')}>Continue Shopping</button>
      </section>
      <Footer />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="store"><Nav /></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
