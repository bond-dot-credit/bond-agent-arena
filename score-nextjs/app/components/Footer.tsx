'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

function useBodyTheme() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const check = () => setDark(document.body.getAttribute('data-theme') !== 'light');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

const IconX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.263 5.634 5.9-5.634Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const IconGitHub = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

export default function Footer() {
  const dark = useBodyTheme();
  const pathname = usePathname();
  const productName = pathname === '/watchtower' ? 'Watchtower' : 'Agentic Alpha';

  return (
    <footer className="site-footer">
      <div className="wrap">
        {/* Top row: logo left, tagline + copy */}
        <div className="ft">
          <div>
            <img
              src="/bond.credit%20logo_black.svg"
              alt="bond.credit"
              style={{ height: 18, display: 'block', filter: dark ? 'invert(1)' : 'none' }}
            />
            <div className="ft-tagline">The Credit Layer for the Agentic Economy</div>
            <div className="ft-copy">{productName} · Agentic Credit Intelligence · 2025</div>
          </div>
        </div>

        {/* Bottom row: social icons + legal */}
        <div style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          {/* Social icons */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <a
              href="https://x.com/bondoncredit"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              style={{ color: 'var(--s2)', transition: 'color 0.15s', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--white)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--s2)')}
            >
              <IconX />
            </a>
            <a
              href="https://github.com/bond-credit"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              style={{ color: 'var(--s2)', transition: 'color 0.15s', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--white)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--s2)')}
            >
              <IconGitHub />
            </a>
          </div>

          {/* Legal links */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            {['Privacy Policy', 'Terms of Service', 'Cookies'].map(label => (
              <a
                key={label}
                href="#"
                style={{
                  fontSize: 10,
                  color: 'var(--s2)',
                  fontFamily: 'var(--mono)',
                  letterSpacing: '0.05em',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--white)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--s2)')}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
