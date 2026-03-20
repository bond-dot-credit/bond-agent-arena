'use client';
import { useEffect, useState } from 'react';

const navLinks = [
  { label: 'Overview',    href: '#portfolio'   },
  { label: 'Timeline',    href: '#timeline'    },
  { label: 'Bond Scores', href: '#scores'      },
  { label: 'ERC-8004',    href: '#erc8004'     },
  { label: 'Methodology', href: '#methodology' },
];

export default function WatchtowerNav() {
  const [active, setActive] = useState('');

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

  return (
    <div className="wt-subnav">
      <div className="wt-subnav-inner">
        <div className="wt-subnav-brand">
          <span className="wt-subnav-dot" />
          <span className="wt-subnav-label">WATCHTOWER</span>
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
        <a href="https://dune.com/abdelhaks/agentic-alpha-season-0" className="wt-subnav-ext" target="_blank" rel="noopener noreferrer">
          Dune ↗
        </a>
      </div>
    </div>
  );
}
