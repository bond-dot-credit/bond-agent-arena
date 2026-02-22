'use client';

import { createContext, useContext, useEffect, useCallback, useRef } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAppStore } from '../../hooks/useStore';

type WalletActions = {
  login: (() => void) | null;
  logout: (() => void) | null;
};

const WalletActionsContext = createContext<WalletActions>({
  login: null,
  logout: null,
});

export function useWalletActions() {
  return useContext(WalletActionsContext);
}

export function WalletPrivySync({ children }: { children: React.ReactNode }) {
  const { setWallet, disconnectWallet, setUserInfo, chainId, addAlert } = useAppStore();
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const primaryWallet = wallets[0];
  const lastSwitchedChainId = useRef<number | null>(null);
  const isSwitching = useRef<boolean>(false);

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      disconnectWallet();
      setUserInfo(null);
      return;
    }
    const address = primaryWallet?.address;
    if (address) {
      setWallet({
        address,
        isConnected: true,
        chainId: chainId,
      });
    }
  }, [ready, authenticated, primaryWallet?.address, chainId, setWallet, disconnectWallet, setUserInfo]);

  const handleLogout = useCallback(() => {
    logout();
    disconnectWallet();
    setUserInfo(null);
  }, [logout, disconnectWallet, setUserInfo]);

  const value: WalletActions = {
    login,
    logout: handleLogout,
  };

  return (
    <WalletActionsContext.Provider value={value}>
      {children}
    </WalletActionsContext.Provider>
  );
}
