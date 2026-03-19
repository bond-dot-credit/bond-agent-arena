'use client';

import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  title: string;
  body?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeOpacity="0.4"/>
      <path d="M4.5 8l2.5 2.5 4-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeOpacity="0.4"/>
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeOpacity="0.4"/>
      <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

const COLORS: Record<ToastType, { border: string; icon: string; accent: string }> = {
  success: { border: 'rgba(34,197,94,0.3)',  icon: '#22c55e', accent: 'rgba(34,197,94,0.08)'  },
  error:   { border: 'rgba(239,68,68,0.3)',  icon: '#ef4444', accent: 'rgba(239,68,68,0.08)'  },
  info:    { border: 'rgba(69,69,233,0.2)',  icon: 'var(--lime)', accent: 'rgba(69,69,233,0.05)' },
};

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: number) => void }) {
  const c = COLORS[toast.type];

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 4500);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 14px',
        background: c.accent,
        border: `1px solid ${c.border}`,
        borderLeft: `3px solid ${c.icon}`,
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        minWidth: '280px',
        maxWidth: '360px',
        animation: 'slideInRight 0.22s ease',
      }}
    >
      <span style={{ color: c.icon, flexShrink: 0, marginTop: '1px' }}>{ICONS[toast.type]}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--white)', lineHeight: 1.3 }}>
          {toast.title}
        </div>
        {toast.body && (
          <div style={{ fontSize: '0.75rem', color: 'var(--s1)', marginTop: '3px', lineHeight: 1.4 }}>
            {toast.body}
          </div>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{ color: 'var(--s2)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 4px', flexShrink: 0, fontSize: '14px', lineHeight: 1 }}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'flex-end',
    }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

let _nextId = 1;
export function useToast() {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback((type: ToastType, title: string, body?: string) => {
    const id = _nextId++;
    setToasts(prev => [...prev, { id, type, title, body }]);
  }, []);

  const dismiss = React.useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, toast, dismiss };
}
