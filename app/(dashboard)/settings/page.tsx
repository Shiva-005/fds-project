'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';

type SettingsSection = 'profile' | 'security' | 'notifications' | 'integrations';

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!on)} style={{ width: '36px', height: '20px', borderRadius: '10px', background: on ? 'rgba(201,168,76,0.3)' : 'var(--surface3)', border: `1px solid ${on ? 'var(--gold-dim)' : 'var(--border2)'}`, position: 'relative', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: '2px', left: on ? '18px' : '2px', width: '14px', height: '14px', borderRadius: '50%', background: on ? 'var(--gold)' : 'var(--text3)', transition: 'all 0.2s' }} />
    </div>
  );
}

function ToggleRow({ title, desc, on, onChange }: { title: string; desc: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '2px' }}>{title}</div>
        <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{desc}</div>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <h3 style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--text)', marginBottom: '16px' }}>{title}</h3>
      {children}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <div style={{ fontSize: '11px', color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500, fontFamily: 'var(--mono)' }}>{label}</div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [section, setSection] = useState<SettingsSection>('profile');
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({ name: user?.name ?? '', email: user?.email ?? '', timezone: 'IST (UTC+5:30)', bio: 'Finance lead managing company accounts.' });
  const [prefs, setPrefs] = useState({ emailNotifs: true, monthlyReport: true, twoFactor: false, softDelete: true, darkMode: true, compactView: false });
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

  const navItems: { key: SettingsSection; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'security', label: 'Security' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'integrations', label: 'Integrations' },
  ];

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600)); // simulate
    setSaving(false);
    toast('Profile saved successfully');
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.next) { toast('Fill in all fields', 'error'); return; }
    if (passwords.next !== passwords.confirm) { toast('Passwords do not match', 'error'); return; }
    if (passwords.next.length < 8) { toast('Password must be at least 8 characters', 'error'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setPasswords({ current: '', next: '', confirm: '' });
    toast('Password changed successfully');
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '8px',
    padding: '9px 12px', color: 'var(--text)', fontSize: '13px', fontFamily: 'var(--sans)',
    outline: 'none', width: '100%',
  };

  const primaryBtn: React.CSSProperties = {
    padding: '8px 18px', borderRadius: '7px', border: '1px solid var(--gold)',
    background: 'var(--gold)', color: '#080C14', fontSize: '12px', cursor: 'pointer',
    fontWeight: 600, fontFamily: 'var(--sans)', opacity: saving ? 0.6 : 1,
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '26px', color: 'var(--text)', marginBottom: '4px' }}>Settings</h1>
        <p style={{ fontSize: '13px', color: 'var(--text3)' }}>Configure your workspace preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px' }}>
        {/* Sidebar nav */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px', height: 'fit-content' }}>
          {navItems.map(item => (
            <div key={item.key} onClick={() => setSection(item.key)}
              style={{ padding: '9px 12px', borderRadius: '7px', fontSize: '13px', cursor: 'pointer', color: section === item.key ? 'var(--gold2)' : 'var(--text2)', background: section === item.key ? 'rgba(201,168,76,0.1)' : 'transparent', transition: 'all 0.15s', marginBottom: '1px' }}>
              {item.label}
            </div>
          ))}
          <div style={{ marginTop: '8px', padding: '9px 12px', borderRadius: '7px', fontSize: '13px', cursor: 'pointer', color: 'var(--red)', opacity: 0.7 }}>
            Danger Zone
          </div>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {section === 'profile' && (
            <>
              <SettingsCard title="Profile Information">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <FormField label="Full Name">
                    <input style={inputStyle} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                  </FormField>
                  <FormField label="Email">
                    <input style={inputStyle} value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                  </FormField>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <FormField label="Role">
                    <input style={{ ...inputStyle, opacity: 0.6 }} value={user?.role ?? ''} readOnly />
                  </FormField>
                  <FormField label="Timezone">
                    <select style={inputStyle} value={profile.timezone} onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}>
                      {['IST (UTC+5:30)', 'EST (UTC-5)', 'PST (UTC-8)', 'GMT (UTC+0)', 'CET (UTC+1)'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </FormField>
                </div>
                <FormField label="Bio">
                  <textarea style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} rows={2} value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} />
                </FormField>
                <div style={{ marginTop: '16px' }}>
                  <button onClick={handleSaveProfile} disabled={saving} style={primaryBtn}>{saving ? 'Saving…' : 'Save Changes'}</button>
                </div>
              </SettingsCard>

              <SettingsCard title="Account Info">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                  {[
                    { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A' },
                    { label: 'Role', value: user?.role ?? 'N/A' },
                    { label: 'Status', value: user?.status ?? 'N/A' },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--mono)', marginBottom: '4px' }}>{s.label}</div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', textTransform: 'capitalize' }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </SettingsCard>
            </>
          )}

          {section === 'security' && (
            <SettingsCard title="Change Password">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
                {[
                  { label: 'Current Password', key: 'current' },
                  { label: 'New Password', key: 'next' },
                  { label: 'Confirm New Password', key: 'confirm' },
                ].map(f => (
                  <FormField key={f.key} label={f.label}>
                    <input type="password" style={inputStyle} value={(passwords as Record<string, string>)[f.key]} onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))} />
                  </FormField>
                ))}
                <button onClick={handleChangePassword} disabled={saving} style={{ ...primaryBtn, marginTop: '4px', width: 'fit-content' }}>
                  {saving ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </SettingsCard>
          )}

          {section === 'notifications' && (
            <SettingsCard title="Notification Preferences">
              <div>
                {[
                  { key: 'emailNotifs', title: 'Email notifications', desc: 'Receive alerts for large transactions' },
                  { key: 'monthlyReport', title: 'Monthly report', desc: 'Auto-generate PDF on month end' },
                  { key: 'softDelete', title: 'Soft delete mode', desc: 'Archive records instead of permanently deleting' },
                  { key: 'darkMode', title: 'Dark mode', desc: 'Use the dark theme (default)' },
                  { key: 'compactView', title: 'Compact view', desc: 'Show more records per page' },
                ].map((item, i, arr) => (
                  <div key={item.key} style={{ ...(i === arr.length - 1 ? { paddingTop: '12px', borderTop: 'none' } : {}) }}>
                    <ToggleRow
                      title={item.title}
                      desc={item.desc}
                      on={(prefs as Record<string, boolean>)[item.key]}
                      onChange={v => setPrefs(p => ({ ...p, [item.key]: v }))}
                    />
                  </div>
                ))}
              </div>
              <button onClick={() => toast('Preferences saved')} style={{ ...primaryBtn, marginTop: '16px' }}>Save Preferences</button>
            </SettingsCard>
          )}

          {section === 'integrations' && (
            <SettingsCard title="Integrations">
              {[
                { name: 'MongoDB Atlas', status: 'connected', desc: 'Primary database connection' },
                { name: 'Webhook (Slack)', status: 'disconnected', desc: 'Send transaction alerts to Slack' },
                { name: 'Google Sheets Export', status: 'disconnected', desc: 'Sync records to Google Sheets' },
                { name: 'Razorpay', status: 'disconnected', desc: 'Import payment transactions automatically' },
              ].map(int => (
                <div key={int.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {int.name}
                      <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '3px', fontFamily: 'var(--mono)', background: int.status === 'connected' ? 'rgba(45,212,160,0.1)' : 'rgba(74,92,128,0.2)', color: int.status === 'connected' ? 'var(--green)' : 'var(--text3)' }}>{int.status}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{int.desc}</div>
                  </div>
                  <button onClick={() => toast(int.status === 'connected' ? `${int.name} disconnected` : `${int.name} connected!`)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text2)', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--mono)' }}>
                    {int.status === 'connected' ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </SettingsCard>
          )}
        </div>
      </div>
    </div>
  );
}
