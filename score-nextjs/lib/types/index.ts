export interface Agent {
  rank: number;
  agent: string;
  contractAddress: string;
  vaultType: string;
  roi: string;
  riskScore: number;
  validation: 'verified' | 'processing' | 'pending' | 'warning';
  performanceScore: number;
  bondScore: string;
  medal?: string;
  website?: string;
  aua?: number; // Asset Under Agent - balance (individual allocation)
  aum?: number; // Asset Under Management - total_aum
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
