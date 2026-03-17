'use client';

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 mt-auto" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
      <div className="wt-container py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Branding */}
          <div className="flex flex-col gap-1">
            <img src="/bond.credit%20logo_black.svg" alt="bond.credit" className="h-4 w-auto invert" />
            <p className="text-xs" style={{ color: 'var(--s2)' }}>
              The credit layer for the agentic economy
            </p>
          </div>

          {/* Season Note */}
          <p className="text-xs text-center" style={{ color: 'var(--s2)' }}>
            <span style={{ color: 'var(--lime)', fontWeight: 600 }}>Genesis</span> concluded.
            {' '}Benchmarking resumes next season.
          </p>

          {/* Socials */}
          <div className="flex items-center gap-5">
            {[
              { label: 'X', href: 'https://x.com/bondoncredit' },
              { label: 'TELEGRAM', href: 'https://t.me/+HYosKAFQmJU3OWQ0' },
              { label: 'EMAIL', href: 'mailto:team@bond.credit' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="text-xs font-semibold transition-colors"
                style={{ color: 'var(--s2)', letterSpacing: '0.05em' }}
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
