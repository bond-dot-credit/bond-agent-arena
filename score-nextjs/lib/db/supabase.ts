const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Direct fetch function for Supabase REST API
async function supabaseFetch(endpoint: string) {
  const url = `${supabaseUrl}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Supabase fetch failed: ${response.statusText}`);
  }

  return response.json();
}

export { supabaseFetch };

// Types based on new API schema
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
