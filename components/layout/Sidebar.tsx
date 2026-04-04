'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  {
    section: 'Core',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'grid' },
      { label: 'Records', href: '/records', icon: 'list' },
      { label: 'Analytics', href: '/analytics', icon: 'chart' },
    ],
  },
  {
    section: 'Manage',
    items: [
      { label: 'Users', href: '/users', icon: 'users', roles: ['admin'] },
      { label: 'Settings', href: '/settings', icon: 'settings' },
    ],
  },
];

const icons: Record<string, JSX.Element> = {
  grid: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.8"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.4"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.4"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.8"/></svg>,
  list: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h12M2 8h12M2 13h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  chart: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 12L5 7l3 3 3-4 4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  users: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.93 2.93l1.41 1.41M11.66 11.66l1.41 1.41M2.93 13.07l1.41-1.41M11.66 4.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside style={{
      width: '220px', background: 'var(--surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--gold2)', letterSpacing: '0.02em' }}>FDS</div>
        <div style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '2px', fontFamily: 'var(--mono)' }}>Finance OS</div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {navItems.map((group) => (
          <div key={group.section}>
            <div style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text3)', padding: '8px 10px 4px', fontWeight: 500 }}>
              {group.section}
            </div>
            {group.items.map((item) => {
              if (item.roles && !item.roles.includes(user?.role ?? '')) return null;
              const active = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px',
                    borderRadius: '7px', cursor: 'pointer', marginBottom: '1px',
                    fontSize: '13px', fontWeight: 400, transition: 'all 0.15s', position: 'relative',
                    background: active ? 'linear-gradient(90deg,rgba(201,168,76,0.12),transparent)' : 'transparent',
                    color: active ? 'var(--gold2)' : 'var(--text2)',
                  }}>
                    {active && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '2px', height: '20px', background: 'var(--gold)', borderRadius: '0 2px 2px 0' }} />}
                    <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}>{icons[item.icon]}</span>
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: 'linear-gradient(135deg,var(--gold-dim),var(--gold))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 600, color: '#080C14', flexShrink: 0,
          }}>
            {user?.name?.slice(0, 2).toUpperCase() ?? 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: '2px', flexShrink: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 7h7M9 5l2 2-2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 2H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
