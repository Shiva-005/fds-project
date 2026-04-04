'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { useRecords } from '@/hooks/useRecords';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';

const pageTitles: Record<string, { title: string; bc: string }> = {
  '/dashboard': { title: 'Dashboard', bc: 'FDS / overview' },
  '/records': { title: 'Records', bc: 'FDS / records' },
  '/analytics': { title: 'Analytics', bc: 'FDS / analytics' },
  '/users': { title: 'User Management', bc: 'FDS / users' },
  '/settings': { title: 'Settings', bc: 'FDS / settings' },
};

export function Topbar() {
  const pathname = usePathname();
  const page = pageTitles[pathname] ?? { title: 'FDS', bc: 'FDS' };
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ amount: '', type: 'income', category: 'Salary', date: new Date().toISOString().split('T')[0], note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { createRecord } = useRecords();
  const { toast } = useToast();
  const { user } = useAuth();

  const submit = async () => {
    if (!form.amount) { toast('Please enter an amount', 'error'); return; }
    setSubmitting(true);
    const res = await createRecord({ amount: Number(form.amount), type: form.type, category: form.category, date: new Date(form.date).toISOString(), note: form.note });
    setSubmitting(false);
    if (res.success) { toast('Record created!'); setModal(false); setForm({ amount: '', type: 'income', category: 'Salary', date: new Date().toISOString().split('T')[0], note: '' }); }
    else toast(res.message, 'error');
  };

  return (
    <>
      <header style={{ height: '56px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '17px', color: 'var(--text)' }}>{page.title}</div>
          <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{page.bc}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => user?.role !== 'analyst' && setModal(true)} 
              onMouseEnter={() => user?.role === 'analyst' && setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              disabled={user?.role === 'analyst'}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '7px 14px', 
                borderRadius: '7px', 
                border: user?.role === 'analyst' ? '1px solid var(--border2)' : '1px solid var(--gold)', 
                background: user?.role === 'analyst' ? 'var(--surface2)' : 'var(--gold)', 
                color: user?.role === 'analyst' ? 'var(--text3)' : '#080C14', 
                fontSize: '12px', 
                fontFamily: 'var(--sans)', 
                cursor: user?.role === 'analyst' ? 'not-allowed' : 'pointer', 
                fontWeight: 600,
                opacity: user?.role === 'analyst' ? 0.6 : 1
              }}
            >
              + Add Record
            </button>
            {showTooltip && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: '8px',
                padding: '8px 12px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text2)',
                fontSize: '11px',
                fontFamily: 'var(--sans)',
                whiteSpace: 'nowrap',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                Analysts cannot add records
              </div>
            )}
          </div>
        </div>
      </header>

      <Modal open={modal} onClose={() => setModal(false)} title="New Financial Record"
        footer={
          <>
            <button onClick={() => setModal(false)} style={{ padding: '7px 14px', borderRadius: '7px', border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text2)', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
            <button onClick={submit} disabled={submitting} style={{ padding: '7px 14px', borderRadius: '7px', border: '1px solid var(--gold)', background: 'var(--gold)', color: '#080C14', fontSize: '12px', cursor: 'pointer', fontWeight: 600, opacity: submitting ? 0.6 : 1 }}>
              {submitting ? 'Creating...' : 'Create Record'}
            </button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <FormField label="Amount (₹)"><input className="form-input" placeholder="e.g. 50000" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></FormField>
          <FormField label="Type">
            <select className="form-input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </FormField>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <FormField label="Category">
            <select className="form-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {['Salary','Freelance','Investments','Rent','Food','Transport','Utilities','Healthcare'].map(c => <option key={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Date"><input type="date" className="form-input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></FormField>
        </div>
        <FormField label="Note (optional)"><input className="form-input" placeholder="Add a note..." value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} /></FormField>
      </Modal>
    </>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <div style={{ fontSize: '11px', color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500, fontFamily: 'var(--mono)' }}>{label}</div>
      {children}
    </div>
  );
}
