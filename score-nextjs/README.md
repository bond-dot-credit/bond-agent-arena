# Bond Credit - Agent Performance Dashboard

Next.js 15 application for tracking AI agent performance with real-time metrics and analytics.

## Features

- ✅ Next.js 15 with App Router
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ D3.js for data visualization
- ✅ Framer Motion animations
- ✅ Mock data with localStorage
- ✅ API routes for agent data
- ✅ Real-time crypto prices from CoinGecko

## Getting Started

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## Project Structure

```
score-nextjs/
├── app/
│   ├── api/                    # API routes
│   │   ├── agents/            # Agent endpoints
│   │   │   └── [address]/
│   │   │       └── performance/
│   │   └── leaderboard/       # Leaderboard endpoint
│   ├── components/            # React components
│   │   ├── ui/               # UI components
│   │   ├── AgentCarousel.tsx
│   │   ├── Chart.tsx
│   │   ├── CryptoGrid.tsx
│   │   ├── Header.tsx
│   │   ├── ModelStats.tsx
│   │   └── StatusBar.tsx
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── lib/
│   ├── data/                 # Mock data
│   │   └── mockAgents.ts
│   ├── services/             # Services
│   │   └── mockDataService.ts
│   └── types/                # TypeScript types
│       └── index.ts
└── public/                   # Static assets
```

## API Endpoints

### GET /api/agents
Returns list of all agents

### GET /api/agents/[address]/performance
Returns historical performance data for an agent

Query params:
- `from`: timestamp (optional)
- `to`: timestamp (optional)
- `interval`: `1h` | `24h` | `ALL` (default: `1h`)

### GET /api/leaderboard
Returns agents ranked by total value USD

## Mock Data

Currently using localStorage for mock historical data. Data is generated on first load with:
- 7 days of historical snapshots
- Hourly data points
- Realistic market volatility simulation

## Next Steps

1. Replace mock data with real blockchain data (Alchemy/Moralis)
2. Add PostgreSQL database for historical data storage
3. Implement scheduled data collection (cron jobs)
4. Add CoinGecko API integration for reward token prices
5. Add authentication for admin routes
6. Deploy to Vercel

## Environment Variables (Future)

```env
DATABASE_URL=postgresql://...
ALCHEMY_API_KEY=your_key
COINGECKO_API_KEY=your_key
```
