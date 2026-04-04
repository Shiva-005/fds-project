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

  const updateUser = useCallback(async (id: string, updates: { role?: string; status?: string }) => {
    let success = true;
    let message = 'User updated successfully';
    if (updates.role) {
      const res = await api.put(`/users/${id}`, { role: updates.role });
      if (!res.success) { success = false; message = res.message; }
    }
    if (updates.status) {
      const res = await api.patch(`/users/${id}`, { status: updates.status });
      if (!res.success) { success = false; message = res.message; }
    }
    if (success) fetchUsers();
    return { success, message };
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id: string) => {
    const res = await api.delete(`/users/${id}`);
    if (res.success) fetchUsers();
    return { success: res.success, message: res.message };
  }, [fetchUsers]);

  return { users, loading, error, updateUser, deleteUser, refetch: fetchUsers };
}
