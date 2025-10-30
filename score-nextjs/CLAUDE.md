# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Agentic Alpha** - A Next.js 15 application for tracking and benchmarking autonomous yield agent performance. This is NOT a trading system; it tracks stablecoin yield generation from autonomous agents competing against an Aave 8% APR baseline.

## Commands

### Development
```bash
npm run dev                 # Start dev server on localhost:3000
npm run build              # Production build
npm start                  # Start production server
npm run lint               # Run ESLint
npm run update-snapshots   # Generate new performance snapshots (3 days worth)
```

### Deployment
```bash
npm run deploy             # Deploy to Cloudflare Workers
```

## Architecture

### Data Flow

1. **Supabase Backend**: PostgreSQL database with two main tables
   - `agentss`: Agent metadata (name, contract_address, APR, validation status)
   - `performance_snapshots`: Time-series data (30-min intervals, tracks total_value_usd)

2. **API Layer**: Next.js API routes in `/app/api/`
   - `/api/agents/[address]/performance` - Returns filtered snapshots based on timeframe (1H, 24H, 72H, ALL)
   - Uses `lib/services/agentService.ts` to query Supabase

3. **Client Components**: React 19 with client-side interactivity
   - `ChartWithData.tsx` - Main D3.js chart with crosshair, hover effects, live price tracking
   - `AgentCarousel.tsx` - Top bar showing real-time agent values
   - `ModelStats.tsx` - Sidebar with tabs (Leaderboard, README.TXT, Contestants)

### Key Architectural Decisions

**Table Naming**: Uses `agentss` (double 's') to avoid conflict with existing `agents` table

**Chart Rendering**:
- D3.js handles all SVG rendering with smooth curves (`d3.curveMonotoneX`)
- Crosshair overlay uses `.lower()` to prevent blocking yield event markers
- Line highlighting: Dims all lines to 20% opacity, glows hovered line with `drop-shadow` filter
- Agent identification: CSS classes use `line-${agentName.replace(/[\s.]+/g, '-')}` pattern (dots and spaces → dashes)

**Data Generation**:
- Script calculates yield: `daily_yield = (capital × APR) / 365 / 100`
- Half-hourly yield: `daily_yield / 48`
- Adds ±0.5% volatility to simulate realistic market behavior

**Timeframe Logic**:
- Frontend requests interval (1H, 24H, 72H, ALL)
- Backend applies limit first (most recent N snapshots), then reverses for chronological order
- No time filtering to ensure data availability regardless of seeded timestamp age

### Component Communication

```
page.tsx (Server Component)
  ├─> getAllAgents() from Supabase
  ├─> AgentCarousel (fetches live values via API)
  ├─> ChartWithData (fetches snapshots via API, handles D3 rendering)
  └─> ModelStats (displays leaderboard/info tabs)
```

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Critical Implementation Details

### Chart Hover System

The chart implements a sophisticated hover system with multiple layers:
1. **Overlay rect** (`.lower()` to back) - Captures mouse events
2. **Crosshair group** - Vertical line + tooltips (`pointer-events: none`)
3. **Yield markers** - Above overlay with `pointer-events: all`
4. **Line detection** - Calculates Y-distance to find closest agent line

### CSS Class Escaping

Agent names contain special characters (e.g., "Sail.Money"). Always use:
```typescript
modelName.replace(/[\s.]+/g, '-')  // Replaces spaces AND dots
```

### Snapshot Update Script

Located in `scripts/update-snapshots.ts`:
- Fetches latest snapshot to continue from current capital
- Generates 144 half-hourly snapshots (3 days)
- Inserts in batches of 100 for performance
- Manual APR configuration in script (Phase 1)

Current APRs: Giza (9.8%), Sail.Money (7.3%), Almanak (5.2%), Surf (3.9%), Mamo (1.1%)

### Navigation State

`Header.tsx` uses `usePathname()` to highlight active page:
- `/` = LIVE page (chart view)
- `/leaderboard` = Detailed agent grid with performance metrics

### Color Theme

Golden/bronze palette: `#c9b382`, `#f4e4c1`, `#d4a574` for primary accents
Chart colors defined in: `agentColors = ['#c9b382', '#d4a574', '#b89968', '#e0c896', '#a88a5e']`

## Database Schema Notes

- Base capital: $2000 per agent
- Time resolution: 30-minute intervals (48 per day)
- Indexes on `(agent_id, timestamp DESC)` for fast queries
- Cascade deletes on agent removal

## Routes

- `/` - Main chart view with live performance
- `/leaderboard` - Detailed agent leaderboard page
- Both use same components (Header, AgentCarousel, CryptoGrid)

## Common Gotchas

1. **Chart not updating**: Check `showDollar` dependency in `useEffect` for `createChart`
2. **Lines not highlighting**: Verify CSS class names match the replace pattern
3. **Yield markers not hovering**: Ensure overlay has `.lower()` and markers have `pointer-events: all`
4. **Empty snapshots**: Run `npm run update-snapshots` to generate data
5. **Agent name mismatch**: Database uses "Almanak" (with 'k'), not "Almanac"
