'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { useRecords } from '@/hooks/useRecords';
import { useToast } from '@/components/ui/Toast';

const pageTitles: Record<string, { title: string; bc: string }> = {
  '/dashboard': { title: 'Dashboard', bc: 'ledger / overview' },
  '/records': { title: 'Records', bc: 'ledger / records' },
  '/analytics': { title: 'Analytics', bc: 'ledger / analytics' },
  '/users': { title: 'User Management', bc: 'ledger / users' },
  '/settings': { title: 'Settings', bc: 'ledger / settings' },
};

export function Topbar() {
  const pathname = usePathname();
  const page = pageTitles[pathname] ?? { title: 'Ledger', bc: 'ledger' };
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ amount: '', type: 'income', category: 'Salary', date: new Date().toISOString().split('T')[0], note: '' });
  const [submitting, setSubmitting] = useState(false);
  const { createRecord } = useRecords();
  const { toast } = useToast();

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
          <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '7px', border: '1px solid var(--gold)', background: 'var(--gold)', color: '#080C14', fontSize: '12px', fontFamily: 'var(--sans)', cursor: 'pointer', fontWeight: 600 }}>
            + Add Record
          </button>
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
