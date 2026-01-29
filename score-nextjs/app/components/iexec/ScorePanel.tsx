'use client';

import { useState, useEffect } from 'react';
import { useActiveAccount, useActiveWalletChain, ConnectButton } from 'thirdweb/react';
import { client, chain } from '@/lib/thirdweb';
import { Agent } from '@/lib/types';

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

export default function ScorePanel({ agent, onScoreCalculated }: ScorePanelProps) {
  // Web3 State
  const activeAccount = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const address = activeAccount?.address;
  const isConnected = !!address;
  
  const [dataProtectorCore, setDataProtectorCore] = useState<DataProtectorType | null>(null);
  const [networkStatus, setNetworkStatus] = useState<'checking' | 'arbitrum' | 'wrong' | 'unknown'>('unknown');
  
  // Task State
  const [isLoading, setIsLoading] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TaskResult | null>(null);
  
  // Config State
  const [showOverrides, setShowOverrides] = useState(false);
  const [iAppAddress] = useState<string>('0xc0462733d558708A554EeF7D33EA4c6F205578a2');
  
  // Overrides
  const [metricOverrides, setMetricOverrides] = useState({
    performance_roi_30d: '',
    performance_roi_90d: '',
    performance_sharpe_90d: '',
    risk_incident_score: ''
  });
  
  const [weightOverrides, setWeightOverrides] = useState({
    performance: 25,
    risk: 20,
    stability: 20,
    techprov: 15,
    sentiments: 20
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
          // This error code indicates that the chain has not been added to MetaMask.
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
              console.error("Add chain error:", addError);
              throw new Error("Failed to add Arbitrum One network");
            }
          } else {
            console.error("Switch chain error:", switchError);
            throw new Error(`Failed to switch network: ${switchError.message}`);
          }
        }
      } else {
        console.log("Already on Arbitrum One, skipping switch.");
      }

      // Lazy load libraries
      const { IExecDataProtectorCore } = await import('@iexec/dataprotector');
      const { IExec, utils } = await import('iexec');

      // Initialize DataProtector with the now-switched provider
      const dataProtector = new IExecDataProtectorCore(window.ethereum);

      // 2. Create Protected Data & Grant Access
      setTaskStatus('encrypting');
      
      let agentId = 'custom';
      if (agent.agent.toLowerCase().includes('giza')) agentId = 'arma-giza';
      else if (agent.agent.toLowerCase().includes('fungi')) agentId = 'fungi-agent';
      
      const gizaData = {
        agent_selection: agentId,
        use_sample_data: true,
        performance_roi_30d: metricOverrides.performance_roi_30d ? parseFloat(metricOverrides.performance_roi_30d) : -1.0,
        performance_roi_90d: metricOverrides.performance_roi_90d ? parseFloat(metricOverrides.performance_roi_90d) : -1.0,
        performance_sharpe_90d: metricOverrides.performance_sharpe_90d ? parseFloat(metricOverrides.performance_sharpe_90d) : -1.0,
        risk_incident_score: metricOverrides.risk_incident_score ? parseFloat(metricOverrides.risk_incident_score) : -1.0,
        weight_performance: weightOverrides.performance / 100,
        weight_risk: weightOverrides.risk / 100,
        weight_stability: weightOverrides.stability / 100,
        weight_techprov: weightOverrides.techprov / 100,
        weight_sentiments: weightOverrides.sentiments / 100
      };

      const protectedData = await dataProtector.protectData({
        data: gizaData,
        name: `Giza Score - ${agent.agent} - ${new Date().toISOString()}`
      });
      
      const protectedDataAddr = protectedData.address;
      
      setTaskStatus('granting-access');
      await dataProtector.grantAccess({
        protectedData: protectedDataAddr,
        authorizedApp: iAppAddress,
        authorizedUser: address!,
        numberOfAccess: 10,
        pricePerAccess: 0
      });
      
      
      setTaskStatus('initializing-sdk');
      const iexec = new IExec({ ethProvider: window.ethereum! });
      
      // 3a. App Order
      console.log('Fetching app info for:', iAppAddress);
      const { app } = await iexec.app.showApp(iAppAddress);
      console.log('App found:', app);

      const appOrderbook = await iexec.orderbook.fetchAppOrderbook(iAppAddress, { minVolume: 1, pageSize: 10 });
      console.log('App orders found:', appOrderbook.orders.length);
      
      let apporder;
      if (appOrderbook.orders.length > 0) {
        apporder = appOrderbook.orders[0].order;
        console.log('Using existing app order from marketplace');
      } else {
        // Fallback: If no order exists, try to create one (only works if user is owner)
        console.log('No app order found, attempting to create one...');
        try {
          const teeFramework = 'scone'; // We know this app uses scone
          const appOrderTemplate = await iexec.order.createApporder({
            app: iAppAddress,
            appprice: 0,
            volume: 1000000,
            tag: ['tee', teeFramework]
          });
          apporder = await iexec.order.signApporder(appOrderTemplate);
          console.log('Successfully created and signed on-the-fly app order');
        } catch (orderError: any) {
          console.error('Failed to create app order:', orderError);
          throw new Error("App not available - No sell orders found and could not create one. Did you publish the app order?");
        }
      }
      
      // 3b. Workerpool Order
      setTaskStatus('finding-workerpool');
      // Determine framework (scone default)
      let teeFramework = 'scone';
      if (app.appMREnclave) {
        try {
           const mr = JSON.parse(app.appMREnclave);
           teeFramework = mr.framework?.toLowerCase() || 'scone';
        } catch {}
      }
      
      const workerpoolOrderbook = await iexec.orderbook.fetchWorkerpoolOrderbook({
        category: 0, minVolume: 1, minTag: ['tee', teeFramework], maxWorkerpoolPrice: 0.5 // RLC
      });
      
      if (!workerpoolOrderbook.orders || workerpoolOrderbook.orders.length === 0) {
        throw new Error("No compatible workerpools found on this network");
      }

      let workerpoolorder;
      if (currentChainId === '0x86' || parseInt(currentChainId as string, 16) === 134) {
        // Bellecour specific filtering
        const activeWorkerpool = '0x0975bfce90f4748dab6d6729c96b33a2cd5491f5';
        const oldWorkerpool = '0x8b270a4f7cdb54e9da086ef919bf1f030071afa7';

        const filteredWorkerpools = workerpoolOrderbook.orders
          .filter(order => order.order.workerpool.toLowerCase() !== oldWorkerpool.toLowerCase())
          .sort((a, b) => {
            if (a.order.workerpool.toLowerCase() === activeWorkerpool.toLowerCase()) return -1;
            if (b.order.workerpool.toLowerCase() === activeWorkerpool.toLowerCase()) return 1;
            return parseFloat(a.order.workerpoolprice.toString()) - parseFloat(b.order.workerpoolprice.toString());
          });
        workerpoolorder = filteredWorkerpools[0]?.order;
      } else {
        // Arbitrum or other: Use specific workerpool if available, otherwise cheapest
        const preferredWorkerpool = '0x2c06263943180cc024daffeee15612db6e5fd248';
        const badWorkerpools = [
          '0xAaA90d37034fD1ea27D5eF2879f217fB6fD7F7Ca' // Known unresponsive pool
        ];
        
        const filteredOrders = workerpoolOrderbook.orders.filter(order => !badWorkerpools.includes(order.order.workerpool));
        const preferredOrder = filteredOrders.find(order => order.order.workerpool.toLowerCase() === preferredWorkerpool.toLowerCase());

        if (preferredOrder) {
          console.log('Using preferred workerpool:', preferredWorkerpool);
          workerpoolorder = preferredOrder.order;
        } else {
          const sortedWorkerpools = filteredOrders
            .sort((a, b) => parseFloat(a.order.workerpoolprice.toString()) - parseFloat(b.order.workerpoolprice.toString()));
          
          if (sortedWorkerpools.length === 0) {
             console.warn("All available workerpools were filtered out! Fallback to any...");
             workerpoolorder = workerpoolOrderbook.orders[0].order;
          } else {
             workerpoolorder = sortedWorkerpools[0].order;
          }
        }
      }

      if (!workerpoolorder) {
        throw new Error('No active workerpools available');
      }

      console.log('Selected workerpool:', workerpoolorder.workerpool, 'Price:', workerpoolorder.workerpoolprice);
      
      // 3c. Dataset Order
      setTaskStatus('signing-orders');
      const datasetorderTemplate = await iexec.order.createDatasetorder({
        dataset: protectedDataAddr, datasetprice: 0, volume: 1000000, tag: ['tee', teeFramework]
      });
      const datasetorder = await iexec.order.signDatasetorder(datasetorderTemplate);
      
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
        // Handle insufficient stake error
        if (matchError.message && matchError.message.includes("greater than requester account stake")) {
           console.log("Insufficient stake detected. Attempting deposit...");
           setTaskStatus('depositing-rlc');
           
           // Calculate needed amount (simplified: deposit price)
           // We can't easily get the exact gap without account.show, so we deposit the task price
           const taskPrice = workerpoolorder.workerpoolprice;
           
           try {
             await iexec.account.deposit(taskPrice);
             console.log('Deposit successful, retrying match...');
             
             // Retry match
             setTaskStatus('submitting-deal');
             const retryResult = await iexec.order.matchOrders({
               apporder, workerpoolorder, requestorder, datasetorder
             });
             dealid = retryResult.dealid;
             txHash = retryResult.txHash;
           } catch (depositError: any) {
             throw new Error(`Deposit/Match failed: ${depositError.message}`);
           }
        } else {
           throw matchError;
        }
      }
      
      console.log(`Deal created: ${dealid}`);
      console.log(`Transaction Hash: ${txHash}`);
      
      console.log(`Deal created: ${dealid}`);
      console.log(`Transaction Hash: ${txHash}`);
      console.log(`Explorer: https://explorer.iex.ec/arbitrum-mainnet/deal/${dealid}`);
      
      // Wait for deal to be indexed
      setTaskStatus('processing');
      let deal = null;
      let dealAttempts = 0;
      while (!deal && dealAttempts < 20) { // Increased retries
        try {
          deal = await iexec.deal.show(dealid);
        } catch (e) {
          console.log(`Deal not yet indexed, retrying (${dealAttempts + 1}/20)...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          dealAttempts++;
        }
      }
      
      if (!deal) {
         console.warn("Deal not found in graph, but proceeding with deterministic Task ID...");
         // Task ID is technically deterministically derivable, but deal.tasks[0] is the safe way.
         // If deal.show fails, we might be stuck. But usually matchOrders returns dealid.
      }
      
      // Task ID is typically dealid + index 0 (if single task)
      // Actually dealid is 32 bytes, taskid is 32 bytes.
      // If deal.show failed, we can't get task ID easily without calculating it.
      // Let's assume deal.show eventually works or we use the explorer link.
      
      if (deal) {
        const taskId = deal.tasks[0];
        console.log(`Task ID: ${taskId}`);
        console.log(`Explorer: https://explorer.iex.ec/arbitrum-mainnet/task/${taskId}`);
        setCurrentTaskId(taskId);
        monitorTask(taskId, iexec);
      } else {
        setError(`Deal created but not indexed. Check explorer: https://explorer.iex.ec/arbitrum-mainnet/deal/${dealid}`);
        setIsLoading(false);
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
        if (task.status === 3) { // COMPLETED
          setTaskStatus('downloading');
          // Fetch result via our API to parse the zip
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
        } else if (task.status === 4) { // FAILED
           setError("Computation failed on-chain");
           setIsLoading(false);
        } else {
          // Still active/revealing
          console.log(`Task status: ${task.statusName} (${task.status})`);
          setTimeout(check, 5000);
        }
      } catch (e: any) {
        // Handle "No task found" specifically (indexing delay)
        if (e.message && e.message.includes("No task found")) {
           console.log(`Task ${taskId} not yet indexed (attempt ${attempts})...`);
           if (attempts < 60) { // Retry for 5 minutes
             setTimeout(check, 5000);
           } else {
             setError("Task monitoring timed out. Please check Explorer.");
             setIsLoading(false);
           }
        } else {
           console.error("Monitoring error", e);
           setTimeout(check, 5000);
        }
      }
    };
    check();
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-4 shadow-inner">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#2727A5]">Verify Bond Score</h3>
          <p className="text-sm text-gray-500">Run a confidential TEE computation to verify this agent&apos;s score.</p>
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
             <a href={`https://explorer.iex.ec/bellecour/task/${result.task}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#2727A5] underline flex items-center gap-1">
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
               View on Explorer
             </a>
             <span>|</span>
             <a href={`https://ipfs.iex.ec/ipfs/${result.ipfsHash}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#2727A5] underline flex items-center gap-1">
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
               View Raw Result (IPFS)
             </a>
          </div>
          <button 
             onClick={() => setResult(null)} 
             className="mt-6 text-sm text-gray-500 hover:text-black underline"
          >
            Run verification again
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6">
             <button 
               onClick={() => setShowOverrides(!showOverrides)}
               className="text-xs font-semibold text-[#2727A5] hover:underline flex items-center gap-1"
             >
               {showOverrides ? 'Hide' : 'Show'} Simulation Parameters
               <svg className={`w-3 h-3 transform ${showOverrides ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
             </button>
             
             {showOverrides && (
               <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-gray-100">
                 <div>
                   <label className="block text-xs text-gray-500 mb-1">Performance Weight (%)</label>
                   <input 
                     type="range" min="0" max="50" 
                     value={weightOverrides.performance}
                     onChange={e => setWeightOverrides({...weightOverrides, performance: parseInt(e.target.value)})}
                     className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                   />
                   <div className="text-right text-xs font-mono">{weightOverrides.performance}%</div>
                 </div>
                 {/* Add more sliders if needed */}
               </div>
             )}
          </div>

          <button
            onClick={handleCalculateScore}
            disabled={!isConnected || isLoading || networkStatus === 'wrong'}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-md
              ${!isConnected || isLoading || networkStatus === 'wrong' 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#2727A5] to-[#4F46E5] hover:shadow-lg transform hover:-translate-y-0.5'}`}
          >
            {isLoading ? (
               <span className="flex items-center justify-center gap-2">
                 <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 {taskStatus === 'encrypting' && 'Encrypting Data...'}
                 {taskStatus === 'granting-access' && 'Granting TEE Access...'}
                 {taskStatus === 'signing-orders' && 'Signing Orders...'}
                 {taskStatus === 'processing' && 'Computing Score in TEE...'}
                 {taskStatus === 'downloading' && 'Verifying Proof...'}
                 {!taskStatus && 'Processing...'}
               </span>
            ) : networkStatus === 'wrong' ? (
              'Switch to Arbitrum One Network'
            ) : (
              'Verify Score On-Chain'
            )}
          </button>
          
          {isLoading && currentTaskId && (
            <div className="mt-4 text-center">
              <a 
                href={`https://explorer.iex.ec/bellecour/task/${currentTaskId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#2727A5] hover:underline flex items-center justify-center gap-1"
              >
                View Task on Explorer
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
          )}
          
          {networkStatus === 'wrong' && (
             <p className="text-center text-xs text-red-500 mt-2">
               Your wallet is connected to the wrong network.
             </p>
          )}
        </>
      )}
    </div>
  );
}