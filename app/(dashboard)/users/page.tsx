'use client';

import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { User, UserRole, UserStatus } from '@/types';

const avatarColors: Record<number, string> = {
  0: 'linear-gradient(135deg,#8B6B2A,#C9A84C)',
  1: 'linear-gradient(135deg,#2563EB,#60A5FA)',
  2: 'linear-gradient(135deg,#059669,#34D399)',
  3: 'linear-gradient(135deg,#7C3AED,#A78BFA)',
  4: 'linear-gradient(135deg,#DC2626,#F87171)',
  5: 'linear-gradient(135deg,#0891B2,#67E8F9)',
};

const roleBadge = (role: string) => {
  const styles: Record<string, { bg: string; color: string }> = {
    admin: { bg: 'rgba(201,168,76,0.12)', color: 'var(--gold)' },
    analyst: { bg: 'rgba(74,144,226,0.1)', color: 'var(--blue)' },
    viewer: { bg: 'rgba(139,107,240,0.1)', color: 'var(--purple)' },
  };
  return styles[role] ?? styles.viewer;
};

export default function UsersPage() {
  const { users, loading, error, updateUser, deleteUser } = useUsers();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('viewer');
  const [editStatus, setEditStatus] = useState<UserStatus>('active');
  const [submitting, setSubmitting] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  const filtered = users.filter(u => {
    const matchSearch = !searchVal || u.name.toLowerCase().includes(searchVal.toLowerCase()) || u.email.toLowerCase().includes(searchVal.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openEdit = (u: User) => { setEditUser(u); setEditRole(u.role); setEditStatus(u.status); };

  const handleSave = async () => {
    if (!editUser) return;
    const updatePayload: { role?: UserRole; status?: UserStatus } = {};
    if (editRole !== editUser.role) updatePayload.role = editRole;
    if (editStatus !== editUser.status) updatePayload.status = editStatus;
    if (Object.keys(updatePayload).length === 0) {
      toast('No changes made');
      setEditUser(null);
      return;
    }

    const userId = editUser._id || (editUser as any).id || '';
    if (!userId) {
      toast('Unable to update user: missing ID', 'error');
      setEditUser(null);
      return;
    }

    setSubmitting(true);
    const res = await updateUser(userId, updatePayload);
    setSubmitting(false);

    if (res.success) {
      toast('User updated successfully');
      setEditUser(null);
    } else {
      toast(res.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const userId = deleteTarget._id || (deleteTarget as any).id || '';
    if (!userId) {
      toast('Unable to delete user: missing ID', 'error');
      setDeleteTarget(null);
      return;
    }
    setSubmitting(true);
    const res = await deleteUser(userId);
    setSubmitting(false);
    if (res.success) { toast('User deleted'); setDeleteTarget(null); }
    else toast(res.message, 'error');
  };

  const BtnStyle = (variant: 'primary' | 'ghost' | 'danger') => ({
    padding: '7px 14px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--sans)',
    ...(variant === 'primary' ? { border: '1px solid var(--gold)', background: 'var(--gold)', color: '#080C14', fontWeight: 600 } :
      variant === 'danger' ? { border: '1px solid rgba(240,107,107,0.5)', background: 'rgba(240,107,107,0.1)', color: 'var(--red)' } :
        { border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text2)' }),
  });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '26px', color: 'var(--text)', marginBottom: '4px' }}>User Management</h1>
        <p style={{ fontSize: '13px', color: 'var(--text3)' }}>Role-based access control — {users.length} users</p>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '8px 12px' }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="#4A5C80" strokeWidth="1.3"/><path d="M9 9l2.5 2.5" stroke="#4A5C80" strokeWidth="1.3" strokeLinecap="round"/></svg>
          <input placeholder="Search users…" value={searchVal} onChange={e => setSearchVal(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '13px', fontFamily: 'var(--sans)', flex: 1 }} />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text2)', fontSize: '12px', fontFamily: 'var(--sans)', outline: 'none', cursor: 'pointer' }}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="analyst">Analyst</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(240,107,107,0.1)', border: '1px solid rgba(240,107,107,0.3)', color: 'var(--red)', fontSize: '13px', marginBottom: '16px' }}>
          {error} — {isAdmin ? 'Check your permissions' : 'Admin access required'}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px', height: '160px', opacity: 0.4 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
          {filtered.map((u, idx) => {
            const rb = roleBadge(u.role);
            const getUserId = (user: any) => user._id || (user as any).id || '';
            const isSelf = getUserId(u) === getUserId(currentUser);
            return (
              <div key={u._id || `${u.email}-${idx}`} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px', transition: 'border-color 0.2s', cursor: 'default' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: avatarColors[idx % 6], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name} {isSelf && <span style={{ fontSize: '10px', color: 'var(--text3)' }}>(you)</span>}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.05em', background: rb.bg, color: rb.color }}>{u.role}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.status === 'active' ? 'var(--green)' : 'var(--text3)', display: 'inline-block' }} />
                    {u.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                  {[
                    { label: 'Joined', value: new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
                    { label: 'Status', value: u.status },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'var(--surface2)', borderRadius: '7px', padding: '8px 10px' }}>
                      <div style={{ fontSize: '9px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--mono)' }}>{s.label}</div>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', marginTop: '2px', textTransform: 'capitalize' }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {isAdmin && !isSelf && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => openEdit(u)} style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text2)', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--mono)' }}>Edit</button>
                    <button onClick={() => setDeleteTarget(u)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(240,107,107,0.3)', background: 'none', color: 'var(--red)', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--mono)' }}>Del</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={`Edit — ${editUser?.name}`} width={400}
        footer={<>
          <button onClick={() => setEditUser(null)} style={BtnStyle('ghost')}>Cancel</button>
          <button onClick={handleSave} disabled={submitting} style={{ ...BtnStyle('primary'), opacity: submitting ? 0.6 : 1 }}>{submitting ? 'Saving…' : 'Save Changes'}</button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { label: 'Role', value: editRole, onChange: (v: string) => setEditRole(v as UserRole), options: [['viewer','Viewer'],['analyst','Analyst'],['admin','Admin']] },
            { label: 'Status', value: editStatus, onChange: (v: string) => setEditStatus(v as UserStatus), options: [['active','Active'],['inactive','Inactive']] },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--mono)' }}>{f.label}</div>
              <select value={f.value} onChange={e => f.onChange(e.target.value)} className="form-input">
                {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete User" width={380}
        footer={<>
          <button onClick={() => setDeleteTarget(null)} style={BtnStyle('ghost')}>Cancel</button>
          <button onClick={handleDelete} disabled={submitting} style={{ ...BtnStyle('danger'), opacity: submitting ? 0.6 : 1 }}>{submitting ? 'Deleting…' : 'Delete User'}</button>
        </>}>
        <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.6 }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text)' }}>{deleteTarget?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
