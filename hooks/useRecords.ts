import { useState, useCallback, useEffect } from 'react';
import { FinancialRecord, ApiResponse, RecordFilters } from '@/types';
import { api } from '@/lib/api';

export function useRecords(initialFilters?: Partial<RecordFilters>) {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RecordFilters>({
    page: 1,
    limit: 10,
    sortBy: 'date',
    sortOrder: 'desc',
    ...initialFilters,
  });

  const fetchRecords = useCallback(async (f: RecordFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(f).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.set(k, String(v));
      });
      const res = await api.get<FinancialRecord[]>(`/records?${params}`);
      if (res.success && res.data) {
        setRecords(res.data);
        if (res.meta) setMeta(res.meta);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords(filters);
  }, [filters, fetchRecords]);

  const updateFilters = useCallback((updates: Partial<RecordFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates, page: updates.page ?? 1 }));
  }, []);

  const createRecord = useCallback(async (data: {
    amount: number; type: string; category: string; date: string; note?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const res = await api.post<FinancialRecord>('/records', data);
    if (res.success) fetchRecords(filters);
    return { success: res.success, message: res.message };
  }, [filters, fetchRecords]);

  const updateRecord = useCallback(async (id: string, data: Partial<FinancialRecord>): Promise<{ success: boolean; message: string }> => {
    const res = await api.patch<FinancialRecord>(`/records/${id}`, data);
    if (res.success) fetchRecords(filters);
    return { success: res.success, message: res.message };
  }, [filters, fetchRecords]);

  const deleteRecord = useCallback(async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/records/${id}`);
    if (res.success) fetchRecords(filters);
    return { success: res.success, message: res.message };
  }, [filters, fetchRecords]);

  return { records, meta, loading, error, filters, updateFilters, createRecord, updateRecord, deleteRecord, refetch: () => fetchRecords(filters) };
}
