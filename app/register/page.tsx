'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';

export default function RegisterPage() {
  const { register, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast('Please fill in all fields', 'error'); return; }
    if (form.password.length < 8) { toast('Password must be at least 8 characters', 'error'); return; }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) { toast('Password needs uppercase, lowercase and number', 'error'); return; }
    setSubmitting(true);
    const res = await register(form.name, form.email, form.password, form.role);
    setSubmitting(false);
    if (res.success) { toast('Account created! Welcome.'); router.replace('/dashboard'); }
    else toast(res.message, 'error');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(20,28,46,0.8)', border: '1px solid var(--border2)',
    borderRadius: '8px', padding: '11px 14px', color: 'var(--text)', fontSize: '14px',
    fontFamily: 'var(--sans)', outline: 'none', transition: 'border-color 0.2s',
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 8 ? 1 : /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password) ? (form.password.length >= 12 ? 3 : 2) : 1;
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];
  const strengthColors = ['', 'var(--red)', 'var(--gold)', 'var(--green)'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse,rgba(201,168,76,0.06) 0%,transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '32px', color: 'var(--gold2)', letterSpacing: '0.02em', marginBottom: '6px' }}>FDS</div>
          <div style={{ fontSize: '11px', color: 'var(--text3)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Finance OS · Create Account</div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Arjun Kumar' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
              ].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--mono)', marginBottom: '6px' }}>{f.label}</div>
                  <input type={f.type} style={inputStyle} placeholder={f.placeholder} value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    onFocus={e => (e.target.style.borderColor = 'var(--gold-dim)')} onBlur={e => (e.target.style.borderColor = 'var(--border2)')} />
                </div>
              ))}

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--mono)', marginBottom: '6px' }}>Password</div>
                <input type="password" style={inputStyle} placeholder="Min 8 chars, upper + lower + number" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  onFocus={e => (e.target.style.borderColor = 'var(--gold-dim)')} onBlur={e => (e.target.style.borderColor = 'var(--border2)')} />
                {form.password.length > 0 && (
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(strength / 3) * 100}%`, background: strengthColors[strength], borderRadius: '2px', transition: 'all 0.3s' }} />
                    </div>
                    <span style={{ fontSize: '10px', color: strengthColors[strength], fontFamily: 'var(--mono)' }}>{strengthLabels[strength]}</span>
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--mono)', marginBottom: '6px' }}>Role</div>
                <select style={inputStyle} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="viewer">Viewer — Read only</option>
                  <option value="analyst">Analyst — Read + Analytics</option>
                  <option value="admin">Admin — Full access</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={submitting} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--gold)', background: 'var(--gold)', color: '#080C14', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', opacity: submitting ? 0.7 : 1, transition: 'opacity 0.2s' }}>
              {submitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text3)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--gold2)', textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
