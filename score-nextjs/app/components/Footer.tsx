'use client';
import { useEffect, useState } from 'react';

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

export default function Footer() {
  const dark = useBodyTheme();
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="ft">
          <div>
            <img
              src="/bond.credit%20logo_black.svg"
              alt="bond.credit"
              style={{ height: 18, display: 'block', filter: dark ? 'invert(1)' : 'none' }}
            />
            <div className="ft-tagline">The Credit Layer for the Agentic Economy</div>
            <div className="ft-copy">Watchtower · Agentic Credit Intelligence · 2025</div>
          </div>

        </div>
      </div>
    </footer>
  );
}
