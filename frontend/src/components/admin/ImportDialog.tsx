'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '@/components/icons';
import { api, ApiError, type ImportProgress } from '@/lib/api';

interface ImportDialogProps {
  onClose: () => void;
  dark: boolean;
  onCompleted?: () => void;
}

type Step = 1 | 2 | 3 | 4;

export function ImportDialog({ onClose, dark, onCompleted }: ImportDialogProps) {
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const handleFile = (f: File) => {
    setError(null);
    if (!f.name.toLowerCase().endsWith('.xlsx')) {
      setError('Only .xlsx files are supported');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError('File too large (max 50MB)');
      return;
    }
    setFile(f);
    setStep(2);
  };

  const startImport = async () => {
    if (!file) return;
    setError(null);
    try {
      const { taskId: id } = await api.imports.start(file);
      setTaskId(id);
      setStep(3);
      // Begin polling
      const poll = async () => {
        try {
          const p = await api.imports.status(id);
          setProgress(p);
          if (p.status === 'completed' || p.status === 'failed') {
            stopPolling();
            setStep(4);
            if (p.status === 'completed' && onCompleted) onCompleted();
          }
        } catch (err) {
          stopPolling();
          setError(err instanceof ApiError ? err.message : 'Status poll failed');
          setStep(4);
        }
      };
      poll();
      pollRef.current = setInterval(poll, 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed');
    }
  };

  const handleClose = () => {
    stopPolling();
    onClose();
  };

  const fileSizeKB = file ? Math.round(file.size / 1024) : 0;
  const fileSizeText = fileSizeKB > 1024 ? `${(fileSizeKB / 1024).toFixed(1)} MB` : `${fileSizeKB} KB`;
  const pct = progress && progress.totalRows > 0
    ? Math.min(100, Math.round((progress.processedRows / progress.totalRows) * 100))
    : (progress?.status === 'running' ? 5 : 0);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
      <div className="admin-card" style={{ width: 640, maxWidth: '100%', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)'), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Import Historical Orders</div>
            <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', marginTop: 2 }}>
              Step {Math.min(step, 3)} of 3 · Excel upload
            </div>
          </div>
          <button onClick={handleClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4 }}><Icon.X /></button>
        </div>

        <div style={{ padding: 24, minHeight: 280 }}>
          {error && (
            <div style={{ padding: 12, marginBottom: 12, borderRadius: 8, background: '#fee2e2', color: '#991b1b', fontSize: 13 }}>
              {error}
            </div>
          )}

          {step === 1 && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFile(f);
                }}
                style={{
                  padding: 36, borderRadius: 12,
                  border: '2px dashed ' + (dragOver ? '#b8895c' : (dark ? 'var(--ad-border-2)' : 'var(--a-border-2)')),
                  background: dragOver ? (dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)') : 'transparent',
                  textAlign: 'center', marginBottom: 12, cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <Icon.Upload width={28} height={28} style={{ margin: '0 auto 12px', display: 'block', color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }} />
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Drag and drop your .xlsx file</div>
                <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>or click to browse · Max 50MB</div>
              </div>
              <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', display: 'flex', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 8, background: dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)' }}>
                <Icon.File />
                <div>Expected columns: <code style={{ fontFamily: 'monospace', fontSize: 11 }}>ID, Bill-to Name, Ship-to Address, Tel, Status, Grand Total, SKU, Item Count, Country Id, Coupon Code, Purchase Date</code></div>
              </div>
            </div>
          )}

          {step === 2 && file && (
            <div>
              <div style={{ padding: 14, borderRadius: 10, background: dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Icon.File />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{file.name}</div>
                  <div style={{ fontSize: 11.5, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>{fileSizeText} · ready to import</div>
                </div>
                <span className="badge badge-success"><Icon.Check width={10} height={10} />Ready</span>
              </div>
              <div style={{ fontSize: 12.5, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', lineHeight: 1.6 }}>
                Click <strong>Start Import</strong> to begin server-side parsing. Customers, products and orders will be deduplicated by (name, phone), SKU, and order_no respectively. The process runs asynchronously — you can keep this dialog open to watch progress.
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 24 }}>
                {progress ? `Importing... ${pct}%` : 'Starting import...'}
              </div>
              <div style={{ height: 8, borderRadius: 4, background: dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)', overflow: 'hidden', maxWidth: 400, margin: '0 auto' }}>
                <div style={{ width: pct + '%', height: '100%', background: 'linear-gradient(90deg, #b8895c, #d6b07e)', transition: 'width 0.4s' }} />
              </div>
              <div style={{ fontSize: 12, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', marginTop: 14 }}>
                {progress
                  ? `Processed ${progress.processedRows.toLocaleString()} of ${progress.totalRows.toLocaleString()} rows · ${progress.importedOrders} orders so far`
                  : 'Uploading file to server...'}
              </div>
              {taskId && (
                <div style={{ fontSize: 10.5, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)', marginTop: 8, fontFamily: 'monospace' }}>
                  Task: {taskId}
                </div>
              )}
            </div>
          )}

          {step === 4 && progress && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              {progress.status === 'completed' ? (
                <>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Icon.Check width={24} height={24} /></div>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Import complete</div>
                  <div style={{ fontSize: 13, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', marginBottom: 24 }}>
                    {progress.totalRows.toLocaleString()} rows processed
                  </div>
                </>
              ) : (
                <>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fee2e2', color: '#991b1b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Icon.X width={24} height={24} /></div>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Import failed</div>
                  <div style={{ fontSize: 13, color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)', marginBottom: 24 }}>
                    {progress.errorMessage || 'Unknown error'}
                  </div>
                </>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, maxWidth: 480, margin: '0 auto' }}>
                {[
                  { num: progress.importedOrders, label: 'Orders' },
                  { num: progress.importedCustomers, label: 'Customers' },
                  { num: progress.importedProducts, label: 'Products' },
                  { num: progress.skippedRows, label: 'Skipped' },
                ].map((s) => (
                  <div key={s.label} style={{ padding: 14, borderRadius: 8, background: dark ? 'var(--ad-surface-2)' : 'var(--a-soft-neutral)' }}>
                    <div style={{ fontSize: 20, fontWeight: 600 }}>{s.num.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: dark ? 'var(--ad-text-3)' : 'var(--a-text-3)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {progress.errors && progress.errors.length > 0 && (
                <div style={{ marginTop: 24, textAlign: 'left', maxWidth: 480, margin: '24px auto 0' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Skipped rows ({progress.errors.length})</div>
                  <div style={{ maxHeight: 120, overflow: 'auto', border: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)'), borderRadius: 6, padding: 8, fontSize: 11.5, fontFamily: 'monospace', color: dark ? 'var(--ad-text-2)' : 'var(--a-text-2)' }}>
                    {progress.errors.slice(0, 50).map((e, i) => (
                      <div key={i}>Row {e.row}: {e.reason}</div>
                    ))}
                    {progress.errors.length > 50 && <div>... and {progress.errors.length - 50} more</div>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid ' + (dark ? 'var(--ad-border)' : 'var(--a-border)'), display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          {step < 4 && <button className="admin-btn admin-btn-secondary" onClick={handleClose}>Cancel</button>}
          {step === 1 && <button className="admin-btn" onClick={() => fileInputRef.current?.click()}>Select File</button>}
          {step === 2 && <button className="admin-btn" onClick={startImport}>Start Import</button>}
          {step === 4 && <button className="admin-btn" onClick={handleClose}>Done</button>}
        </div>
      </div>
    </div>
  );
}
