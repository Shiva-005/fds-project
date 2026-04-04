'use client';

import { useEffect, useRef } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/context/AuthContext';
import { MonthlyTrend, CategoryBreakdown } from '@/types';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#2DD4A0','#C9A84C','#4A90E2','#F06B6B','#8B6BF0','#E87040','#60B9E0','#F0C060'];

function fmt(n: number) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + 'Cr';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000) return '₹' + (n / 1000).toFixed(0) + 'K';
  return '₹' + n;
}

function useChart(
  ref: React.RefObject<HTMLCanvasElement | null>,
  deps: unknown[],
  config: () => object | null
) {
  const chartRef = useRef<unknown>(null);
  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return;
    // @ts-expect-error Chart.js global
    if (!window.Chart) return;
    if (chartRef.current) { // @ts-expect-error Chart.js
      chartRef.current.destroy();
    }
    const cfg = config();
    if (!cfg) return;
    // @ts-expect-error Chart.js global
    chartRef.current = new window.Chart(ref.current, cfg);
    return () => { if (chartRef.current) { // @ts-expect-error Chart.js
      chartRef.current.destroy(); chartRef.current = null; } };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

function AnalyticsChart({ trends }: { trends: MonthlyTrend[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const hasData = trends.length > 0;
  const labels = hasData ? trends.map(t => MONTHS[t.month - 1]) : [];
  const incomeData = hasData ? trends.map(t => t.data.find(d => d.type === 'income')?.total ?? 0) : [];
  const expenseData = hasData ? trends.map(t => t.data.find(d => d.type === 'expense')?.total ?? 0) : [];
  const netData = incomeData.map((v, i) => v - expenseData[i]);

  useChart(ref, [trends], () => {
    if (!hasData) return null;
    return {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Income', data: incomeData, backgroundColor: 'rgba(45,212,160,0.2)', borderColor: '#2DD4A0', borderWidth: 1.5, borderRadius: 3, order: 2 },
          { label: 'Expense', data: expenseData, backgroundColor: 'rgba(240,107,107,0.2)', borderColor: '#F06B6B', borderWidth: 1.5, borderRadius: 3, order: 3 },
          { type: 'line', label: 'Net', data: netData, borderColor: '#C9A84C', borderWidth: 2, pointBackgroundColor: '#C9A84C', pointRadius: 3, tension: 0.4, fill: false, order: 1 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#141C2E', titleColor: '#E8EDF5', bodyColor: '#8A9BBF', borderColor: '#1E2D45', borderWidth: 1, callbacks: { label: (ctx: { dataset: { label: string }; parsed: { y: number } }) => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` } } },
        scales: {
          x: { grid: { color: 'rgba(30,45,69,0.5)', lineWidth: 0.5 }, ticks: { color: '#4A5C80', font: { size: 11 } } },
          y: { grid: { color: 'rgba(30,45,69,0.5)', lineWidth: 0.5 }, ticks: { color: '#4A5C80', font: { size: 10 }, callback: (v: number) => fmt(v) } },
        },
      },
    };
  });

  if (!hasData) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '14px', textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--text)' }}>Income vs Expense — 12 Month View</h3>
        <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '10px' }}>No data available. Add some financial records to see analytics.</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <h3 style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--text)' }}>Income vs Expense — 12 Month View</h3>
        <div style={{ display: 'flex', gap: '14px' }}>
          {[['Income','#2DD4A0'],['Expense','#F06B6B'],['Net','#C9A84C']].map(([l,c]) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text3)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: c, display: 'inline-block' }} />{l}
            </span>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', height: '260px' }}><canvas ref={ref} /></div>
    </div>
  );
}

function ExpenseDonut({ categories }: { categories: CategoryBreakdown[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const expenseCats = categories.filter(c => c.breakdown.some(b => b.type === 'expense')).slice(0, 6);
  const hasData = expenseCats.length > 0;
  const labels = hasData ? expenseCats.map(c => c.category) : [];
  const data = hasData ? expenseCats.map(c => c.breakdown.find(b => b.type === 'expense')?.total ?? 0) : [];

  useChart(ref, [categories], () => {
    if (!hasData) return null;
    return {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: COLORS, borderWidth: 0, hoverOffset: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { display: true, position: 'bottom', labels: { color: '#8A9BBF', font: { size: 10 }, boxWidth: 8, padding: 10 } }, tooltip: { backgroundColor: '#141C2E', titleColor: '#E8EDF5', bodyColor: '#8A9BBF', borderColor: '#1E2D45', borderWidth: 1 } } },
    };
  });

  if (!hasData) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
        <div style={{ marginBottom: '18px' }}><h3 style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--text)' }}>Expense Breakdown</h3></div>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ fontSize: '13px', color: 'var(--text3)' }}>No expense data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <div style={{ marginBottom: '18px' }}><h3 style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--text)' }}>Expense Breakdown</h3></div>
      <div style={{ position: 'relative', height: '220px' }}><canvas ref={ref} /></div>
    </div>
  );
}

function IncomeBar({ categories }: { categories: CategoryBreakdown[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const incomeCats = categories.filter(c => c.breakdown.some(b => b.type === 'income')).slice(0, 6);
  const hasData = incomeCats.length > 0;
  const labels = hasData ? incomeCats.map(c => c.category) : [];
  const data = hasData ? incomeCats.map(c => c.breakdown.find(b => b.type === 'income')?.total ?? 0) : [];

  useChart(ref, [categories], () => {
    if (!hasData) return null;
    return {
      type: 'bar',
      data: { labels, datasets: [{ data, backgroundColor: COLORS, borderWidth: 0, borderRadius: 4 }] },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#141C2E', titleColor: '#E8EDF5', bodyColor: '#8A9BBF', borderColor: '#1E2D45', borderWidth: 1, callbacks: { label: (ctx: { parsed: { x: number } }) => ` ${fmt(ctx.parsed.x)}` } } },
        scales: {
          x: { grid: { color: 'rgba(30,45,69,0.5)', lineWidth: 0.5 }, ticks: { color: '#4A5C80', font: { size: 10 }, callback: (v: number) => fmt(v) } },
          y: { grid: { display: false }, ticks: { color: '#8A9BBF', font: { size: 11 } } },
        },
      },
    };
  });

  if (!hasData) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
        <div style={{ marginBottom: '18px' }}><h3 style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--text)' }}>Top Income Sources</h3></div>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ fontSize: '13px', color: 'var(--text3)' }}>No income data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <div style={{ marginBottom: '18px' }}><h3 style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--text)' }}>Top Income Sources</h3></div>
      <div style={{ position: 'relative', height: '220px' }}><canvas ref={ref} /></div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { summary, categories, trends, loading } = useDashboard();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'admin') {
      console.log('Admin accessing analytics dashboard');
    }
  }, [user]);

  const hasData = summary && (summary.totalIncome > 0 || summary.totalExpense > 0);
  const savingsRate = hasData ? Math.round(((summary.totalIncome - summary.totalExpense) / summary.totalIncome) * 100) : 0;
  const avgIncome = hasData ? summary.totalIncome / 6 : 0;
  const avgExpense = hasData ? summary.totalExpense / 6 : 0;

  const kpis = [
    { label: 'Savings Rate', value: loading ? '—' : hasData ? `${savingsRate}%` : 'N/A', badge: hasData ? '▲ vs last period' : '', accent: hasData ? 'gold' : 'neutral' },
    { label: 'Avg Monthly Income', value: loading ? '—' : hasData ? fmt(avgIncome) : 'N/A', badge: hasData ? '▲ 6.8%' : '', accent: hasData ? 'green' : 'neutral' },
    { label: 'Avg Monthly Expense', value: loading ? '—' : hasData ? fmt(avgExpense) : 'N/A', badge: hasData ? '▲ 1.2%' : '', accent: hasData ? 'red' : 'neutral' },
  ];

  const accentMap: Record<string, string> = { gold: 'var(--gold)', green: 'var(--green)', red: 'var(--red)', neutral: 'var(--text3)' };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '26px', color: 'var(--text)', marginBottom: '4px' }}>Analytics</h1>
        <p style={{ fontSize: '13px', color: 'var(--text3)' }}>Deep dive into financial performance</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px', opacity: loading ? 0.6 : 1, transition: 'opacity 0.3s' }}>
            <div style={{ fontSize: '11px', color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '8px', fontFamily: 'var(--mono)' }}>{k.label}</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '26px', color: 'var(--text)', marginBottom: '6px' }}>{k.value}</div>
            <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '4px', fontFamily: 'var(--mono)', background: 'rgba(45,212,160,0.1)', color: accentMap[k.accent] }}>{k.badge}</span>
          </div>
        ))}
      </div>

      <AnalyticsChart trends={trends} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <ExpenseDonut categories={categories} />
        <IncomeBar categories={categories} />
      </div>
    </div>
  );
}
