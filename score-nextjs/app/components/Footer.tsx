'use client';

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 0' }}>
      <div className="wt-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '40px' }}>
          {/* Left: brand */}
          <div>
            <img src="/bond.credit%20logo_black.svg" alt="bond.credit" style={{ height: '18px', display: 'block', filter: 'invert(1)' }} />
            <div style={{ fontSize: '12px', color: 'var(--s2)', marginTop: '6px' }}>
              The Credit Layer for the Agentic Economy
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--s2)', marginTop: '3px' }}>
              Watchtower · Agentic Alpha · <span style={{ color: 'var(--lime)' }}>Genesis</span>
            </div>
          </div>

          {/* Right: links */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {[
              { label: 'X ↗', href: 'https://x.com/bondoncredit' },
              { label: 'TELEGRAM ↗', href: 'https://t.me/+HYosKAFQmJU3OWQ0' },
              { label: 'EMAIL', href: 'mailto:team@bond.credit' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                style={{
                  fontSize: '11px',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                  color: 'var(--s2)',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                  fontWeight: 500,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--white)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--s2)')}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
