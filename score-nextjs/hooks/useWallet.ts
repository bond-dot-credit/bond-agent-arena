'use client';

import { useCallback } from 'react';
import { useAppStore } from './useStore';
import { useWalletActions } from '../components/providers/WalletPrivySync';

export function useWallet() {
  const { wallet, disconnectWallet, setUserInfo } = useAppStore();
  const { login, logout } = useWalletActions();

  const connect = useCallback(() => {
    if (login) login();
  }, [login]);

  const disconnect = useCallback(() => {
    if (logout) {
      logout();
    } else {
      disconnectWallet();
      setUserInfo(null);
    }
  }, [logout, disconnectWallet, setUserInfo]);

  const formatAddressDisplay = useCallback((address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  return {
    wallet,
    connect,
    disconnect,
    formatAddressDisplay,
    ready: true,
    authenticated: !!wallet?.address,
    error: null,
    clearError: () => {},
  };
}
