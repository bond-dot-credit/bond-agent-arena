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
  website?: string; // Agent's website URL
  aua?: number; // Asset Under Agent - how much the agent manages for individual end user
  aum?: number; // Asset Under Management - how much the agent manages in total
  expectedYield?: string; // Expected yield percentage
}

export interface PerformanceSnapshot {
  timestamp: number;
  usdcAmount: number;
  rewardTokenAmount?: number;
  rewardTokenSymbol?: string;
  rewardPriceUsd?: number;
  totalValueUsd: number;
}

export interface AgentPerformance {
  agent: Agent;
  snapshots: PerformanceSnapshot[];
  currentValue: number;
  initialValue: number;
  totalReturn: number;
  roiPercentage: number;
}
