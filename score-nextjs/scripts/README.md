# Snapshot Update Script

This script updates the performance snapshots for all agents in the database by calculating yield based on APR.

## How It Works

### Phase 1: Manual APR Input

The script uses manually configured APR values for each agent to calculate yield:

1. **APR Configuration**: Each agent has an Annual Percentage Rate (APR) configured
2. **Daily Yield Calculation**: `daily_yield = (capital * APR) / 365`
3. **Half-Hourly Yield**: `half_hourly_yield = daily_yield / 48`
4. **3-Day Generation**: Creates 144 snapshots (48 per day × 3 days)

### Yield Calculation Formula

```
APR = 9.8% (example for Giza)
Capital = $2000 (starting)

Daily Yield = $2000 × (9.8 / 100 / 365) = $0.5370 per day
Half-Hourly Yield = $0.5370 / 48 = $0.0112 per half-hour
```

### Volatility

Each snapshot includes ±0.5% random volatility to simulate realistic market conditions.

## Current Agent APRs

| Agent      | APR   |
|------------|-------|
| Giza       | 9.8%  |
| Sail       | 7.3%  |
| Almanak    | 5.2%  |
| SurfLiquid | 3.9%  |
| Mamo       | 1.1%  |

## Usage

### Prerequisites

1. Install tsx if not already installed:
   ```bash
   npm install -g tsx
   ```

2. Ensure environment variables are set in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```

### Run the Script

```bash
npm run update-snapshots
```

### Manual Run

```bash
tsx scripts/update-snapshots.ts
```

## Output

The script will:
1. Fetch the latest snapshot for each agent
2. Calculate yields based on current capital
3. Generate 144 new snapshots (3 days worth)
4. Insert them into the `performance_snapshots` table

Example output:
```
=== Starting Snapshot Update ===
Updating snapshots for 5 agents
Period: Next 3 days (144 snapshots per agent)

Generating snapshots for Giza (APR: 9.8%)...
Starting capital: $2000.00
Daily yield: $0.5370
Half-hourly yield: $0.011187
Inserted batch 1 (100 snapshots)
Inserted batch 2 (44 snapshots)
✓ Completed snapshots for Giza. Final capital: $2001.61

...
```

## Scheduling

To run this script automatically every 3 days, set up a cron job:

```bash
# Edit crontab
crontab -e

# Add this line (runs at 00:00 every 3 days)
0 0 */3 * * cd /path/to/score-nextjs && npm run update-snapshots >> /var/log/snapshot-updates.log 2>&1
```

Or use a service like:
- GitHub Actions (scheduled workflow)
- Vercel Cron Jobs
- Railway Cron
- AWS EventBridge

## Future Enhancements

### Phase 2: Dynamic APR Source
- Fetch APR from on-chain data
- Real-time yield calculations
- Integration with vault contracts

### Phase 3: Real Blockchain Data
- Alchemy/Moralis RPC integration
- Actual USDC balance tracking
- Reward token price from CoinGecko
- Real-time event listening

## Database Schema

The script inserts data into the `performance_snapshots` table:

```sql
CREATE TABLE performance_snapshots (
  id BIGSERIAL PRIMARY KEY,
  agent_id BIGINT REFERENCES agentss(id),
  usdc_amount DECIMAL(20, 6),
  reward_token_amount DECIMAL(20, 6),
  reward_token_symbol VARCHAR(10),
  reward_price_usd DECIMAL(20, 6),
  total_value_usd DECIMAL(20, 6),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Troubleshooting

### Script Fails to Connect to Supabase
- Check `.env.local` has correct credentials
- Verify Supabase project is active
- Check network connectivity

### Snapshots Not Appearing
- Check agent IDs match database
- Verify timestamps are correct
- Check Supabase logs for errors

### Duplicate Data
- Script fetches latest snapshot to continue from current state
- Safe to run multiple times (will append new data)
