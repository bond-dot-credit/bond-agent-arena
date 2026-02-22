import { create } from 'zustand';
import { WalletState, UserInfo, Alert, ModalState } from '@/lib/types';

interface AppState {
  wallet: WalletState | null;
  userInfo: UserInfo | null;
  alerts: Alert[];
  chainId: number;
  modal: ModalState;
  
  setWallet: (wallet: WalletState | null) => void;
  disconnectWallet: () => void;
  setUserInfo: (userInfo: UserInfo | null) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void;
  dismissAlert: (id: string) => void;
  setAlerts: (alerts: Alert[]) => void;
  setChainId: (chainId: number) => void;
  openModal: (type: ModalState['type'], data?: any) => void;
  closeModal: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  wallet: {
    address: null,
    isConnected: false,
    chainId: null,
  },
  userInfo: null,
  alerts: [],
  chainId: 8453,
  modal: {
    isOpen: false,
    type: null,
    data: undefined,
  },
  
  setWallet: (wallet) => set((state) => ({
    wallet: wallet === null ? null : { ...state.wallet, ...wallet }
  })),
  
  disconnectWallet: () => set({
    wallet: { address: null, isConnected: false, chainId: null },
    userInfo: null,
  }),
  
  setUserInfo: (userInfo) => set({ userInfo }),
  
  addAlert: (alert) => set((state) => ({
    alerts: [...state.alerts, { ...alert, id: Date.now().toString(), timestamp: new Date().toISOString() }]
  })),
  
  dismissAlert: (id) => set((state) => ({
    alerts: state.alerts.filter(alert => alert.id !== id)
  })),
  
  setAlerts: (alerts) => set({ alerts }),
  
  setChainId: (chainId) => set({ chainId }),
  
  openModal: (type, data) => set({
    modal: { isOpen: true, type, data }
  }),
  
  closeModal: () => set({
    modal: { isOpen: false, type: null, data: undefined }
  }),
}));
