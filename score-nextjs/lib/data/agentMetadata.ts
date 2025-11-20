// Static metadata for agents
interface AgentMetadata {
  vaultType: string;
  riskScore: number;
  validation: 'verified' | 'processing' | 'pending' | 'warning';
  performanceScore: number;
  medal: string;
  website: string;
}

export const agentMetadata: Record<string, AgentMetadata> = {
  'Arma': {
    vaultType: 'Yield Optimizers',
    riskScore: 0.92,
    validation: 'verified',
    performanceScore: 88.4,
    medal: '/giza_logo.ico',
    website: 'https://arma.xyz/',
  },
  'Sail': {
    vaultType: 'Yield Optimizers',
    riskScore: 0.87,
    validation: 'processing',
    performanceScore: 83.1,
    medal: '/sale_money_logo.ico',
    website: 'http://sail.money/',
  },
  'ZyFAI': {
    vaultType: 'Yield Optimizers',
    riskScore: 0.94,
    validation: 'verified',
    performanceScore: 81.7,
    medal: '/Zyfai_icon.svg',
    website: 'https://www.zyf.ai/',
  },
  'SurfLiquid': {
    vaultType: 'Yield Optimizers',
    riskScore: 0.80,
    validation: 'pending',
    performanceScore: 74.9,
    medal: '/surf_logo.avif',
    website: 'https://surfliquid.com/',
  },
  'Mamo': {
    vaultType: 'Yield Optimizers',
    riskScore: 0.71,
    validation: 'warning',
    performanceScore: 69.3,
    medal: '/mamo_agent.ico',
    website: 'https://mamo.bot/',
  },
};
