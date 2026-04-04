'use client';

import { DashboardSummary } from '@/types';

function fmt(n: number): string {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + 'Cr';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000) return '₹' + (n / 1000).toFixed(0) + 'K';
  return '₹' + n;
}

interface Props { summary: DashboardSummary | null; loading: boolean }

export function KpiCards({ summary, loading }: Props) {
  const cards = [
    { label: 'Net Balance', value: summary ? fmt(summary.netBalance) : '—', badge: '+12.4%', up: true, accent: 'gold', icon: '₹' },
    { label: 'Total Income', value: summary ? fmt(summary.totalIncome) : '—', badge: `${summary?.incomeCount ?? 0} txns`, up: true, accent: 'green', icon: '↑' },
    { label: 'Total Expense', value: summary ? fmt(summary.totalExpense) : '—', badge: `${summary?.expenseCount ?? 0} txns`, up: false, accent: 'red', icon: '↓' },
    { label: 'Transactions', value: summary ? String((summary.incomeCount ?? 0) + (summary.expenseCount ?? 0)) : '—', badge: 'All time', up: true, accent: 'blue', icon: '#' },
  ];

  const accentColors: Record<string, { bg: string; color: string; icon: string }> = {
    gold: { bg: 'rgba(201,168,76,0.12)', color: 'var(--gold)', icon: 'rgba(201,168,76,0.12)' },
    green: { bg: 'rgba(45,212,160,0.08)', color: 'var(--green)', icon: 'rgba(45,212,160,0.1)' },
    red: { bg: 'rgba(240,107,107,0.08)', color: 'var(--red)', icon: 'rgba(240,107,107,0.1)' },
    blue: { bg: 'rgba(74,144,226,0.08)', color: 'var(--blue)', icon: 'rgba(74,144,226,0.1)' },
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
      {cards.map((c) => {
        const ac = accentColors[c.accent];
        return (
          <div key={c.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px', position: 'relative', overflow: 'hidden', opacity: loading ? 0.6 : 1, transition: 'opacity 0.3s' }}>
            <div style={{ position: 'absolute', top: '16px', right: '16px', width: '28px', height: '28px', borderRadius: '7px', background: ac.icon, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: ac.color, fontFamily: 'var(--mono)', fontWeight: 600 }}>{c.icon}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '8px', fontFamily: 'var(--mono)' }}>{c.label}</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '26px', color: 'var(--text)', marginBottom: '6px' }}>{c.value}</div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '2px 7px', borderRadius: '4px', fontFamily: 'var(--mono)', background: c.up ? 'rgba(45,212,160,0.1)' : 'rgba(240,107,107,0.1)', color: c.up ? 'var(--green)' : 'var(--red)' }}>
              {c.up ? '▲' : '▲'} {c.badge}
            </span>
          </div>
        );
      })}
    </div>
  );
}
