'use client';
import { useState } from 'react';
import { Icon } from '@/components/icons';
import { LEDARISE_DATA } from '@/lib/data';
import { api, ApiError } from '@/lib/api';
import type { Product } from '@/lib/types';

interface ProductEditorProps {
  productId: number | 'new';
  onClose: () => void;
  dark: boolean;
}

type FormData = Omit<Product, 'id' | 'sales' | 'rating' | 'reviews'> & {
  tagline?: string;
};

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="admin-card" style={{ padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  );
}

function Grid({ cols, children }: { cols: number; children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>{children}</div>;
}

interface FieldAProps {
  label: string;
  value: string | number;
  onChange?: (v: string) => void;
  type?: string;
  options?: string[];
  mono?: boolean;
  prefix?: string;
}

function FieldA({ label, value, onChange, type = 'text', options, mono, prefix }: FieldAProps) {
  return (
    <div>
      <div className="label">{label}</div>
      {type === 'textarea' ? (
        <textarea className="admin-input" rows={4} value={value || ''} onChange={e => onChange?.(e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }}/>
      ) : type === 'select' && options ? (
        <select className="admin-input" value={value} onChange={e => onChange?.(e.target.value)}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <div style={{ position: 'relative' }}>
          {prefix && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--a-text-3)' }}>{prefix}</span>}
          <input className="admin-input" value={value || ''} onChange={e => onChange?.(e.target.value)} style={{ paddingLeft: prefix ? 24 : 12, fontFamily: mono ? 'monospace' : 'inherit' }}/>
        </div>
      )}
    </div>
  );
}

export function ProductEditor({ productId, onClose, dark }: ProductEditorProps) {
  const isNew = productId === 'new';
  const product = isNew ? null : LEDARISE_DATA.products.find(p => p.id === productId);
  const [form, setForm] = useState<FormData>(product ? { ...product } : {
    name: '', sku: '', description: '', tagline: '', price: 0, originalPrice: 0,
    category: 'Toupee', color: 'Dark Brown', length: '6 inch', material: 'Swiss Lace',
    stock: 0, status: 'draft', tone: '#3a2a1f', accent: '#b8895c', features: [],
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const set = (k: string, v: string | number | string[]) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        description: form.description,
        tagline: form.tagline ?? '',
        price: form.price,
        original_price: form.originalPrice,
        category: form.category,
        color: form.color,
        length: form.length,
        material: form.material,
        stock: form.stock,
        status: form.status,
        tone: form.tone,
        accent: form.accent,
        features: JSON.stringify(form.features),
      };
      if (isNew) {
        await api.products.create(payload);
      } else {
        await api.products.update(productId as number, payload);
      }
      onClose();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Save failed');
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'flex-end', zIndex: 100 }} onClick={onClose}>
      <div className="admin-card" style={{ width: 720, height: '100vh', borderRadius: 0, overflow: 'auto', borderLeft: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)') }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)'), display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: dark ? 'var(--ad-surface)' : 'var(--a-surface)', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{isNew ? 'New Product' : form.name}</div>
            <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', marginTop: 2 }}>{isNew ? 'Add to catalog' : 'SKU ' + form.sku}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
            <button className="admin-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </div>
        {saveError && (
          <div style={{ padding: '10px 28px', background: '#fef2f2', color: '#dc2626', fontSize: 13 }}>
            {saveError}
          </div>
        )}

        <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div className="label">Product Images</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <div style={{ aspectRatio: '4/5', background: form.tone, borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: '20% 25%', borderRadius: '50% 50% 40% 40%', background: form.accent }}/>
                <span style={{ position: 'absolute', top: 6, left: 8, fontSize: 9, fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)' }}>1 · main</span>
              </div>
              {[2, 3].map(i => (
                <div key={i} style={{ aspectRatio: '4/5', background: form.tone, opacity: 0.6, borderRadius: 8, position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 6, left: 8, fontSize: 9, fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)' }}>{i}</span>
                </div>
              ))}
              <button style={{ aspectRatio: '4/5', borderRadius: 8, border: '2px dashed ' + (dark ? 'var(--ad-border-2)' : 'var(--a-border-2)'), background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', justifyContent: 'center', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>
                <Icon.Plus width={16} height={16}/>
                <span style={{ fontSize: 11 }}>Add image</span>
              </button>
            </div>
          </div>

          <FormSection title="Basic Information">
            <Grid cols={1}><FieldA label="Product name" value={form.name} onChange={v => set('name', v)}/></Grid>
            <Grid cols={2}>
              <FieldA label="SKU" value={form.sku} onChange={v => set('sku', v)} mono/>
              <FieldA label="Category" type="select" value={form.category} onChange={v => set('category', v)} options={LEDARISE_DATA.CATEGORIES}/>
            </Grid>
            <FieldA label="Tagline" value={form.tagline || ''} onChange={v => set('tagline', v)}/>
            <FieldA label="Description" type="textarea" value={form.description} onChange={v => set('description', v)}/>
          </FormSection>

          <FormSection title="Attributes">
            <Grid cols={3}>
              <FieldA label="Color" type="select" value={form.color} onChange={v => set('color', v)} options={LEDARISE_DATA.COLORS}/>
              <FieldA label="Length" type="select" value={form.length} onChange={v => set('length', v)} options={LEDARISE_DATA.LENGTHS}/>
              <FieldA label="Material" type="select" value={form.material} onChange={v => set('material', v)} options={LEDARISE_DATA.MATERIALS}/>
            </Grid>
          </FormSection>

          <FormSection title="Pricing & Inventory">
            <Grid cols={3}>
              <FieldA label="Price (USD)" value={form.price} onChange={v => set('price', +v)} prefix="$"/>
              <FieldA label="Compare at" value={form.originalPrice} onChange={v => set('originalPrice', +v)} prefix="$"/>
              <FieldA label="Stock on hand" value={form.stock} onChange={v => set('stock', +v)}/>
            </Grid>
          </FormSection>

          <FormSection title="Visibility">
            <div style={{ display: 'flex', gap: 8 }}>
              {['published', 'draft'].map(s => (
                <button key={s} onClick={() => set('status', s)} className={'admin-btn ' + (form.status === s ? '' : 'admin-btn-secondary')}>
                  {form.status === s && <Icon.Check/>}{s}
                </button>
              ))}
            </div>
          </FormSection>
        </div>
      </div>
    </div>
  );
}
