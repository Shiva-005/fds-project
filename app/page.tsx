'use client';

import { useState } from 'react';

type Tab = 'auth' | 'records' | 'dashboard' | 'users';
type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface RequestLog {
  id: number;
  method: Method;
  url: string;
  status: number;
  data: unknown;
  timestamp: string;
}

const BASE = '/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('auth');
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({
    // Auth
    reg_name: 'Admin User',
    reg_email: 'admin@example.com',
    reg_password: 'Admin123!',
    reg_role: 'admin',
    login_email: 'admin@example.com',
    login_password: 'Admin123!',
    // Records
    rec_amount: '1500',
    rec_type: 'income',
    rec_category: 'Salary',
    rec_date: new Date().toISOString(),
    rec_note: 'Monthly salary',
    rec_id: '',
    // Users
    user_id: '',
    user_role: 'analyst',
    user_status: 'inactive',
  });

  const log = (method: Method, url: string, status: number, data: unknown) => {
    setLogs((prev) => [
      { id: Date.now(), method, url, status, data, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 19),
    ]);
  };

  const req = async (method: Method, path: string, body?: unknown) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });
      const data = await res.json();
      log(method, path, res.status, data);
      if (data?.data?.token) setToken(data.data.token);
      return data;
    } catch (e) {
      log(method, path, 0, { error: String(e) });
    } finally {
      setLoading(false);
    }
  };

  const f = (key: string) => formData[key] ?? '';
  const set = (key: string, val: string) => setFormData((p) => ({ ...p, [key]: val }));

  const inputCls = 'w-full bg-[#0f1117] border border-[#2a2d3e] rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600';
  const btnCls = (color: string) => `px-4 py-2 rounded text-sm font-medium transition-all ${color}`;
  const labelCls = 'block text-xs text-slate-500 mb-1 uppercase tracking-wider';

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200 font-mono">
      {/* Header */}
      <header className="border-b border-[#2a2d3e] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-indigo-400 tracking-tight">⬡ Finance Dashboard API</h1>
          <p className="text-xs text-slate-500 mt-0.5">Backend Test Console · Next.js + MongoDB + JWT + RBAC</p>
        </div>
        <div className="flex items-center gap-3">
          {token && (
            <span className="text-xs bg-green-900/40 text-green-400 border border-green-800 px-3 py-1 rounded-full">
              ✓ Authenticated
            </span>
          )}
          {loading && (
            <span className="text-xs text-indigo-400 animate-pulse">Loading...</span>
          )}
        </div>
      </header>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Left Panel */}
        <div className="w-[420px] border-r border-[#2a2d3e] flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[#2a2d3e]">
            {(['auth', 'records', 'dashboard', 'users'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-2.5 text-xs uppercase tracking-widest transition-all ${activeTab === t
                  ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500'
                  : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">

            {/* ─── AUTH ──────────────────────────────────────────── */}
            {activeTab === 'auth' && (
              <>
                <Section title="Register User">
                  <Field label="Name" value={f('reg_name')} onChange={(v) => set('reg_name', v)} />
                  <Field label="Email" value={f('reg_email')} onChange={(v) => set('reg_email', v)} />
                  <Field label="Password" value={f('reg_password')} onChange={(v) => set('reg_password', v)} type="password" />
                  <SelectField label="Role" value={f('reg_role')} onChange={(v) => set('reg_role', v)} options={['viewer', 'analyst', 'admin']} />
                  <button className={btnCls('bg-indigo-600 hover:bg-indigo-500 text-white w-full')}
                    onClick={() => req('POST', '/auth/register', { name: f('reg_name'), email: f('reg_email'), password: f('reg_password'), role: f('reg_role') })}>
                    POST /auth/register
                  </button>
                </Section>

                <Section title="Login">
                  <Field label="Email" value={f('login_email')} onChange={(v) => set('login_email', v)} />
                  <Field label="Password" value={f('login_password')} onChange={(v) => set('login_password', v)} type="password" />
                  <button className={btnCls('bg-green-700 hover:bg-green-600 text-white w-full')}
                    onClick={() => req('POST', '/auth/login', { email: f('login_email'), password: f('login_password') })}>
                    POST /auth/login
                  </button>
                </Section>

                <Section title="Logout">
                  <button className={btnCls('bg-red-800 hover:bg-red-700 text-white w-full')}
                    onClick={() => { req('POST', '/auth/logout'); setToken(''); }}>
                    POST /auth/logout
                  </button>
                </Section>

                {token && (
                  <Section title="Current Token">
                    <div className="text-xs text-indigo-300 break-all bg-indigo-950/30 p-2 rounded border border-indigo-900">
                      {token}
                    </div>
                    <button className="text-xs text-red-400 hover:text-red-300 mt-1" onClick={() => setToken('')}>
                      Clear token
                    </button>
                  </Section>
                )}
              </>
            )}

            {/* ─── RECORDS ───────────────────────────────────────── */}
            {activeTab === 'records' && (
              <>
                <Section title="List Records">
                  <button className={btnCls('bg-slate-700 hover:bg-slate-600 text-white w-full')}
                    onClick={() => req('GET', '/records')}>
                    GET /records
                  </button>
                  <button className={btnCls('bg-slate-700 hover:bg-slate-600 text-white w-full mt-1')}
                    onClick={() => req('GET', '/records?type=income&page=1&limit=5')}>
                    GET /records?type=income&page=1&limit=5
                  </button>
                  <button className={btnCls('bg-slate-700 hover:bg-slate-600 text-white w-full mt-1')}
                    onClick={() => req('GET', '/records?startDate=2024-01-01&endDate=2025-12-31')}>
                    GET /records (date range)
                  </button>
                </Section>

                <Section title="Create Record (Admin)">
                  <Field label="Amount" value={f('rec_amount')} onChange={(v) => set('rec_amount', v)} type="number" />
                  <SelectField label="Type" value={f('rec_type')} onChange={(v) => set('rec_type', v)} options={['income', 'expense']} />
                  <Field label="Category" value={f('rec_category')} onChange={(v) => set('rec_category', v)} />
                  <Field label="Date (ISO)" value={f('rec_date')} onChange={(v) => set('rec_date', v)} />
                  <Field label="Note" value={f('rec_note')} onChange={(v) => set('rec_note', v)} />
                  <button className={btnCls('bg-indigo-600 hover:bg-indigo-500 text-white w-full')}
                    onClick={() => req('POST', '/records', {
                      amount: Number(f('rec_amount')), type: f('rec_type'),
                      category: f('rec_category'), date: f('rec_date'), note: f('rec_note'),
                    })}>
                    POST /records
                  </button>
                </Section>

                <Section title="Get / Update / Delete Record">
                  <Field label="Record ID" value={f('rec_id')} onChange={(v) => set('rec_id', v)} placeholder="MongoDB ObjectId" />
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <button className={btnCls('bg-slate-700 hover:bg-slate-600 text-white text-xs')}
                      onClick={() => req('GET', `/records/${f('rec_id')}`)}>
                      GET
                    </button>
                    <button className={btnCls('bg-amber-700 hover:bg-amber-600 text-white text-xs')}
                      onClick={() => req('PATCH', `/records/${f('rec_id')}`, { amount: Number(f('rec_amount')), note: f('rec_note') })}>
                      PATCH
                    </button>
                    <button className={btnCls('bg-red-800 hover:bg-red-700 text-white text-xs')}
                      onClick={() => req('DELETE', `/records/${f('rec_id')}`)}>
                      DELETE
                    </button>
                  </div>
                </Section>
              </>
            )}

            {/* ─── DASHBOARD ─────────────────────────────────────── */}
            {activeTab === 'dashboard' && (
              <>
                <Section title="Summary">
                  <button className={btnCls('bg-slate-700 hover:bg-slate-600 text-white w-full')}
                    onClick={() => req('GET', '/dashboard/summary')}>
                    GET /dashboard/summary
                  </button>
                </Section>
                <Section title="Category Breakdown">
                  <button className={btnCls('bg-slate-700 hover:bg-slate-600 text-white w-full')}
                    onClick={() => req('GET', '/dashboard/category-breakdown')}>
                    GET /dashboard/category-breakdown
                  </button>
                </Section>
                <Section title="Monthly Trends">
                  <button className={btnCls('bg-slate-700 hover:bg-slate-600 text-white w-full')}
                    onClick={() => req('GET', '/dashboard/trends?months=12')}>
                    GET /dashboard/trends?months=12
                  </button>
                </Section>
                <Section title="Recent Transactions">
                  <button className={btnCls('bg-slate-700 hover:bg-slate-600 text-white w-full')}
                    onClick={() => req('GET', '/dashboard/recent')}>
                    GET /dashboard/recent
                  </button>
                </Section>
              </>
            )}

            {/* ─── USERS ─────────────────────────────────────────── */}
            {activeTab === 'users' && (
              <>
                <Section title="List Users (Admin)">
                  <button className={btnCls('bg-slate-700 hover:bg-slate-600 text-white w-full')}
                    onClick={() => req('GET', '/users')}>
                    GET /users
                  </button>
                  <button className={btnCls('bg-slate-700 hover:bg-slate-600 text-white w-full mt-1')}
                    onClick={() => req('GET', '/users?role=analyst&status=active')}>
                    GET /users?role=analyst&status=active
                  </button>
                </Section>

                <Section title="Manage User">
                  <Field label="User ID" value={f('user_id')} onChange={(v) => set('user_id', v)} placeholder="MongoDB ObjectId" />
                  <button className={btnCls('bg-slate-700 hover:bg-slate-600 text-white w-full mt-2')}
                    onClick={() => req('GET', `/users/${f('user_id')}`)}>
                    GET /users/:id
                  </button>
                </Section>

                <Section title="Update Role (Admin)">
                  <Field label="User ID" value={f('user_id')} onChange={(v) => set('user_id', v)} placeholder="MongoDB ObjectId" />
                  <SelectField label="New Role" value={f('user_role')} onChange={(v) => set('user_role', v)} options={['viewer', 'analyst', 'admin']} />
                  <button className={btnCls('bg-amber-700 hover:bg-amber-600 text-white w-full')}
                    onClick={() => req('PUT', `/users/${f('user_id')}`, { role: f('user_role') })}>
                    PUT /users/:id (role)
                  </button>
                </Section>

                <Section title="Update Status (Admin)">
                  <SelectField label="New Status" value={f('user_status')} onChange={(v) => set('user_status', v)} options={['active', 'inactive']} />
                  <button className={btnCls('bg-amber-700 hover:bg-amber-600 text-white w-full')}
                    onClick={() => req('PATCH', `/users/${f('user_id')}`, { status: f('user_status') })}>
                    PATCH /users/:id (status)
                  </button>
                </Section>

                <Section title="Delete User (Admin)">
                  <button className={btnCls('bg-red-800 hover:bg-red-700 text-white w-full')}
                    onClick={() => req('DELETE', `/users/${f('user_id')}`)}>
                    DELETE /users/:id
                  </button>
                </Section>
              </>
            )}
          </div>
        </div>

        {/* Right Panel — Response Log */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#2a2d3e] flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Response Log</span>
            <button onClick={() => setLogs([])} className="text-xs text-slate-600 hover:text-slate-400">
              Clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {logs.length === 0 && (
              <div className="text-center text-slate-600 text-sm mt-20">
                <div className="text-4xl mb-3">⬡</div>
                <p>No requests yet.</p>
                <p className="text-xs mt-1">Start by registering a user in the Auth tab.</p>
              </div>
            )}
            {logs.map((l) => (
              <div key={l.id} className="border border-[#2a2d3e] rounded-lg overflow-hidden">
                <div className={`flex items-center gap-3 px-3 py-2 text-xs ${l.status >= 200 && l.status < 300 ? 'bg-green-950/30' :
                  l.status >= 400 ? 'bg-red-950/30' : 'bg-slate-800'
                  }`}>
                  <MethodBadge method={l.method} />
                  <span className="text-slate-300 flex-1 font-mono">{l.url}</span>
                  <StatusBadge status={l.status} />
                  <span className="text-slate-600">{l.timestamp}</span>
                </div>
                <pre className="p-3 text-xs text-slate-300 overflow-auto max-h-64 bg-[#0a0c12]">
                  {JSON.stringify(l.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#2a2d3e] rounded-lg p-3 space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-slate-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0a0c12] border border-[#2a2d3e] rounded px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-600 placeholder-slate-700"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0a0c12] border border-[#2a2d3e] rounded px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-600"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function MethodBadge({ method }: { method: Method }) {
  const colors: Record<Method, string> = {
    GET: 'bg-blue-900 text-blue-300',
    POST: 'bg-green-900 text-green-300',
    PATCH: 'bg-amber-900 text-amber-300',
    PUT: 'bg-amber-900 text-amber-300',
    DELETE: 'bg-red-900 text-red-300',
  };
  return <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${colors[method]}`}>{method}</span>;
}

function StatusBadge({ status }: { status: number }) {
  const color = status >= 200 && status < 300 ? 'text-green-400' : status >= 400 ? 'text-red-400' : 'text-slate-400';
  return <span className={`font-bold ${color}`}>{status || 'ERR'}</span>;
}
