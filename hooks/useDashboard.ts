import { useState, useEffect } from 'react';
import { DashboardSummary, CategoryBreakdown, MonthlyTrend, FinancialRecord } from '@/types';
import { api } from '@/lib/api';

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [recent, setRecent] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [summaryRes, recentRes] = await Promise.all([
          api.get<DashboardSummary>('/dashboard/summary'),
          api.get<FinancialRecord[]>('/dashboard/recent'),
        ]);
        if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data);
        if (recentRes.success && recentRes.data) setRecent(recentRes.data);

        // These require analyst/admin
        const [catRes, trendRes] = await Promise.all([
          api.get<CategoryBreakdown[]>('/dashboard/category-breakdown'),
          api.get<MonthlyTrend[]>('/dashboard/trends?months=6'),
        ]);
        if (catRes.success && catRes.data) setCategories(catRes.data);
        if (trendRes.success && trendRes.data) setTrends(trendRes.data);
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return { summary, categories, trends, recent, loading, error };
}
