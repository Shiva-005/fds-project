'use client';

import { useEffect, useRef } from 'react';
import { MonthlyTrend } from '@/types';
import { useAuth } from '@/context/AuthContext';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmt(n: number) {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000) return '₹' + (n / 1000).toFixed(0) + 'K';
  return '₹' + n;
}

export function TrendChart({ trends, loading }: { trends: MonthlyTrend[]; loading: boolean }) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<unknown>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !canvasRef.current) return;
    // @ts-expect-error Chart.js global
    if (!window.Chart) return;

    if (chartRef.current) {
      // @ts-expect-error Chart.js
      chartRef.current.destroy();
    }

    if (trends.length === 0) return;

    const labels = trends.map((t) => {
      const monthName = MONTHS[t.month - 1];
      const currentYear = new Date().getFullYear();
      return t.year === currentYear ? monthName : `${monthName} ${t.year}`;
    });

    const incomeData = trends.map((t) => t.data.find((d) => d.type === 'income')?.total ?? 0);

    const expenseData = trends.map((t) => t.data.find((d) => d.type === 'expense')?.total ?? 0);

    const netData = incomeData.map((v, i) => v - expenseData[i]);

    // @ts-expect-error Chart.js global
    chartRef.current = new window.Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Income', data: incomeData, backgroundColor: 'rgba(45,212,160,0.25)', borderColor: '#2DD4A0', borderWidth: 1.5, borderRadius: 4, order: 2 },
          { label: 'Expense', data: expenseData, backgroundColor: 'rgba(240,107,107,0.2)', borderColor: '#F06B6B', borderWidth: 1.5, borderRadius: 4, order: 3 },
          { type: 'line', label: 'Net', data: netData, borderColor: '#C9A84C', borderWidth: 2, pointBackgroundColor: '#C9A84C', pointRadius: 3, tension: 0.4, fill: false, order: 1 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#141C2E', titleColor: '#E8EDF5', bodyColor: '#8A9BBF', borderColor: '#1E2D45', borderWidth: 1, callbacks: { label: (ctx: { dataset: { label: string }; parsed: { y: number } }) => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` } } },
        scales: {
          x: { grid: { color: 'rgba(30,45,69,0.6)', lineWidth: 0.5 }, ticks: { color: '#4A5C80', font: { size: 11 } } },
          y: { grid: { color: 'rgba(30,45,69,0.6)', lineWidth: 0.5 }, ticks: { color: '#4A5C80', font: { size: 10 }, callback: (v: number) => fmt(v) } },
        },
      },
    });
  }, [trends]);

  if (user?.role === 'viewer') {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
        <div style={{ marginBottom: '18px' }}>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--text)' }}>Revenue Trend</h3>
        </div>
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '13px' }}>
          You do not have access to trend data
        </div>
      </div>
    );
  }

  if (trends.length === 0 && !loading) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
        <div style={{ marginBottom: '18px' }}>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--text)' }}>Revenue Trend</h3>
        </div>
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '13px' }}>
          No trend data available
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <h3 style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--text)' }}>Revenue Trend</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          {[['Income', '#2DD4A0'], ['Expense', '#F06B6B'], ['Net', '#C9A84C']].map(([l, c]) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text3)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: c, display: 'inline-block' }} />{l}
            </span>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', height: '200px', opacity: loading ? 0.4 : 1, transition: 'opacity 0.3s' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
