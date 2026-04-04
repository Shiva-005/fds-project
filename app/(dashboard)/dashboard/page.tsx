'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { CategoryDonut } from '@/components/dashboard/CategoryDonut';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';

export default function DashboardPage() {
  const { user } = useAuth();
  const { summary, categories, trends, recent, loading } = useDashboard();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '26px', color: 'var(--text)', marginBottom: '4px' }}>
          {greeting}, {user?.name?.split(' ')[0] ?? 'there'}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text3)' }}>Here&apos;s your financial overview</p>
      </div>

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
              {summary ? `₹${((summary.netBalance) / 100000).toFixed(1)}L net` : '—'}
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
    </div>
  );
}
