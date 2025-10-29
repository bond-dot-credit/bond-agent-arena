# Backend Architecture Plan

## Tech Stack Recommendation

**Recommendation: Next.js (App Router)**

### Why Next.js over React-only?

1. **API Routes Built-in**: Next.js provides `/api` routes eliminating need for separate Express server
2. **Server Components**: Can fetch data server-side, reducing client bundle
3. **Cron Jobs**: Can use Vercel Cron or similar for scheduled data fetching
4. **Single Deployment**: Frontend + Backend in one deployment
5. **TypeScript Native**: Full-stack type safety
6. **Easy Migration**: Can keep existing React components as-is

### Alternative: Keep React + Separate Node.js Backend
- **Pros**: Clear separation, can scale backend independently
- **Cons**: Two deployments, more infrastructure, CORS setup needed

---

## Database Schema

```sql
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contract_address VARCHAR(42) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE performance_snapshots (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id),
  usdc_amount DECIMAL(20, 6) NOT NULL,
  reward_token_amount DECIMAL(20, 6),
  reward_token_symbol VARCHAR(10),
  reward_price_usd DECIMAL(20, 6),
  total_value_usd DECIMAL(20, 6) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),

  INDEX idx_agent_timestamp (agent_id, timestamp),
  INDEX idx_timestamp (timestamp)
);
```

### Field Descriptions
- `usdc_amount`: USDC balance from RPC call
- `reward_token_amount`: Amount of reward tokens (if any)
- `reward_token_symbol`: Token symbol for the reward
- `reward_price_usd`: Price of reward token in USD from CoinGecko
- `total_value_usd`: `usdc_amount + (reward_token_amount * reward_price_usd)`

---

## API Endpoints

### Data Collection (Internal/Cron)
```
POST /api/collect-data
- Fetches USDC balances for all agents
- Fetches reward token balances
- Gets prices from CoinGecko
- Calculates total_value_usd
- Stores snapshot in DB
```

### Public Endpoints
```
GET /api/agents
- Returns list of all agents

GET /api/agents/:contractAddress/performance
Query params: ?from=timestamp&to=timestamp&interval=1h|1d
- Returns historical performance data
- Supports time range filtering
- Aggregation by interval

GET /api/agents/:contractAddress/current
- Returns latest snapshot for an agent

GET /api/leaderboard
- Returns agents ranked by total_value_usd
- Includes ROI calculations
```

---

## Data Flow

### 1. Data Collection (Scheduled - every 5-15 minutes)
```
Cron Job → Collect Service
  ↓
  ├─→ RPC Provider (Alchemy/Moralis) → Get USDC balance
  ├─→ RPC Provider → Get reward token balance (if applicable)
  └─→ CoinGecko API → Get reward token price
  ↓
Calculate total_value_usd
  ↓
Store in PostgreSQL
```

### 2. Frontend Data Fetch
```
Frontend Component
  ↓
GET /api/agents/:address/performance
  ↓
PostgreSQL Query
  ↓
Return JSON with historical data
  ↓
Chart Component renders with D3
```

---

## Implementation Structure (Next.js)

```
/score-charts
  /app
    /api
      /agents
        route.ts                    # GET all agents
        /[address]
          /performance
            route.ts                # GET performance history
          /current
            route.ts                # GET current snapshot
      /leaderboard
        route.ts                    # GET ranked agents
      /collect-data
        route.ts                    # POST trigger data collection

    /components                     # Existing React components
    page.tsx                        # Main page
    layout.tsx

  /lib
    /db
      schema.sql                    # Database schema
      client.ts                     # PostgreSQL connection
    /services
      rpcService.ts                 # Alchemy/Moralis calls
      priceService.ts               # CoinGecko integration
      performanceService.ts         # Business logic
    /utils
      calculations.ts               # ROI, total value calculations

  /config
    agents.ts                       # Agent configurations (addresses, etc.)
```

---

## External Services Required

### 1. RPC Provider (Choose one)
- **Alchemy** (Recommended): Free tier, good docs, multiple chains
- **Moralis**: Higher-level abstractions, easier token balance APIs
- **QuickNode**: Fast, reliable

### 2. Price Data
- **CoinGecko API**: Free tier, 50 calls/min
- **Alternative**: CoinMarketCap API

### 3. Database
- **PostgreSQL** (Recommended): TimescaleDB extension for time-series optimization
- **Alternatives**: MongoDB, Supabase (PostgreSQL + APIs)

### 4. Hosting
- **Vercel**: Best for Next.js, includes cron jobs
- **Railway/Render**: Good for PostgreSQL hosting
- **AWS**: Full control, more complex

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# RPC Provider
ALCHEMY_API_KEY=your_key
CHAIN_ID=1  # Ethereum mainnet

# CoinGecko
COINGECKO_API_KEY=your_key  # Optional for free tier

# Cron Secret (for securing cron endpoints)
CRON_SECRET=random_secret_string
```

---

## Migration Path from Current Setup

1. **Keep existing React frontend as-is**
2. **Add Next.js incrementally**:
   - Create `app/` directory
   - Move components to `app/components/`
   - Add API routes in `app/api/`
   - Update imports gradually

3. **Or start fresh Next.js project**:
   - Copy components from `score-graph/src/components/`
   - Recreate pages with App Router
   - Add backend features

---

## Estimated Development Timeline

- **Week 1**: Next.js setup, database schema, RPC integration
- **Week 2**: CoinGecko integration, data collection service, cron setup
- **Week 3**: API endpoints, connect frontend to real data
- **Week 4**: Testing, optimization, deployment

---

## Next Steps

1. Decide: Next.js migration or separate backend?
2. Choose RPC provider (Alchemy recommended)
3. Set up PostgreSQL database
4. Create agent configuration with contract addresses
5. Start with data collection service
