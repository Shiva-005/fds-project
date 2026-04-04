'use client';

import { useState } from 'react';
import { useRecords } from '@/hooks/useRecords';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { FinancialRecord } from '@/types';

const catColors: Record<string, string> = {
  Salary: '#2DD4A0', Freelance: '#C9A84C', Investments: '#4A90E2',
  Rent: '#F06B6B', Food: '#8B6BF0', Transport: '#E87040',
  Utilities: '#60B9E0', Healthcare: '#F0C060',
};

function fmt(n: number) {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000) return '₹' + (n / 1000).toFixed(0) + 'K';
  return '₹' + n;
}

export default function RecordsPage() {
  const { records, meta, loading, filters, updateFilters, createRecord, updateRecord, deleteRecord } = useRecords({ limit: 10 });
  const { toast } = useToast();

  const [editRecord, setEditRecord] = useState<FinancialRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({ amount: '', category: '', note: '', type: 'income', date: '' });

  const openEdit = (r: FinancialRecord) => {
    setEditRecord(r);
    setEditForm({ amount: String(r.amount), category: r.category, note: r.note ?? '', type: r.type, date: r.date?.slice(0, 10) });
  };

  const handleUpdate = async () => {
    if (!editRecord) return;
    setSubmitting(true);
    const res = await updateRecord(editRecord._id, { amount: Number(editForm.amount), category: editForm.category, note: editForm.note, type: editForm.type as 'income' | 'expense', date: new Date(editForm.date).toISOString() });
    setSubmitting(false);
    if (res.success) { toast('Record updated!'); setEditRecord(null); }
    else toast(res.message, 'error');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    const res = await deleteRecord(deleteId);
    setSubmitting(false);
    if (res.success) { toast('Record deleted'); setDeleteId(null); }
    else toast(res.message, 'error');
  };

  const BtnStyle = (variant: 'primary' | 'ghost' | 'danger') => ({
    padding: '7px 14px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--sans)',
    ...(variant === 'primary' ? { border: '1px solid var(--gold)', background: 'var(--gold)', color: '#080C14', fontWeight: 600 } :
      variant === 'danger' ? { border: '1px solid rgba(240,107,107,0.5)', background: 'rgba(240,107,107,0.1)', color: 'var(--red)' } :
        { border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text2)' }),
  });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '26px', color: 'var(--text)', marginBottom: '4px' }}>Financial Records</h1>
        <p style={{ fontSize: '13px', color: 'var(--text3)' }}>Manage and review all transactions</p>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '8px 12px' }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="#4A5C80" strokeWidth="1.3"/><path d="M9 9l2.5 2.5" stroke="#4A5C80" strokeWidth="1.3" strokeLinecap="round"/></svg>
          <input placeholder="Search by category, note…" value={filters.search ?? ''} onChange={e => updateFilters({ search: e.target.value })}
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '13px', fontFamily: 'var(--sans)', flex: 1 }} />
        </div>
        {[
          { label: 'Type', key: 'type' as const, opts: [['', 'All Types'], ['income', 'Income'], ['expense', 'Expense']] },
          { label: 'Category', key: 'category' as const, opts: [['', 'All Categories'], ...['Salary','Freelance','Investments','Rent','Food','Transport','Utilities','Healthcare'].map(c => [c, c])] },
          { label: 'Sort', key: 'sortBy' as const, opts: [['date','Date'],['amount','Amount'],['category','Category']] },
        ].map(({ key, opts }) => (
          <select key={key} value={filters[key] ?? ''} onChange={e => updateFilters({ [key]: e.target.value } as Parameters<typeof updateFilters>[0])}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text2)', fontSize: '12px', fontFamily: 'var(--sans)', outline: 'none', cursor: 'pointer' }}>
            {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Category', 'Date', 'Note', 'Type', 'Amount', 'Actions'].map((h, i) => (
                <th key={h} style={{ background: 'var(--surface2)', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 16px', textAlign: i >= 4 ? 'right' : 'left', fontWeight: 500, fontFamily: 'var(--mono)', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--border2)', borderTopColor: 'var(--gold)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
              </td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>No records found</td></tr>
            ) : records.map((r) => (
              <tr key={r._id} style={{ transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.01)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: catColors[r.category] ?? '#8A9BBF', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{r.category}</span>
                  </div>
                </td>
                <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: '12px' }}>{r.date?.slice(0, 10)}</td>
                <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text2)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>{r.note ?? '—'}</td>
                <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 500, fontFamily: 'var(--mono)', background: r.type === 'income' ? 'rgba(45,212,160,0.1)' : 'rgba(240,107,107,0.1)', color: r.type === 'income' ? 'var(--green)' : 'var(--red)' }}>{r.type}</span>
                </td>
                <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 500, color: r.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                  {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
                </td>
                <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button onClick={() => openEdit(r)} style={{ padding: '4px 8px', borderRadius: '5px', border: '1px solid var(--border2)', background: 'none', color: 'var(--text3)', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--mono)' }}>Edit</button>
                    <button onClick={() => setDeleteId(r._id)} style={{ padding: '4px 8px', borderRadius: '5px', border: '1px solid rgba(240,107,107,0.3)', background: 'none', color: 'var(--red)', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--mono)' }}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
          {meta.total > 0 ? `Showing ${(meta.page - 1) * meta.limit + 1}–${Math.min(meta.page * meta.limit, meta.total)} of ${meta.total}` : '0 records'}
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => updateFilters({ page: meta.page - 1 })} disabled={meta.page <= 1}
            style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text2)', fontSize: '12px', cursor: 'pointer', opacity: meta.page <= 1 ? 0.4 : 1 }}>‹</button>
          {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => updateFilters({ page: p })}
              style={{ width: '28px', height: '28px', borderRadius: '6px', border: `1px solid ${meta.page === p ? 'var(--gold-dim)' : 'var(--border2)'}`, background: meta.page === p ? 'rgba(201,168,76,0.08)' : 'var(--surface2)', color: meta.page === p ? 'var(--gold2)' : 'var(--text2)', fontSize: '12px', cursor: 'pointer' }}>{p}</button>
          ))}
          <button onClick={() => updateFilters({ page: meta.page + 1 })} disabled={meta.page >= meta.totalPages}
            style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text2)', fontSize: '12px', cursor: 'pointer', opacity: meta.page >= meta.totalPages ? 0.4 : 1 }}>›</button>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={!!editRecord} onClose={() => setEditRecord(null)} title="Edit Record"
        footer={<>
          <button onClick={() => setEditRecord(null)} style={BtnStyle('ghost')}>Cancel</button>
          <button onClick={handleUpdate} disabled={submitting} style={{ ...BtnStyle('primary'), opacity: submitting ? 0.6 : 1 }}>{submitting ? 'Saving…' : 'Save Changes'}</button>
        </>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          {[{ l: 'Amount (₹)', k: 'amount', type: 'number' }, { l: 'Date', k: 'date', type: 'date' }].map(({ l, k, type }) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--mono)' }}>{l}</div>
              <input type={type} value={(editForm as Record<string, string>)[k]} onChange={e => setEditForm(p => ({ ...p, [k]: e.target.value }))}
                className="form-input" />
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--mono)' }}>Type</div>
            <select value={editForm.type} onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))} className="form-input">
              <option value="income">Income</option><option value="expense">Expense</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--mono)' }}>Category</div>
            <select value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))} className="form-input">
              {['Salary','Freelance','Investments','Rent','Food','Transport','Utilities','Healthcare'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--mono)' }}>Note</div>
          <input value={editForm.note} onChange={e => setEditForm(p => ({ ...p, note: e.target.value }))} className="form-input" />
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Record" width={380}
        footer={<>
          <button onClick={() => setDeleteId(null)} style={BtnStyle('ghost')}>Cancel</button>
          <button onClick={handleDelete} disabled={submitting} style={{ ...BtnStyle('danger'), opacity: submitting ? 0.6 : 1 }}>{submitting ? 'Deleting…' : 'Delete'}</button>
        </>}>
        <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.6 }}>This record will be soft-deleted and can be recovered. Are you sure?</p>
      </Modal>
    </div>
  );
}
