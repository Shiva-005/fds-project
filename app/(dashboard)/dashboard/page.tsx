'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import { useRecords } from '@/hooks/useRecords';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { CategoryDonut } from '@/components/dashboard/CategoryDonut';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
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

export default function DashboardPage() {
  const { user } = useAuth();
  const { summary, categories, trends, recent, loading: dashboardLoading } = useDashboard();
  const { records, meta, loading: recordsLoading, filters, updateFilters, createRecord, updateRecord, deleteRecord } = useRecords({ limit: 10 });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const view = (user?.role === 'analyst' || user?.role === 'admin') ? 'analytics' : 'records';
  const loading = view === 'analytics' ? dashboardLoading : recordsLoading;

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  };

  const [editRecord, setEditRecord] = useState<FinancialRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({ amount: '', category: '', note: '', type: 'income', date: '' });

  const canEditRecord = (record: FinancialRecord) => {
    return user?.role === 'admin';
  };

  const canDeleteRecord = (record: FinancialRecord) => {
    return user?.role === 'admin';
  };

  const openEdit = (r: FinancialRecord) => {
    setEditRecord(r);
    setEditForm({ amount: String(r.amount), category: r.category, note: r.note ?? '', type: r.type, date: r.date?.slice(0, 10) });
  };

  const handleUpdate = async () => {
    if (!editRecord) return;
    setSubmitting(true);
    const res = await updateRecord(editRecord._id, { amount: Number(editForm.amount), category: editForm.category, note: editForm.note, type: editForm.type as 'income' | 'expense', date: new Date(editForm.date).toISOString() });
    setSubmitting(false);
    if (res.success) { setEditRecord(null); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    const res = await deleteRecord(deleteId);
    setSubmitting(false);
    if (res.success) { setDeleteId(null); }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '26px', color: 'var(--text)', marginBottom: '4px' }}>
          {greeting}, {user?.name?.split(' ')[0] ?? 'there'}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text3)' }}>
          {view === 'analytics' ? (user?.role === 'admin' ? 'Here\'s your complete financial overview and data' : 'Here\'s your financial overview') : 'Here\'s your financial records'}
        </p>
      </div>

      {view === 'analytics' ? (
        <>
          <KpiCards summary={summary} loading={loading} />

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <TrendChart trends={trends} loading={loading} />
            <CategoryDonut categories={categories} loading={loading} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <RecentTransactions records={recent} loading={loading} />

            {/* Monthly Net Bars */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--text)' }}>Monthly Net</h3>
                <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                  {summary ? `${formatCurrency(summary.netBalance)} net` : '—'}
                </span>
              </div>
              {trends.length > 0 ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px', marginBottom: '8px' }}>
                    {trends.map((t, i) => {
                      const income = t.data.find(d => d.type === 'income')?.total ?? 0;
                      const expense = t.data.find(d => d.type === 'expense')?.total ?? 0;
                      const net = income - expense;
                      const maxNet = Math.max(...trends.map(tr => { const inc = tr.data.find(d => d.type === 'income')?.total ?? 0; const exp = tr.data.find(d => d.type === 'expense')?.total ?? 0; return Math.abs(inc - exp); }));
                      const pct = maxNet > 0 ? Math.abs(net) / maxNet * 100 : 50;
                      return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%' }}>
                          <div style={{ fontSize: '8px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                            {net >= 100000 ? `₹${(net/100000).toFixed(0)}L` : `₹${(net/1000).toFixed(0)}K`}
                          </div>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                            <div style={{ width: '100%', height: `${pct}%`, background: net >= 0 ? 'var(--gold)' : 'var(--red)', borderRadius: '3px 3px 0 0', opacity: 0.9 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                    {trends.map((t, i) => <span key={i}>{['J','F','M','A','M','J','J','A','S','O','N','D'][t.month - 1]}</span>)}
                  </div>
                </>
              ) : (
                <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '13px' }}>
                  {loading ? <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--border2)', borderTopColor: 'var(--gold)', animation: 'spin 0.7s linear infinite' }} /> : 'No trend data available'}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
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
                  {['Category', 'Date', 'Note', 'Type', 'Amount', ...(user?.role === 'admin' ? ['Actions'] : [])].map((h, i) => (
                    <th key={h} style={{ background: 'var(--surface2)', fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 16px', textAlign: i >= 4 ? 'right' : 'left', fontWeight: 500, fontFamily: 'var(--mono)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={user?.role === 'admin' ? 6 : 5} style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--border2)', borderTopColor: 'var(--gold)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
                  </td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan={user?.role === 'admin' ? 6 : 5} style={{ padding: '48px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>No records found</td></tr>
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
                    {user?.role === 'admin' && (
                      <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {canEditRecord(r) && (
                            <button onClick={() => openEdit(r)} style={{ padding: '4px 8px', borderRadius: '5px', border: '1px solid var(--border2)', background: 'none', color: 'var(--text3)', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--mono)' }}>Edit</button>
                          )}
                          {canDeleteRecord(r) && (
                            <button onClick={() => setDeleteId(r._id)} style={{ padding: '4px 8px', borderRadius: '5px', border: '1px solid rgba(240,107,107,0.3)', background: 'none', color: 'var(--red)', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--mono)' }}>Del</button>
                          )}
                        </div>
                      </td>
                    )}
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
          {editRecord && (
            <Modal title="Edit Record" onClose={() => setEditRecord(null)} open={!!editRecord}>
              <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Amount</label>
                    <input type="number" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })} required
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border2)', borderRadius: '6px', background: 'var(--surface2)', color: 'var(--text)', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Category</label>
                    <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} required
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border2)', borderRadius: '6px', background: 'var(--surface2)', color: 'var(--text)', fontSize: '13px' }}>
                      {['Salary','Freelance','Investments','Rent','Food','Transport','Utilities','Healthcare'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Note</label>
                    <input type="text" value={editForm.note} onChange={e => setEditForm({ ...editForm, note: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border2)', borderRadius: '6px', background: 'var(--surface2)', color: 'var(--text)', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Type</label>
                    <select value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value as 'income' | 'expense' })} required
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border2)', borderRadius: '6px', background: 'var(--surface2)', color: 'var(--text)', fontSize: '13px' }}>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Date</label>
                    <input type="date" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} required
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border2)', borderRadius: '6px', background: 'var(--surface2)', color: 'var(--text)', fontSize: '13px' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                  <button type="submit" disabled={submitting} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--gold)', background: 'var(--gold)', color: '#080C14', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    {submitting ? 'Updating...' : 'Update'}
                  </button>
                  <button type="button" onClick={() => setEditRecord(null)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text2)', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            </Modal>
          )}

          {/* Delete Modal */}
          {deleteId && (
            <Modal title="Delete Record" onClose={() => setDeleteId(null)} open={!!deleteId}>
              <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '20px' }}>Are you sure you want to delete this record? This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleDelete} disabled={submitting} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid rgba(240,107,107,0.5)', background: 'rgba(240,107,107,0.1)', color: 'var(--red)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  {submitting ? 'Deleting...' : 'Delete'}
                </button>
                <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text2)', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </Modal>
          )}
        </>
      )}
    </div>
  );
}
