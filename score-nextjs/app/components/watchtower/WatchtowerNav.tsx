'use client';
import { useEffect, useState } from 'react';

const NAV_H = 64; // main header height

const navLinks = [
  { label: 'Overview',    href: '#portfolio'   },
  { label: 'Bond Scores', href: '#scores'      },
  { label: 'ERC-8004',    href: '#erc8004'     },
  { label: 'Methodology', href: '#methodology' },
];

export default function WatchtowerNav() {
  const [active, setActive] = useState('');
  const [top, setTop] = useState(NAV_H);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('wt-theme') as 'dark' | 'light' | null;
    if (saved === 'light') setTheme('light');
  }, []);

  useEffect(() => {
    const onScroll = () => setTop(window.scrollY > 100 ? 0 : NAV_H);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = navLinks.map(l => l.href.slice(1));
    const observers: IntersectionObserver[] = [];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: '-10% 0px -70% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'light') {
      document.body.setAttribute('data-theme', 'light');
      document.documentElement.style.background = '#f4f4f5';
    } else {
      document.body.removeAttribute('data-theme');
      document.documentElement.style.background = '#050505';
    }
    localStorage.setItem('wt-theme', next);
  };

  return (
    <div className="wt-subnav" style={{ top }}>
      <div className="wt-subnav-inner">
        {/* Left brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <img
            src="/watchtower-logo.png"
            alt="Watchtower"
            style={{ height: 52, width: 'auto', display: 'block', filter: theme === 'dark' ? 'invert(1)' : 'none' }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--s2)', fontFamily: 'var(--mono)' }}>
            Watchtower
          </span>
        </div>

        <nav className="wt-subnav-links">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={`wt-subnav-link${active === link.href.slice(1) ? ' active' : ''}`}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
          <a href="https://dune.com/abdelhaks/agentic-alpha-season-0" className="wt-subnav-ext" target="_blank" rel="noopener noreferrer">
            Dune ↗
          </a>
          {top === 0 && (
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="theme-toggle-btn"
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
