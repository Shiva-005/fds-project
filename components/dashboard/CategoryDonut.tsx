'use client';

import { useEffect, useRef } from 'react';
import { CategoryBreakdown } from '@/types';
import { useAuth } from '@/context/AuthContext';

const COLORS = ['#2DD4A0','#C9A84C','#4A90E2','#F06B6B','#8B6BF0','#E87040','#60B9E0','#F0C060'];

export function CategoryDonut({ categories, loading }: { categories: CategoryBreakdown[]; loading: boolean }) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<unknown>(null);

  const items = categories.length > 0
    ? categories.slice(0, 6).map((c, i) => ({ name: c.category, value: c.totalAmount, color: COLORS[i % COLORS.length] }))
    : [];

  const total = items.reduce((a, c) => a + c.value, 0) || 1;

  useEffect(() => {
    if (typeof window === 'undefined' || !canvasRef.current) return;
    // @ts-expect-error Chart.js global
    if (!window.Chart) return;
    if (chartRef.current) { // @ts-expect-error Chart.js
      chartRef.current.destroy();
    }
    if (categories.length === 0) return;
    // @ts-expect-error Chart.js global
    chartRef.current = new window.Chart(canvasRef.current, {
      type: 'doughnut',
      data: { labels: items.map(i => i.name), datasets: [{ data: items.map(i => i.value), backgroundColor: items.map(i => i.color), borderWidth: 0, hoverOffset: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { display: false }, tooltip: { backgroundColor: '#141C2E', titleColor: '#E8EDF5', bodyColor: '#8A9BBF', borderColor: '#1E2D45', borderWidth: 1 } } },
    });
  }, [categories]);

  if (user?.role === 'viewer') {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--text)' }}>By Category</h3>
          <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>0 categories</span>
        </div>
        <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '13px' }}>
          You do not have access to category data
        </div>
      </div>
    );
  }

  if (categories.length === 0 && !loading) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--text)' }}>By Category</h3>
          <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>0 categories</span>
        </div>
        <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '13px' }}>
          No category data available
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <h3 style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--text)' }}>By Category</h3>
        <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{items.length} categories</span>
      </div>
      <div style={{ position: 'relative', height: '140px', marginBottom: '16px', opacity: loading ? 0.4 : 1 }}>
        <canvas ref={canvasRef} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((c) => (
          <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text2)', minWidth: '72px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.color, display: 'inline-block', flexShrink: 0 }} />{c.name}
            </div>
            <div style={{ flex: 1, height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round((c.value / total) * 100)}%`, background: c.color, borderRadius: '3px', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', minWidth: '32px', textAlign: 'right', fontFamily: 'var(--mono)' }}>{Math.round((c.value / total) * 100)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
