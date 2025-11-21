import { PerformanceSnapshot } from '../types';
import { mockAgents } from '../data/mockAgents';

// Local storage key for mock data
const STORAGE_KEY = 'agent_performance_data';

interface StoredData {
  [contractAddress: string]: PerformanceSnapshot[];
}

// Initialize mock data generation
export function initializeMockData() {
  if (typeof window === 'undefined') return;

  const existingData = localStorage.getItem(STORAGE_KEY);
  if (existingData) return; // Already initialized

  const mockData: StoredData = {};
  const baseValue = 2000;
  const now = Date.now();

  // Generate historical data for each agent (last 7 days, hourly snapshots)
  mockAgents.forEach(agent => {
    const snapshots: PerformanceSnapshot[] = [];
    const roiNum = parseFloat(agent.roi.replace('%', '').replace('+', ''));
    const targetValue = baseValue * (1 + roiNum / 100);

    // Generate 168 data points (7 days * 24 hours)
    for (let i = 0; i < 168; i++) {
      const timestamp = now - (168 - i) * 60 * 60 * 1000;
      const progress = i / 167;

      // Simulate realistic market movement
      const volatility = 0.015 + Math.random() * 0.01;
      const trendValue = baseValue + (targetValue - baseValue) * progress;
      const noise = (Math.random() - 0.5) * baseValue * volatility;
      const value = Math.max(trendValue + noise, baseValue * 0.8);

      snapshots.push({
        timestamp,
        balance: value,
        totalAum: value,
      });
    }

    mockData[agent.contractAddress] = snapshots;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
}

// Get performance data for an agent
export function getAgentPerformance(contractAddress: string): PerformanceSnapshot[] {
  if (typeof window === 'undefined') return [];

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];

  const parsedData: StoredData = JSON.parse(data);
  return parsedData[contractAddress] || [];
}

// Get all agents' latest performance
export function getAllAgentsLatestPerformance(): { [address: string]: PerformanceSnapshot } {
  if (typeof window === 'undefined') return {};

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return {};

  const parsedData: StoredData = JSON.parse(data);
  const latestData: { [address: string]: PerformanceSnapshot } = {};

  Object.keys(parsedData).forEach(address => {
    const snapshots = parsedData[address];
    if (snapshots.length > 0) {
      latestData[address] = snapshots[snapshots.length - 1];
    }
  });

  return latestData;
}

// Add new snapshot (simulates data collection)
export function addSnapshot(contractAddress: string, snapshot: PerformanceSnapshot) {
  if (typeof window === 'undefined') return;

  const data = localStorage.getItem(STORAGE_KEY);
  const parsedData: StoredData = data ? JSON.parse(data) : {};

  if (!parsedData[contractAddress]) {
    parsedData[contractAddress] = [];
  }

  parsedData[contractAddress].push(snapshot);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
}

// Simulate periodic data collection (call this from frontend)
export function simulateDataCollection() {
  const baseValue = 2000;
  const now = Date.now();

  mockAgents.forEach(agent => {
    const snapshots = getAgentPerformance(agent.contractAddress);
    if (snapshots.length === 0) return;

    const lastSnapshot = snapshots[snapshots.length - 1];
    const roiNum = parseFloat(agent.roi.replace('%', '').replace('+', ''));
    const targetValue = baseValue * (1 + roiNum / 100);

    // Add some volatility
    const volatility = 0.01;
    const change = (Math.random() - 0.5) * lastSnapshot.balance * volatility;
    const newValue = Math.max(
      lastSnapshot.balance + change,
      baseValue * 0.8
    );

    addSnapshot(agent.contractAddress, {
      timestamp: now,
      balance: newValue,
      totalAum: newValue,
    });
  });
}
