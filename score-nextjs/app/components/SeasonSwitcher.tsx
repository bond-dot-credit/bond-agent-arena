'use client';

import { useState } from 'react';
import CryptoGrid from './CryptoGrid';
import type { Agent } from '@/lib/types';

export default function SeasonSwitcher({ agents }: { agents: Agent[] }) {
  const [season, setSeason] = useState<'genesis' | 'resilient'>('genesis');

  return (
    <div>
      {/* Season tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: 4, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, width: 'fit-content' }}>
        {([
          { key: 'genesis'   as const, label: 'Genesis',   badge: undefined as string | undefined },
          { key: 'resilient' as const, label: 'Resilient', badge: 'COMING SOON' as string | undefined },
        ]).map(({ key, label, badge }) => (
          <button
            key={key}
            onClick={() => setSeason(key)}
            style={{
              padding: '7px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: season === key ? 'var(--card2)' : 'transparent',
              color: season === key ? 'var(--white)' : 'var(--s2)',
              fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em',
              textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.15s',
            }}
          >
            {label}
            {badge && (
              <span style={{
                fontSize: '0.5625rem', padding: '1px 6px', borderRadius: 3,
                background: 'rgba(69,69,233,0.1)', color: 'var(--s2)',
                border: '1px solid rgba(69,69,233,0.2)', letterSpacing: '0.08em',
                fontFamily: 'var(--mono)',
              }}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {season === 'genesis' ? (
        <CryptoGrid agents={agents} />
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: 400, gap: 16,
          background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8,
        }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--lime)', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
            Resilient · Season 2
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--white)', lineHeight: 1.1 }}>
            Coming Soon
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--s2)', maxWidth: 380, textAlign: 'center', lineHeight: 1.6 }}>
            The next cohort of autonomous yield agents is currently being evaluated. Results will be published when the season completes.
          </div>
        </div>
      )}
    </div>
  );
}
