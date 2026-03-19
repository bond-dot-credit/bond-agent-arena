'use client';

import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'wt-beta-access';
const BETA_PASSWORD = 'genesis-7k4x';

export default function BetaGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [checked, setChecked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === '1') setUnlocked(true);
    setChecked(true);
  }, []);

  useEffect(() => {
    if (checked && !unlocked) inputRef.current?.focus();
  }, [checked, unlocked]);

  const attempt = () => {
    if (input.trim() === BETA_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, '1');
      setUnlocked(true);
    } else {
      setError(true);
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 500);
    }
  };

  if (!checked) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '24px',
    }}>
      <div style={{
        width: '100%', maxWidth: '380px',
        background: 'var(--card)', border: '1px solid var(--border2)',
        borderRadius: '12px', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '8px',
              background: 'rgba(201,179,130,0.1)', border: '1px solid rgba(201,179,130,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--gold)', textTransform: 'uppercase' }}>Beta Access</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--s2)', marginTop: '1px' }}>Watchtower · Private Preview</div>
            </div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--s1)', lineHeight: 1.5, margin: 0 }}>
            Enter your access code to view the Bond Score dashboard.
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: '24px 28px 28px' }}>
          <div style={{
            animation: shake ? 'gate-shake 0.4s ease' : 'none',
          }}>
            <input
              ref={inputRef}
              type="password"
              value={input}
              onChange={e => { setInput(e.target.value); setError(false); }}
              onKeyDown={e => e.key === 'Enter' && attempt()}
              placeholder="Access code"
              style={{
                width: '100%', padding: '10px 14px',
                background: 'var(--card2)',
                border: `1px solid ${error ? 'var(--red)' : 'var(--border2)'}`,
                borderRadius: '6px', color: 'var(--white)',
                fontSize: '0.875rem', outline: 'none',
                fontFamily: 'var(--mono)', letterSpacing: '0.05em',
                transition: 'border-color 0.15s',
                marginBottom: error ? '8px' : '16px',
              }}
            />
            {error && (
              <p style={{ fontSize: '0.75rem', color: 'var(--red)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Incorrect access code
              </p>
            )}
            <button
              onClick={attempt}
              style={{
                width: '100%', padding: '10px 14px',
                background: 'var(--white)', color: '#0a0a0a',
                border: 'none', borderRadius: '6px',
                fontSize: '0.8125rem', fontWeight: 700,
                letterSpacing: '0.05em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Unlock
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gate-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
