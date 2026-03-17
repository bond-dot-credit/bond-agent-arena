'use client';

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 0' }}>
      <div className="wt-container">
        <div>
          <img src="/bond.credit%20logo_black.svg" alt="bond.credit" style={{ height: '18px', display: 'block', filter: 'invert(1)' }} />
          <div style={{ fontSize: '12px', color: 'var(--s2)', marginTop: '6px' }}>
            The Credit Layer for the Agentic Economy
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--s2)', marginTop: '3px' }}>
            Watchtower · Agentic Alpha · <span style={{ color: 'var(--lime)' }}>Genesis</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
