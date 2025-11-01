import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
  const { data } = await supabase
    .from('performance_snapshots')
    .select('timestamp, total_value_usd')
    .eq('agent_id', 1)
    .order('timestamp', { ascending: false })
    .limit(3);

  console.log('Latest 3 snapshots for Giza:');
  data?.forEach((s) => {
    const date = new Date(s.timestamp);
    console.log(`ISO: ${s.timestamp}`);
    console.log(`Local: ${date.toLocaleString()}`);
    console.log(`Value: $${s.total_value_usd}`);
    console.log('---');
  });
  
  console.log('Current time:');
  console.log(`ISO: ${new Date().toISOString()}`);
  console.log(`Local: ${new Date().toLocaleString()}`);
}

check().then(() => process.exit(0));
