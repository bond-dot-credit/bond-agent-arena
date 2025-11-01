# Daily Yield Tracking

## How It Works

- **Initial Setup**: Run `npm run reset-snapshots` to create 3 days of historical data
- **Daily Updates**: Run `npm run add-daily-yield` once per day to add the next day's yield

## Current Status

- Last reset: Nov 1, 2025 ~12:43 PM
- Data range: Oct 29 - Nov 1
- Next update: Run `npm run add-daily-yield` on Nov 2

## APR Settings

Edit `scripts/add-daily-yield.ts` to change daily APR values:

```typescript
const dailyAPRs = {
  Giza: 8.26,
  'Sail.Money': 9.15,
  Almanak: 6.40,
  Surf: 3.9,
  Mamo: 6.9,
};
```

## Commands

- `npm run reset-snapshots` - Reset all data (creates 3 days from scratch)
- `npm run add-daily-yield` - Add one day of yield (run daily)
- `npm run update-snapshots` - Add 3 days of historical snapshots (legacy)
