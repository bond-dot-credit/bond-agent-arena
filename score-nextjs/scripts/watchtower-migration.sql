CREATE TABLE IF NOT EXISTS watchtower_agents (
  id                   BIGSERIAL PRIMARY KEY,
  agent_key            TEXT UNIQUE NOT NULL,
  name                 TEXT NOT NULL,
  ticker               TEXT NOT NULL,
  color                TEXT NOT NULL,
  chain                TEXT,
  protocols            TEXT[],
  tee_status           TEXT DEFAULT 'Attested',
  erc8004_address      TEXT,
  strategy_type        TEXT,
  strategy_description TEXT,
  strategy_notes       TEXT,
  liquidation_proximity TEXT DEFAULT 'Low',
  liquidity_exposure   TEXT DEFAULT 'Low',
  performance_score    INTEGER NOT NULL DEFAULT 0,
  risk_score           INTEGER NOT NULL DEFAULT 0,
  stability_score      INTEGER NOT NULL DEFAULT 0,
  sentiment_score      INTEGER NOT NULL DEFAULT 0,
  provenance_score     INTEGER NOT NULL DEFAULT 0,
  sharpe_ratio         DECIMAL(6,3),
  max_drawdown         DECIMAL(6,2),
  leverage             DECIMAL(4,2),
  credit_capacity      BIGINT DEFAULT 0,
  signal               TEXT DEFAULT 'caution',
  score_trend          TEXT DEFAULT 'stable',
  days_since_scored    INTEGER,
  capital_apy_total    DECIMAL(8,4),
  capital_apy_native   DECIMAL(8,4),
  reward_dependency    DECIMAL(6,2),
  total_yield          DECIMAL(12,4),
  native_yield         DECIMAL(12,4),
  reward_yield         DECIMAL(12,4),
  total_volume         DECIMAL(14,2),
  transaction_count    INTEGER,
  cadence_days         DECIMAL(6,3),
  capital_deployed     DECIMAL(12,2),
  capital_turnover     DECIMAL(8,2),
  tyr                  DECIMAL(8,4),
  yield_per_1k         DECIMAL(8,4),
  protocol_diversity   INTEGER,
  season               TEXT DEFAULT 'genesis',
  last_scored_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_watchtower_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS watchtower_agents_updated_at ON watchtower_agents;
CREATE TRIGGER watchtower_agents_updated_at
  BEFORE UPDATE ON watchtower_agents
  FOR EACH ROW EXECUTE FUNCTION update_watchtower_agents_updated_at();
