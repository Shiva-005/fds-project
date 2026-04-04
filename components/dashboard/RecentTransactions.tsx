'use client';

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

export function RecentTransactions({ records, loading }: { records: FinancialRecord[]; loading: boolean }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <h3 style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--text)' }}>Recent Transactions</h3>
        <a href="/records" style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)', textDecoration: 'none' }}>View all →</a>
      </div>

      {loading ? (
        <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--border2)', borderTopColor: 'var(--gold)', animation: 'spin 0.7s linear infinite' }} />
        </div>
      ) : records.length === 0 ? (
        <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '13px' }}>
          No transactions available
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Category', 'Type', 'Amount'].map(h => (
                <th key={h} style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 0 10px', textAlign: h === 'Amount' ? 'right' : 'left', fontWeight: 500, fontFamily: 'var(--mono)', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.slice(0, 6).map((r) => (
              <tr key={r._id}>
                <td style={{ padding: '11px 0', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: catColors[r.category] ?? '#8A9BBF', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{r.category}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{r.date?.slice(0, 10)}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', fontWeight: 500, fontFamily: 'var(--mono)', background: r.type === 'income' ? 'rgba(45,212,160,0.1)' : 'rgba(240,107,107,0.1)', color: r.type === 'income' ? 'var(--green)' : 'var(--red)' }}>{r.type}</span>
                </td>
                <td style={{ padding: '11px 0', borderBottom: '1px solid var(--border)', textAlign: 'right', fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 500, color: r.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                  {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
