'use client';

import { useState, useEffect } from 'react';
import { useActiveAccount, useActiveWalletChain, ConnectButton } from 'thirdweb/react';
import { client, chain } from '@/lib/thirdweb';
import { Agent } from '@/lib/types';
import dynamic from 'next/dynamic';

// Types for iExec (lazy loaded below)
type IExecType = any;
type DataProtectorType = any;

interface TaskResult {
  deal: string;
  task: string;
  status?: string;
  txHash?: string;
  ipfsHash?: string;
  error?: string;
  score?: number;
  rawScore?: number;
  timestamp?: string;
}

interface ScorePanelProps {
  agent: Agent;
  onScoreCalculated?: (score: number) => void;
}

// Admin Configuration
const ADMIN_WALLET_ADDRESS = '0x44a3D4b120F7D4f403e99062934A788C61F1AEC6'; // Your Deployer Wallet

// Dataset Mapping for Public Users
const AGENT_DATASETS: Record<string, string> = {
  'arma-giza': '0xcc46b93c220efbe864fb4b2876b6fc1d870974ab', // ARMA Golden Dataset
  'fungi-agent': '0x79f8d0bbcb2e47ad6b6275302170d246f3c76448',  //change to fungi official dataset when available
  'zyfai': '0x2b1136bd80b90312d8464c8ea947534d571b3a5f',
  'surf-liquid': '0xca38ed4e2fa9ea78bd64a708938431b556a7b1a2', //change to surf official dataset when available
  'mamo': '0x2b1136bd80b90312d8464c8ea947534d571b3a5f',       //change to mamo official dataset when available
  'sail': '0x79f8d0bbcb2e47ad6b6275302170d246f3c76448'        //change to sail official dataset when available
};

const getAgentKey = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('arma') || n.includes('giza')) return 'arma-giza';
  if (n.includes('fungi')) return 'fungi-agent';
  if (n.includes('zyfai')) return 'zyfai';
  if (n.includes('surf')) return 'surf-liquid';
  if (n.includes('mamo')) return 'mamo';
  if (n.includes('sail')) return 'sail';
  return 'custom';
};

export default function ScorePanel({ agent, onScoreCalculated }: ScorePanelProps) {
  // Web3 State
  const activeAccount = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const address = activeAccount?.address;
  const isConnected = !!address;
  const isAdmin = address?.toLowerCase() === ADMIN_WALLET_ADDRESS.toLowerCase();
  
  const [networkStatus, setNetworkStatus] = useState<'checking' | 'arbitrum' | 'wrong' | 'unknown'>('unknown');
  
  // Task State
  const [isLoading, setIsLoading] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TaskResult | null>(null);
  
  // Config State
  const [showOverrides, setShowOverrides] = useState(false);
  const [iAppAddress] = useState<string>('0x50A9258eDc1606d5bc9a24316916f6040A38CFAD');
  
  // Overrides
  const [metricOverrides, setMetricOverrides] = useState<Record<string, string>>({
    // Performance
    performance_roi_30d: '',
    performance_roi_90d: '',
    performance_sharpe_90d: '',
    performance_vol_90d_ann: '',
    performance_trend_30d: '',
    performance_capital_efficiency_90d: '',
    performance_success_rate_90d: '',
    
    // Risk
    risk_incident_score: '',
    risk_audits_norm: '',
    risk_credshield_norm: '',
    risk_mdd_90d: '',
    risk_risk_adj_tvl: '',
    risk_vol_90d_ann: '',
    
    // Stability
    stability_asset_norm: '',
    stability_lindy_norm: '',
    stability_tvl_growth_90d: '',
    stability_liquidity_depth_ratio: '',
    
    // Sentiments
    sentiments_users_norm: '',
    sentiments_mau_norm: '',
    sentiments_community_sentiment_0_100: '',
    sentiments_market_fng_0_100: ''
  });
  
  const [weightOverrides, setWeightOverrides] = useState({
    performance: 25,
    risk: 25,
    stability: 15,
    techprov: 20,
    sentiments: 15
  });

  useEffect(() => {
    if (isConnected && activeChain) {
      setNetworkStatus('checking');
      
      const initializeNetwork = async () => {
        try {
          if (activeChain.id === 42161) {
            setNetworkStatus('arbitrum');
          } else {
            setNetworkStatus('wrong');
          }
        } catch (error) {
          console.error('Network initialization failed:', error);
          setNetworkStatus('wrong');
        }
      };
      
      initializeNetwork();
    } else {
      setNetworkStatus('unknown');
    }
  }, [isConnected, activeChain]);

  const handleCalculateScore = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      
      // 1. Check Network & Force Switch
      if (!window.ethereum) throw new Error("Ethereum provider not found");

      // Request accounts first to ensure permissions
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Check current chain ID first
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log("Current Chain ID:", currentChainId);

      if (currentChainId !== '0xa4b1' && parseInt(currentChainId as string, 16) !== 42161) {
        console.log("Switching to Arbitrum One...");
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xa4b1' }], // 42161 in hex
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0xa4b1',
                    chainName: 'Arbitrum One',
                    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
                    nativeCurrency: {
                      name: 'Ether',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    blockExplorerUrls: ['https://arbiscan.io'],
                  },
                ],
              });
            } catch (addError) {
              throw new Error("Failed to add Arbitrum One network");
            }
          } else {
            throw new Error(`Failed to switch network: ${switchError.message}`);
          }
        }
      }

      // Lazy load libraries
      const { IExecDataProtectorCore } = await import('@iexec/dataprotector');
      const { IExec, utils } = await import('iexec');

      const iexec = new IExec({ ethProvider: window.ethereum! });
      let protectedDataAddr = '';

      // Determine Agent ID
      const agentKey = getAgentKey(agent.agent);

      // 2. Data Management (Admin vs User)
      if (isAdmin) {
          // Admin Flow: Create New Data
          setTaskStatus('encrypting');
          const dataProtector = new IExecDataProtectorCore(window.ethereum);
          
          const agentData = {
            agent_selection: agentKey,
            use_sample_data: true,
            
            // Performance
            performance_roi_30d: (metricOverrides.performance_roi_30d ? parseFloat(metricOverrides.performance_roi_30d) : -1.0).toString(),
            performance_roi_90d: (metricOverrides.performance_roi_90d ? parseFloat(metricOverrides.performance_roi_90d) : -1.0).toString(),
            performance_sharpe_90d: (metricOverrides.performance_sharpe_90d ? parseFloat(metricOverrides.performance_sharpe_90d) : -1.0).toString(),
            performance_vol_90d_ann: (metricOverrides.performance_vol_90d_ann ? parseFloat(metricOverrides.performance_vol_90d_ann) : -1.0).toString(),
            performance_trend_30d: (metricOverrides.performance_trend_30d ? parseFloat(metricOverrides.performance_trend_30d) : -1.0).toString(),
            performance_capital_efficiency_90d: (metricOverrides.performance_capital_efficiency_90d ? parseFloat(metricOverrides.performance_capital_efficiency_90d) : -1.0).toString(),
            performance_success_rate_90d: (metricOverrides.performance_success_rate_90d ? parseFloat(metricOverrides.performance_success_rate_90d) : -1.0).toString(),

            // Risk
            risk_incident_score: (metricOverrides.risk_incident_score ? parseFloat(metricOverrides.risk_incident_score) : -1.0).toString(),
            risk_audits_norm: (metricOverrides.risk_audits_norm ? parseFloat(metricOverrides.risk_audits_norm) : -1.0).toString(),
            risk_credshield_norm: (metricOverrides.risk_credshield_norm ? parseFloat(metricOverrides.risk_credshield_norm) : -1.0).toString(),
            risk_mdd_90d: (metricOverrides.risk_mdd_90d ? parseFloat(metricOverrides.risk_mdd_90d) : -1.0).toString(),
            risk_risk_adj_tvl: (metricOverrides.risk_risk_adj_tvl ? parseFloat(metricOverrides.risk_risk_adj_tvl) : -1.0).toString(),
            risk_vol_90d_ann: (metricOverrides.risk_vol_90d_ann ? parseFloat(metricOverrides.risk_vol_90d_ann) : -1.0).toString(),

            // Stability
            stability_asset_norm: (metricOverrides.stability_asset_norm ? parseFloat(metricOverrides.stability_asset_norm) : -1.0).toString(),
            stability_lindy_norm: (metricOverrides.stability_lindy_norm ? parseFloat(metricOverrides.stability_lindy_norm) : -1.0).toString(),
            stability_tvl_growth_90d: (metricOverrides.stability_tvl_growth_90d ? parseFloat(metricOverrides.stability_tvl_growth_90d) : -1.0).toString(),
            stability_liquidity_depth_ratio: (metricOverrides.stability_liquidity_depth_ratio ? parseFloat(metricOverrides.stability_liquidity_depth_ratio) : -1.0).toString(),

            // Sentiments
            sentiments_users_norm: (metricOverrides.sentiments_users_norm ? parseFloat(metricOverrides.sentiments_users_norm) : -1.0).toString(),
            sentiments_mau_norm: (metricOverrides.sentiments_mau_norm ? parseFloat(metricOverrides.sentiments_mau_norm) : -1.0).toString(),
            sentiments_community_sentiment_0_100: (metricOverrides.sentiments_community_sentiment_0_100 ? parseFloat(metricOverrides.sentiments_community_sentiment_0_100) : -1.0).toString(),
            sentiments_market_fng_0_100: (metricOverrides.sentiments_market_fng_0_100 ? parseFloat(metricOverrides.sentiments_market_fng_0_100) : -1.0).toString(),

            // Weights
            weight_performance: (weightOverrides.performance / 100).toString(),
            weight_risk: (weightOverrides.risk / 100).toString(),
            weight_stability: (weightOverrides.stability / 100).toString(),
            weight_techprov: (weightOverrides.techprov / 100).toString(),
            weight_sentiments: (weightOverrides.sentiments / 100).toString()
          };

          const protectedData = await dataProtector.protectData({
            data: agentData,
            name: `Agent Score - ${agent.agent} - ${new Date().toISOString()}`
          });
          
          protectedDataAddr = protectedData.address;
          console.log("Created NEW Protected Data:", protectedDataAddr);
          console.log(`IMPORTANT: Update AGENT_DATASETS['${agentKey}'] in ScorePanel.tsx with this address!`);
          alert(`New Dataset Created: ${protectedDataAddr}\nPlease update AGENT_DATASETS['${agentKey}'] in ScorePanel.tsx`);
          
          setTaskStatus('granting-access');
          await dataProtector.grantAccess({
            protectedData: protectedDataAddr,
            authorizedApp: iAppAddress,
            authorizedUser: address!, // Grant to self
            numberOfAccess: 100,
            pricePerAccess: 0
          });
      } else {
          // User Flow: Use Official Dataset
          const targetDataset = AGENT_DATASETS[agentKey];

          if (!targetDataset) {
              throw new Error(`No Official Dataset configured for ${agent.agent}. Admin needs to publish one.`);
          }
          console.log(`Using Official Dataset for ${agent.agent}:`, targetDataset);
          protectedDataAddr = targetDataset;
      }
      
      setTaskStatus('initializing-sdk');
      
      // 3a. App Order
      const { app } = await iexec.app.showApp(iAppAddress);
      const appOrderbook = await iexec.orderbook.fetchAppOrderbook(iAppAddress, { minVolume: 1, pageSize: 10 });
      
      let apporder;
      if (appOrderbook.orders.length > 0) {
        apporder = appOrderbook.orders[0].order;
      } else {
        try {
          const appOrderTemplate = await iexec.order.createApporder({
            app: iAppAddress, appprice: 0, volume: 1000000, tag: ['tee', 'scone']
          });
          apporder = await iexec.order.signApporder(appOrderTemplate);
        } catch (orderError: any) {
          throw new Error("App not available - No sell orders found and could not create one.");
        }
      }
      
      // 3b. Workerpool Order
      setTaskStatus('finding-workerpool');
      let teeFramework = 'scone';
      if (app.appMREnclave) {
        try {
           const mr = JSON.parse(app.appMREnclave);
           teeFramework = mr.framework?.toLowerCase() || 'scone';
        } catch {}
      }
      
      const workerpoolOrderbook = await iexec.orderbook.fetchWorkerpoolOrderbook({
        category: 0, minVolume: 1, minTag: ['tee', teeFramework], maxWorkerpoolPrice: 0.5
      });
      
      let workerpoolorder;
      const preferredWorkerpool = '0x2c06263943180cc024daffeee15612db6e5fd248';
      const badWorkerpools = ['0xAaA90d37034fD1ea27D5eF2879f217fB6fD7F7Ca'];
      
      const filteredOrders = workerpoolOrderbook.orders.filter((order: any) => !badWorkerpools.includes(order.order.workerpool));
      const preferredOrder = filteredOrders.find((order: any) => order.order.workerpool.toLowerCase() === preferredWorkerpool.toLowerCase());

      if (preferredOrder) {
        workerpoolorder = preferredOrder.order;
      } else {
        workerpoolorder = filteredOrders.sort((a: any, b: any) => parseFloat(a.order.workerpoolprice.toString()) - parseFloat(b.order.workerpoolprice.toString()))[0]?.order;
      }

      if (!workerpoolorder) throw new Error('No active workerpools available');

      // 3c. Dataset Order
      setTaskStatus('signing-orders');
      let datasetorder;
      if (isAdmin) {
          // Admin creates a fresh dataset order for the new data
          const datasetorderTemplate = await iexec.order.createDatasetorder({
            dataset: protectedDataAddr, datasetprice: 0, volume: 1000000, tag: ['tee', teeFramework]
          });
          datasetorder = await iexec.order.signDatasetorder(datasetorderTemplate);
      } else {
          // User fetches existing dataset order
          const datasetOrderbook = await iexec.orderbook.fetchDatasetOrderbook(protectedDataAddr, { app: iAppAddress, minVolume: 1 });
          if (datasetOrderbook.orders.length > 0) {
              datasetorder = datasetOrderbook.orders[0].order;
          } else {
              throw new Error("No dataset order found. Admin needs to publish one.");
          }
      }
      
      // 3d. Request Order
      const requestorderTemplate = await iexec.order.createRequestorder({
        app: iAppAddress, appmaxprice: 0, workerpoolmaxprice: workerpoolorder.workerpoolprice,
        category: workerpoolorder.category, volume: 1, dataset: protectedDataAddr, datasetmaxprice: 0
      });
      const requestorder = await iexec.order.signRequestorder(requestorderTemplate);
      
      // 3e. Match
      setTaskStatus('submitting-deal');
      let dealid, txHash;
      
      try {
        const matchResult = await iexec.order.matchOrders({
          apporder, workerpoolorder, requestorder, datasetorder
        });
        dealid = matchResult.dealid;
        txHash = matchResult.txHash;
      } catch (matchError: any) {
        if (matchError.message && matchError.message.includes("greater than requester account stake")) {
           setTaskStatus('depositing-rlc');
           await iexec.account.deposit(workerpoolorder.workerpoolprice);
           setTaskStatus('submitting-deal');
           const retryResult = await iexec.order.matchOrders({
             apporder, workerpoolorder, requestorder, datasetorder
           });
           dealid = retryResult.dealid;
           txHash = retryResult.txHash;
        } else {
           throw matchError;
        }
      }
      
      console.log(`Deal created: ${dealid}`);
      console.log(`Transaction Hash: ${txHash}`);
      console.log(`Explorer: https://explorer.iex.ec/arbitrum-mainnet/deal/${dealid}`);
      
      setTaskStatus('processing');
      
      let deal = null;
      let dealAttempts = 0;
      while (!deal && dealAttempts < 20) {
        try {
          deal = await iexec.deal.show(dealid);
        } catch (e) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          dealAttempts++;
        }
      }
      
      if (deal) {
        const taskId = deal.tasks[0];
        setCurrentTaskId(taskId);
        monitorTask(taskId, iexec);
      } else {
        throw new Error("Deal created but not indexed after 60s.");
      }
      
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to calculate score");
      setIsLoading(false);
      setTaskStatus('');
    }
  };

  const monitorTask = async (taskId: string, iexec: IExecType) => {
    let attempts = 0;
    const check = async () => {
      attempts++;
      try {
        const task = await iexec.task.show(taskId);
        if (task.status === 3) {
          setTaskStatus('downloading');
          const response = await fetch('/api/parse-tee-result', {
            method: 'POST',
            body: JSON.stringify({ taskId })
          });
          const data = await response.json();
          
          if (data.success) {
            setResult({
              deal: task.dealid,
              task: taskId,
              status: 'COMPLETED',
              ipfsHash: data.ipfsHash,
              score: data.score,
              rawScore: data.rawScore
            });
            if (onScoreCalculated && data.score) onScoreCalculated(data.score);
          } else {
            setError(data.error || "Failed to parse result");
          }
          setIsLoading(false);
          setTaskStatus('completed');
        } else if (task.status === 4) {
           setError("Computation failed on-chain");
           setIsLoading(false);
        } else {
          setTimeout(check, 5000);
        }
      } catch (e: any) {
        if (e.message && e.message.includes("No task found")) {
           if (attempts < 60) setTimeout(check, 5000);
           else {
             setError("Task monitoring timed out.");
             setIsLoading(false);
           }
        } else {
           setTimeout(check, 5000);
        }
      }
    };
    check();
  };

  const currentAgentKey = getAgentKey(agent.agent);
  const currentOfficialDataset = AGENT_DATASETS[currentAgentKey];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-4 shadow-inner text-black text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#2727A5]">Verify Bond Score</h3>
          <p className="text-sm text-gray-500">Run a confidential TEE computation to verify this agent&apos;s score.</p>
          
          {/* Dataset Explorer Link */}
          {currentOfficialDataset && (
            <a 
              href={`https://explorer.iex.ec/arbitrum-mainnet/dataset/${currentOfficialDataset}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-[#2727A5] hover:underline mt-1 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-100"
            >
              Dataset: {currentOfficialDataset.substring(0, 10)}...{currentOfficialDataset.substring(38)}
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          )}
        </div>
        
        {!isConnected ? (
           <ConnectButton client={client} chain={chain} />
        ) : (
           <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200 mt-2 md:mt-0">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             Wallet Connected
           </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">
          ⚠️ {error}
        </div>
      )}

      {result ? (
        <div className="bg-white border border-[#2727A5]/20 rounded-lg p-6 text-center shadow-sm">
          <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Final Verified Score</p>
          <div className="text-5xl font-bold text-[#2727A5] mb-2">{result.score}<span className="text-2xl text-gray-400">/100</span></div>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400 mt-4">
             <a href={`https://explorer.iex.ec/arbitrum-mainnet/task/${result.task}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#2727A5] underline flex items-center gap-1">
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
               View on Explorer
             </a>
             <span>|</span>
             <a href={`https://ipfs.gateway.iex.ec/ipfs/${result.ipfsHash}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#2727A5] underline flex items-center gap-1">
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
               View Raw Result (IPFS)
             </a>
          </div>
          <button onClick={() => setResult(null)} className="mt-6 text-sm text-gray-500 hover:text-black underline">Run verification again</button>
        </div>
      ) : (
        <>
          <div className="mb-6">
             {/* Only show parameters toggle for Admin */}
             {isAdmin ? (
               <button 
                 onClick={() => setShowOverrides(!showOverrides)}
                 className="text-xs font-semibold text-[#2727A5] hover:underline flex items-center gap-1"
               >
                 {showOverrides ? 'Hide' : 'Show'} Simulation Parameters (Admin Only)
                 <svg className={`w-4 h-4 transform ${showOverrides ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
               </button>
             ) : (
               <p className="text-xs text-gray-500 italic">Using official parameters set by Bond Credit Protocol</p>
             )}
             
             {showOverrides && isAdmin && (
               <div className="mt-4 space-y-6 bg-white p-4 rounded-lg border border-gray-100 max-h-[60vh] overflow-y-auto">
                 {/* ... (Existing input grids) ... */}
                 <div>
                   <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Category Weights</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {Object.entries(weightOverrides).map(([key, val]) => (
                       <div key={key}>
                         <div className="flex justify-between mb-1">
                           <label className="text-xs text-gray-500 capitalize">{key}</label>
                           <span className="text-xs font-mono">{val}%</span>
                         </div>
                         <input type="range" min="0" max="100" value={val} onChange={e => setWeightOverrides({...weightOverrides, [key]: parseInt(e.target.value)})} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2727A5]" />
                       </div>
                     ))}
                   </div>
                 </div>

                 <div>
                   <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 border-t pt-4">Performance Metrics</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {['performance_roi_30d', 'performance_roi_90d', 'performance_sharpe_90d', 'performance_vol_90d_ann', 'performance_trend_30d', 'performance_success_rate_90d'].map(k => (
                       <div key={k}>
                         <label className="block text-xs text-gray-500 mb-1 capitalize">{k.replace('performance_', '').replace(/_/g, ' ')}</label>
                         <input type="number" step="0.001" value={metricOverrides[k]} onChange={e => setMetricOverrides({...metricOverrides, [k]: e.target.value})} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm" placeholder="Default" />
                       </div>
                     ))}
                   </div>
                 </div>

                 <div>
                   <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 border-t pt-4">Risk Metrics</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {['risk_incident_score', 'risk_audits_norm', 'risk_credshield_norm', 'risk_mdd_90d', 'risk_vol_90d_ann'].map(k => (
                       <div key={k}>
                         <label className="block text-xs text-gray-500 mb-1 capitalize">{k.replace('risk_', '').replace(/_/g, ' ')}</label>
                         <input type="number" step="0.01" value={metricOverrides[k]} onChange={e => setMetricOverrides({...metricOverrides, [k]: e.target.value})} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm" placeholder="Default" />
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             )}
          </div>

          <button
            onClick={handleCalculateScore}
            disabled={!isConnected || isLoading || networkStatus === 'wrong' || (!isAdmin && !currentOfficialDataset)}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-md ${!isConnected || isLoading || networkStatus === 'wrong' || (!isAdmin && !currentOfficialDataset) ? 'bg-gray-300' : 'bg-[#2727A5] hover:bg-[#3d3db8]'}`}
          >
            {isLoading ? `Processing (${taskStatus})...` : networkStatus === 'wrong' ? 'Switch to Arbitrum One' : (!isAdmin && !currentOfficialDataset) ? 'Waiting for Admin Setup' : 'Verify Score On-Chain'}
          </button>
          
          {currentTaskId && (
            <div className="mt-4 text-center">
              <a href={`https://explorer.iex.ec/arbitrum-mainnet/task/${currentTaskId}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2727A5] hover:underline flex items-center justify-center gap-1">
                View Task on Explorer
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
          )}

          {/* Information Section */}
          <div className="mt-6 p-4 bg-white border border-gray-100 rounded-lg text-xs leading-relaxed text-gray-600 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-[#2727A5] mb-2 uppercase tracking-tight">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Why verify with existing data?
            </div>
            You are verifying the score using official metrics collected in-house by <strong>bond.credit</strong>. The algorithm runs entirely within an <strong>iExec TEE (Trusted Execution Environment)</strong>, which ensures that the calculation is performed exactly as defined, without any possibility of data manipulation or external interference.
          </div>

          {/* Footer Branding */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            TEE Computation powered by iExec on Arbitrum Mainnet
          </div>
        </>
      )}
    </div>
  );
}
