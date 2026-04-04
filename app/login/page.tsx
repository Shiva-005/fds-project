'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast('Please fill in all fields', 'error'); return; }
    setSubmitting(true);
    const res = await login(form.email, form.password);
    setSubmitting(false);
    if (res.success) { toast('Welcome back!'); router.replace('/dashboard'); }
    else toast(res.message, 'error');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(20,28,46,0.8)', border: '1px solid var(--border2)',
    borderRadius: '8px', padding: '11px 14px', color: 'var(--text)', fontSize: '14px',
    fontFamily: 'var(--sans)', outline: 'none', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse,rgba(201,168,76,0.06) 0%,transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '32px', color: 'var(--gold2)', letterSpacing: '0.02em', marginBottom: '6px' }}>FDS</div>
          <div style={{ fontSize: '11px', color: 'var(--text3)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>Finance OS · Sign In</div>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--mono)', marginBottom: '6px' }}>Email</div>
                <input type="email" style={inputStyle} placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  onFocus={e => (e.target.style.borderColor = 'var(--gold-dim)')} onBlur={e => (e.target.style.borderColor = 'var(--border2)')} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--mono)', marginBottom: '6px' }}>Password</div>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: '40px' }} placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    onFocus={e => (e.target.style.borderColor = 'var(--gold-dim)')} onBlur={e => (e.target.style.borderColor = 'var(--border2)')} />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '11px', fontFamily: 'var(--mono)' }}>
                    {showPass ? 'hide' : 'show'}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={submitting} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--gold)', background: 'var(--gold)', color: '#080C14', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', opacity: submitting ? 0.7 : 1, transition: 'opacity 0.2s' }}>
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text3)' }}>
          No account?{' '}
          <Link href="/register" style={{ color: 'var(--gold2)', textDecoration: 'none' }}>Register here</Link>
        </div>
      </div>
    </div>
  );
}
