'use client';

import { useState, useEffect, Component, type ReactNode } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { base, mainnet, arbitrum, polygon } from 'viem/chains';
import { WalletPrivySync } from './WalletPrivySync';

function getValidAppId(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (typeof raw !== 'string' || raw.trim().length === 0) return null;
  const trimmed = raw.trim();
  if (/^(missing|placeholder|undefined|your-?app-?id)$/i.test(trimmed)) return null;
  if (!/^[a-zA-Z0-9_-]{20,100}$/.test(trimmed)) return null;
  return trimmed;
}

type BoundaryProps = { children: ReactNode; fallback: ReactNode };

class PrivyErrorBoundary extends Component<BoundaryProps, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (
      error?.message?.includes('invalid Privy app ID') ||
      error?.message?.includes('Privy provider')
    ) {
      console.warn(
        '[Privy] App ID was rejected. Check NEXT_PUBLIC_PRIVY_APP_ID in .env.local and restart dev server. See https://dashboard.privy.io'
      );
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export function PrivyProviderWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const id = getValidAppId();
    setAppId(id);
    if (!id) {
      console.warn(
        'NEXT_PUBLIC_PRIVY_APP_ID is missing or invalid; Connect will be disabled. Get an App ID from https://dashboard.privy.io'
      );
    }
  }, [mounted]);

  if (!mounted || appId === null) {
    return <>{children}</>;
  }

  return (
    <PrivyErrorBoundary fallback={<>{children}</>}>
      <PrivyProvider
        appId={appId}
        config={{
          defaultChain: base,
          supportedChains: [mainnet, base, arbitrum, polygon],
        }}
      >
        <WalletPrivySync>{children}</WalletPrivySync>
      </PrivyProvider>
    </PrivyErrorBoundary>
  );
}
