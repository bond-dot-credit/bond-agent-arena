# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create account
3. Click "New Project"
4. Fill in:
   - Project name: `bond-credit-agents`
   - Database password: (generate strong password)
   - Region: Choose closest to users
5. Wait for project to initialize (~2 minutes)

## 2. Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy contents from `lib/db/schema.sql` and paste
4. Click "Run" to create tables and insert mock agents
5. Verify: Go to **Table Editor**, you should see `agentss` table with 5 rows

## 3. Seed Performance Data

1. In SQL Editor, create new query
2. Copy contents from `lib/db/seed-snapshots.sql` and paste
3. Click "Run" to generate 168 hourly snapshots per agent
4. This will take ~10-30 seconds
5. Verify: Check `performance_snapshots` table, should have ~840 rows (5 agents × 168 snapshots)

## 4. Get API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - Project URL
   - `anon` `public` key

## 5. Configure Environment Variables

1. Create `.env.local` file in project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

2. Add to `.gitignore` (already there by default)

## 6. Test Connection

```bash
npm run dev
```

Then test API endpoints:

```bash
# Get all agents
curl http://localhost:3000/api/agents

# Get leaderboard
curl http://localhost:3000/api/leaderboard

# Get agent performance
curl "http://localhost:3000/api/agents/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/performance?interval=72h"
```

## Database Schema

### agentss table
- `id`: Primary key
- `name`: Agent name (e.g., "Giza")
- `contract_address`: Ethereum address (unique)
- `vault_type`: Type of vault
- `risk_score`: 0-1 decimal
- `validation`: 'verified' | 'processing' | 'pending' | 'warning'
- `performance_score`: Decimal score
- `medal_url`: Logo URL (nullable)
- `created_at`, `updated_at`: Timestamps

### performance_snapshots table
- `id`: Primary key
- `agent_id`: Foreign key to agentss
- `usdc_amount`: USDC balance
- `reward_token_amount`: Optional reward token amount
- `reward_token_symbol`: Optional token symbol
- `reward_price_usd`: Optional token price
- `total_value_usd`: Calculated total value
- `timestamp`: Snapshot time

## Next Steps

Once setup is complete, the app will:
- ✅ Fetch real agent data from Supabase
- ✅ Display historical performance with real timestamps
- ✅ Calculate ROI and bond scores dynamically
- ✅ Support leaderboard ranking

## Future Enhancements

1. Add RPC integration (Alchemy/Moralis) to fetch real USDC balances
2. Add CoinGecko integration for reward token prices
3. Set up scheduled jobs (Vercel Cron) to collect data every 15 minutes
4. Add admin API routes to manually trigger data collection
5. Add real-time subscriptions for live updates
