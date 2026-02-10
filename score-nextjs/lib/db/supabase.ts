const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Use a server-side only key (no NEXT_PUBLIC_ prefix) to resolve security warnings
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                    process.env.SUPABASE_ANON_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

if (!supabaseKey) {
  console.error("CRITICAL: No Supabase key found in environment variables!");
} else {
  const keyName = process.env.SUPABASE_SERVICE_ROLE_KEY ? "SERVICE_ROLE" : 
                  process.env.SUPABASE_ANON_KEY ? "ANON_KEY" : "NEXT_PUBLIC_KEY";
  console.log(`Supabase Key loaded: ${keyName} (Length: ${supabaseKey.length})`);
  console.log(`Supabase URL: ${supabaseUrl}`);
}

// Direct fetch function for Supabase REST API
async function supabaseFetch(endpoint: string, schema: string = 'public') {
  const url = `${supabaseUrl}${endpoint}`;
  const headers: Record<string, string> = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
  };

  if (schema !== 'public') {
    headers['Accept-Profile'] = schema;
    headers['Content-Profile'] = schema;
  }

  const response = await fetch(url, {
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Supabase fetch failed: ${response.statusText}`);
  }

  return response.json();
}

export { supabaseFetch };

// Types based on new API schema
export interface AgentSeason1Row {
  agent_name: string;
  agent_smart_wallet_address: string;
  agent_eoa_wallet_address: string;
  yield_timestamp: string;
  usdc_native_balance: number;
  usdc_native_yield: number;
  agent_token_incentives: number;
  agent_token_incentives_usd: number;
  vault_incentives: any;
  vault_incentives_usd: number;
  total_yield_usd: number;
  apy_percent: number;
  updated_at: string;
  usdc_native_balance_usd: number;
  total_balance_usd: number;
  is_active: boolean;
  run_id: string;
}

export interface AgentAumRow {
  agent_name: string;
  smart_account_address: string;
  token_symbol: string;
  balance: number;
  total_aum: number;
  tx_time: string;
  run_ts: string;
}

export interface AgentAumHistoricalRow {
  run_ts: string;
  agent_name: string;
  balance: number;
  total_aum: number;
}
