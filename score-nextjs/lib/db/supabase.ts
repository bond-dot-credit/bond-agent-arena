import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types based on our schema
export interface AgentRow {
  id: number;
  name: string;
  contract_address: string;
  vault_type: string;
  risk_score: number;
  validation: 'verified' | 'processing' | 'pending' | 'warning';
  performance_score: number;
  medal_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PerformanceSnapshotRow {
  id: number;
  agent_id: number;
  usdc_amount: number;
  reward_token_amount: number | null;
  reward_token_symbol: string | null;
  reward_price_usd: number | null;
  total_value_usd: number;
  timestamp: string;
}
