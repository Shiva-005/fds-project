'use client';

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--sans)',
            background: t.type === 'success' ? 'rgba(45,212,160,0.15)' : t.type === 'error' ? 'rgba(240,107,107,0.15)' : 'rgba(74,144,226,0.15)',
            border: `1px solid ${t.type === 'success' ? 'rgba(45,212,160,0.4)' : t.type === 'error' ? 'rgba(240,107,107,0.4)' : 'rgba(74,144,226,0.4)'}`,
            color: t.type === 'success' ? '#2DD4A0' : t.type === 'error' ? '#F06B6B' : '#4A90E2',
            minWidth: '240px', maxWidth: '360px',
            animation: 'slideUp 0.25s ease',
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
