'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/Shell';
import { AdminHeader } from '@/components/admin/Header';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { RequireAuth } from '@/components/admin/RequireAuth';
import { Icon } from '@/components/icons';
import { api, ApiError } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { useAdminTheme } from '@/lib/adminTheme';
import { LEDARISE_DATA } from '@/lib/data';
import type { Order } from '@/lib/types';

const { STATUSES } = LEDARISE_DATA;

function OrderDetailContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { dark } = useAdminTheme();

  const fetchOrder = useCallback(() => api.orders.get(params.id), [params.id]);
  const { data: order, loading, error } = useFetch<Order>(fetchOrder, [params.id]);

  const [orderStatus, setOrderStatus] = useState('');
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const noteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync state from loaded order
  useEffect(() => {
    if (order) {
      setOrderStatus(order.status);
      setNote('');
    }
  }, [order]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setOrderStatus(newStatus);
    setStatusSaving(true);
    try {
      await api.orders.updateStatus(order.id, newStatus);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update status';
      alert(msg);
      setOrderStatus(order.status); // revert
    } finally {
      setStatusSaving(false);
    }
  };

  const handleNoteChange = (val: string) => {
    setNote(val);
    if (!order) return;
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    noteTimerRef.current = setTimeout(async () => {
      setSavingNote(true);
      try {
        await api.orders.updateNote(order.id, val);
      } catch {
        // silently ignore — note save is best effort
      } finally {
        setSavingNote(false);
      }
    }, 800);
  };

  const timeline = [
    { key: 'pending', label: 'Placed', date: '—' },
    { key: 'processing', label: 'Processing', date: '—' },
    { key: 'shipped', label: 'Shipped', date: '—' },
    { key: 'complete', label: 'Delivered', date: '—' },
  ];

  if (loading) {
    return (
      <AdminShell>
        <div style={{ padding: 40, textAlign: 'center', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>Loading order...</div>
      </AdminShell>
    );
  }

  if (error || !order) {
    return (
      <AdminShell>
        <div style={{ padding: 40 }}>
          <div style={{ padding: 16, background: '#fef2f2', color: '#dc2626', borderRadius: 4 }}>
            Failed to load: {error ?? 'Order not found'}
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <AdminHeader
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="admin-btn admin-btn-secondary" style={{ padding: 7 }} onClick={() => router.push('/admin/orders')}><Icon.ArrowLeft /></button>
            <span style={{ fontFamily: 'monospace', fontSize: 18 }}>{order.orderNo}</span>
            <StatusBadge status={orderStatus || order.status} />
          </div>
        }
        subtitle={`Placed ${order.date} · ${order.customer.flag} ${order.customer.country}`}
        actions={
          <>
            <button className="admin-btn admin-btn-secondary"><Icon.Download /> Invoice PDF</button>
            <button className="admin-btn"><Icon.Truck /> Mark Shipped</button>
          </>
        }
      />

      <div style={{ padding: '24px 40px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Status timeline */}
          <div className="admin-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Order Lifecycle</div>
              <select
                value={orderStatus}
                onChange={e => handleStatusChange(e.target.value)}
                className="admin-input"
                style={{ width: 'auto', paddingRight: 28, opacity: statusSaving ? 0.6 : 1 }}
                disabled={statusSaving}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {timeline.map((s, i) => {
                const idx = timeline.findIndex(a => a.key === orderStatus);
                const done = i <= (idx >= 0 ? idx : 1);
                return (
                  <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <div style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: done ? '#b8895c' : (dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)'),
                        color: done ? 'white' : (dark ? 'var(--ad-text-3)' : 'var(--a-text-3)'),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 8px', fontSize: 11, fontWeight: 600,
                      }}>{done ? <Icon.Check width={12} height={12} /> : i + 1}</div>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', marginTop: 2 }}>{done ? s.date : '—'}</div>
                    </div>
                    {i < timeline.length - 1 && (
                      <div style={{ flex: 0.5, height: 2, background: done ? '#b8895c' : (dark ? 'var(--ad-border-2)' : 'var(--a-border-2)'), marginBottom: 30 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items */}
          <div className="admin-card" style={{ padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Items ({order.items.length})</div>
            {order.items.map((it, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto auto auto', gap: 16, padding: '14px 0', borderBottom: i < order.items.length - 1 ? '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)') : 'none', alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 8, background: it.product.tone, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: '25% 28%', borderRadius: '50% 50% 40% 40%', background: it.product.accent }} />
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{it.product.name}</div>
                  <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', marginTop: 2 }}>SKU {it.product.sku} · {it.product.color} · {it.product.length}</div>
                </div>
                <div style={{ fontSize: 13, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}>${it.product.price.toFixed(2)}</div>
                <div style={{ fontSize: 13, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}>× {it.qty}</div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>${it.subtotal.toFixed(2)}</div>
              </div>
            ))}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)') }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}><span>Shipping ({order.shippingMethod})</span><span>${order.shipping.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}><span>Discount</span><span>−${order.discount.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 600, padding: '8px 0 0', borderTop: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)'), marginTop: 8 }}><span>Total</span><span>${order.total.toFixed(2)}</span></div>
            </div>
          </div>

          {/* Note */}
          <div className="admin-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Internal Note</div>
              <span style={{ fontSize: 11, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>
                {savingNote ? 'Saving...' : 'Auto-saved'}
              </span>
            </div>
            <textarea
              className="admin-input"
              rows={3}
              value={note}
              onChange={e => handleNoteChange(e.target.value)}
              style={{ resize: 'vertical' }}
              placeholder="Add an internal note..."
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Customer */}
          <div className="admin-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12.5, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', fontWeight: 500, marginBottom: 12 }}>Customer</div>
            <a onClick={() => router.push('/admin/customers/' + order.customer.id)} style={{ display: 'flex', gap: 12, cursor: 'pointer', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #b8895c, #3a2a1f)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>
                {order.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{order.customer.name}</div>
                <div style={{ fontSize: 11.5, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>{order.customer.orders} orders · ${order.customer.total.toFixed(0)} lifetime</div>
              </div>
            </a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon.Mail /> {order.customer.email}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon.Phone /> {order.customer.phone}</span>
            </div>
          </div>

          {/* Shipping address */}
          <div className="admin-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12.5, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', fontWeight: 500, marginBottom: 12 }}>Shipping Address</div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              <div style={{ fontWeight: 500 }}>{order.customer.name}</div>
              <div style={{ color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}>{order.shipAddress}</div>
              <div style={{ color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}>{order.customer.country}</div>
            </div>
            <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon.Truck /> <span style={{ flex: 1 }}>{order.shippingMethod || 'Standard Shipping'}</span>
              <span style={{ fontFamily: 'monospace', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>1Z9X4...842</span>
            </div>
          </div>

          {/* Payment */}
          <div className="admin-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12.5, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', fontWeight: 500, marginBottom: 12 }}>Payment</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ padding: '5px 8px', borderRadius: 4, background: dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>VISA</div>
              <div style={{ fontSize: 13, fontFamily: 'monospace' }}>•••• 4582</div>
            </div>
            <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', marginTop: 8 }}>Authorized · {order.date} · 09:14 UTC</div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <RequireAuth>
      <OrderDetailContent params={params} />
    </RequireAuth>
  );
}
