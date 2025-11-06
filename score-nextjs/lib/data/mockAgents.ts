import { Agent } from '../types';

export const mockAgents: Agent[] = [
  {
    rank: 1,
    agent: 'Arma',
    contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    vaultType: 'Stablecoin yield',
    roi: '+9.8%',
    riskScore: 0.92,
    validation: 'verified',
    performanceScore: 88.4,
    bondScore: '+4.2',
    medal: '/giza_logo.ico',
    website: 'https://arma.xyz/'
  },
  {
    rank: 2,
    agent: 'Sail',
    contractAddress: '0x1234567890123456789012345678901234567890',
    vaultType: 'Stablecoin yield',
    roi: '+7.3%',
    riskScore: 0.87,
    validation: 'processing',
    performanceScore: 83.1,
    bondScore: '+2.1',
    medal: '/sale_money_logo.ico',
    website: 'http://sail.money/'
  },
  {
    rank: 3,
    agent: 'ZyFAI',
    contractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    vaultType: 'Stablecoin yield',
    roi: '+5.2%',
    riskScore: 0.94,
    validation: 'verified' as const,
    performanceScore: 81.7,
    bondScore: '-2.8',
    medal: '/Zyfai_icon.svg',
    website: 'https://www.zyf.ai/'
  },
  {
    rank: 4,
    agent: 'SurfLiquid',
    contractAddress: '0x9876543210987654321098765432109876543210',
    vaultType: 'Stablecoin yield',
    roi: '+3.9%',
    riskScore: 0.80,
    validation: 'pending',
    performanceScore: 74.9,
    bondScore: '+0.8',
    medal: '/surf_logo.avif',
    website: 'https://surfliquid.com/'
  },
  {
    rank: 5,
    agent: 'Mamo',
    contractAddress: '0x5555555555555555555555555555555555555555',
    vaultType: 'Stablecoin yield',
    roi: '+1.1%',
    riskScore: 0.71,
    validation: 'warning',
    performanceScore: 69.3,
    bondScore: '-2.4',
    medal: '/mamo_agent.ico',
    website: 'https://mamo.bot/'
  },
];
