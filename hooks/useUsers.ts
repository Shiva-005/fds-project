import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<User[]>(`/users${query ? `?${query}` : ''}`);
      if (res.success && res.data) setUsers(res.data);
      else setError(res.message);
    } catch {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateRole = useCallback(async (id: string, role: string) => {
    const res = await api.put(`/users/${id}`, { role });
    if (res.success) fetchUsers();
    return { success: res.success, message: res.message };
  }, [fetchUsers]);

  const updateStatus = useCallback(async (id: string, status: string) => {
    const res = await api.patch(`/users/${id}`, { status });
    if (res.success) fetchUsers();
    return { success: res.success, message: res.message };
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id: string) => {
    const res = await api.delete(`/users/${id}`);
    if (res.success) fetchUsers();
    return { success: res.success, message: res.message };
  }, [fetchUsers]);

  return { users, loading, error, updateRole, updateStatus, deleteUser, refetch: fetchUsers };
}
