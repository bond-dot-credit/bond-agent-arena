export interface Agent {
  rank: number;
  agent: string;
  contractAddress: string;
  roi: string;
  riskScore: number;
  validation: 'verified' | 'processing' | 'pending' | 'warning';
  performanceScore: number;
  bondScore: string;
  medal?: string;
  website?: string;
  aua?: number; // Asset Under Agent - total_balance_usd
  aum?: number; // Asset Under Management - usdc_native_balance
  nativeYield?: number;
  rewards?: number;
  totalYieldUsd?: number;
  apyPercent?: number;
  expectedYield?: string;
}

export interface PerformanceSnapshot {
  timestamp: number;
  balance: number;
  totalAum: number;
}

export interface AgentPerformance {
  agent: Agent;
  snapshots: PerformanceSnapshot[];
  currentValue: number;
  initialValue: number;
  totalReturn: number;
  roiPercentage: number;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
}

export interface UserInfo {
  email?: string;
  [key: string]: any;
}

export interface Alert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

export interface ModalState {
  isOpen: boolean;
  type: 'connect' | 'transaction' | 'agent' | 'waitlist' | null;
  data?: any;
}
