'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useWallet } from '../../hooks/useWallet';
import { useWalletActions } from '../../components/providers/WalletPrivySync';

const Header: React.FC = () => {
  const pathname = usePathname();
  const { ready, authenticated, wallet, connect: login, disconnect: logout } = useWallet();
  const { login: privyLogin } = useWalletActions();
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [showAgentModal, setShowAgentModal]       = useState(false);
  const [mobileOpen, setMobileOpen]               = useState(false);
  const [showWalletDrop, setShowWalletDrop]        = useState(false);
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [userType, setUserType] = useState('');
  const [agentName, setAgentName] = useState('');
  const [website, setWebsite] = useState('');

  // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
  useEffect(() => { setShowWalletDrop(false); }, [pathname]);

  const truncate = (addr: string) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '';

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, userType }) });
      if (res.ok) { alert('Thanks for joining the waitlist!'); setShowWaitlistModal(false); setName(''); setEmail(''); setUserType(''); }
      else { const d = await res.json(); alert(d.error || 'Failed'); }
    } catch { alert('Failed to join waitlist. Please try again.'); }
  };

  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/agent-submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, agentName, website }) });
      if (res.ok) { alert('Thanks! We will review your agent for Season 2.'); setShowAgentModal(false); setName(''); setAgentName(''); setWebsite(''); }
      else { const d = await res.json(); alert(d.error || 'Failed'); }
    } catch { alert('Failed to submit. Please try again.'); }
  };

  const navLinks = [
    { href: '/',            label: 'LIVE',        live: true  },
    { href: '/leaderboard', label: 'LEADERBOARD', live: false },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: 'var(--card2)', border: '1px solid var(--border2)',
    borderRadius: '6px', color: 'var(--white)', fontSize: '0.875rem', outline: 'none',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '6px', fontSize: '0.6875rem', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--s2)',
  };

  return (
    <>
      {/* Nav */}
      <nav className="wt-nav">
        <div className="wt-container w-full flex items-center justify-between">
          {/* Brand */}
          <a href="/" className="flex flex-col gap-0.5">
            <img src="/bond.credit%20logo_black.svg" alt="bond.credit" className="h-4 w-auto invert" />
            <span style={{ fontSize: '0.5625rem', color: 'var(--s2)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Agentic Alpha
            </span>
          </a>

          {/* Center nav — desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(n => (
              <a
                key={n.href}
                href={n.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
                style={{
                  color: pathname === n.href ? 'var(--white)' : 'var(--s2)',
                  background: pathname === n.href ? 'var(--card2)' : 'transparent',
                  letterSpacing: '0.05em',
                }}
              >
                {n.label}
                {n.live && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', boxShadow: '0 0 6px var(--green)' }} />
                )}
              </a>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Auxiliary links */}
            <div className="hidden lg:flex items-center gap-4">
              {[
                { label: 'Waitlist', action: () => setShowWaitlistModal(true) },
                { label: 'Agents',   action: () => setShowAgentModal(true) },
              ].map(l => (
                <button key={l.label} onClick={l.action}
                  className="text-xs font-medium transition-colors"
                  style={{ color: 'var(--s2)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--white)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--s2)')}
                >
                  {l.label}
                </button>
              ))}
              <a href="https://x.com/bondoncredit?s=21" target="_blank" rel="noopener noreferrer"
                className="text-xs font-medium transition-colors"
                style={{ color: 'var(--s2)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--white)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--s2)')}
              >
                X ↗
              </a>
            </div>

            {/* Connect */}
            {ready && !authenticated ? (
              <button
                onClick={() => privyLogin?.()}
                disabled={!privyLogin}
                className="btn-lime text-xs"
                style={{ padding: '6px 14px', opacity: privyLogin ? 1 : 0.4, cursor: privyLogin ? 'pointer' : 'not-allowed' }}
                title={privyLogin ? undefined : 'Set NEXT_PUBLIC_PRIVY_APP_ID in .env.local to enable'}
              >
                CONNECT
              </button>
            ) : ready && authenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowWalletDrop(!showWalletDrop)}
                  className="flex items-center gap-2 text-xs font-semibold"
                  style={{ color: 'var(--lime)', padding: '6px 10px', background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: '6px' }}
                >
                  {truncate(wallet?.address || '')}
                  <span style={{ transform: showWalletDrop ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', display: 'inline-block' }}>▾</span>
                </button>
                {showWalletDrop && (
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: '8px', minWidth: '160px', zIndex: 200 }}>
                    <a href={`https://arbiscan.io/address/${wallet?.address}`} target="_blank" rel="noopener noreferrer"
                      onClick={() => setShowWalletDrop(false)}
                      className="block px-4 py-2.5 text-xs transition-colors"
                      style={{ color: 'var(--s1)', borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--white)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--s1)')}
                    >
                      View on Explorer
                    </a>
                    <button onClick={() => { setShowWalletDrop(false); logout(); }}
                      className="block w-full text-left px-4 py-2.5 text-xs transition-colors"
                      style={{ color: 'var(--red)' }}
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button disabled className="btn-lime text-xs opacity-50" style={{ padding: '6px 14px' }}>…</button>
            )}

            {/* Mobile hamburger */}
            <button className="lg:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen
                  ? <path d="M6 18L18 6M6 6l12 12" />
                  : <><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></>
                }
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '12px 24px 16px' }}>
          <div className="flex flex-col gap-2">
            {navLinks.map(n => (
              <a key={n.href} href={n.href}
                className="flex items-center gap-2 text-sm font-semibold py-1"
                style={{ color: pathname === n.href ? 'var(--white)' : 'var(--s2)' }}
                onClick={() => setMobileOpen(false)}
              >
                {n.label}
                {n.live && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />}
              </a>
            ))}
            <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
            <button onClick={() => { setShowWaitlistModal(true); setMobileOpen(false); }} className="text-left text-sm" style={{ color: 'var(--s2)' }}>Waitlist</button>
            <button onClick={() => { setShowAgentModal(true); setMobileOpen(false); }} className="text-left text-sm" style={{ color: 'var(--s2)' }}>Agents</button>
          </div>
        </div>
      )}

      {/* Waitlist Modal */}
      {showWaitlistModal && (
        <>
          <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowWaitlistModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: '12px', width: '100%', maxWidth: '440px', overflow: 'hidden' }}>
              <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="stag">Join Waitlist</span>
                <button onClick={() => setShowWaitlistModal(false)} style={{ color: 'var(--s2)' }}>✕</button>
              </div>
              <form onSubmit={handleWaitlistSubmit} className="p-6 space-y-4">
                <div>
                  <label style={labelStyle}>Name</label>
                  <input style={inputStyle} type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" />
                </div>
                <div>
                  <label style={labelStyle}>I am a</label>
                  <select style={{ ...inputStyle, appearance: 'none' }} value={userType} onChange={e => setUserType(e.target.value)} required>
                    <option value="" disabled>Select your role</option>
                    <option value="agent-builder">Agent Builder</option>
                    <option value="researcher">Researcher</option>
                    <option value="allocator">Allocator</option>
                  </select>
                </div>
                <button type="submit" className="btn-lime w-full" style={{ marginTop: '4px' }}>Join Waitlist</button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Agent Modal */}
      {showAgentModal && (
        <>
          <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowAgentModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: '12px', width: '100%', maxWidth: '440px', overflow: 'hidden' }}>
              <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="stag">Submit Agent — Season 2</span>
                <button onClick={() => setShowAgentModal(false)} style={{ color: 'var(--s2)' }}>✕</button>
              </div>
              <form onSubmit={handleAgentSubmit} className="p-6 space-y-4">
                <div>
                  <label style={labelStyle}>Your Name</label>
                  <input style={inputStyle} type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" />
                </div>
                <div>
                  <label style={labelStyle}>Agent Name</label>
                  <input style={inputStyle} type="text" value={agentName} onChange={e => setAgentName(e.target.value)} required placeholder="Agent name" />
                </div>
                <div>
                  <label style={labelStyle}>Website</label>
                  <input style={inputStyle} type="url" value={website} onChange={e => setWebsite(e.target.value)} required placeholder="https://your-agent.com" />
                </div>
                <button type="submit" className="btn-lime w-full" style={{ marginTop: '4px' }}>Submit Agent</button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
