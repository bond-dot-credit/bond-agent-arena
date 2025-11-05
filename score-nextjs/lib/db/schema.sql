-- Agentss table
CREATE TABLE agentss (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contract_address VARCHAR(42) UNIQUE NOT NULL,
  vault_type VARCHAR(100) NOT NULL DEFAULT 'Stablecoin yield',
  risk_score DECIMAL(3, 2) NOT NULL DEFAULT 0.80,
  validation VARCHAR(20) NOT NULL DEFAULT 'pending',
  performance_score DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  medal_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance snapshots table
CREATE TABLE performance_snapshots (
  id BIGSERIAL PRIMARY KEY,
  agent_id BIGINT REFERENCES agentss(id) ON DELETE CASCADE,
  usdc_amount DECIMAL(20, 6) NOT NULL,
  reward_token_amount DECIMAL(20, 6),
  reward_token_symbol VARCHAR(10),
  reward_price_usd DECIMAL(20, 6),
  total_value_usd DECIMAL(20, 6) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_performance_agent_timestamp ON performance_snapshots(agent_id, timestamp DESC);
CREATE INDEX idx_performance_timestamp ON performance_snapshots(timestamp DESC);
CREATE INDEX idx_agentss_contract_address ON agentss(contract_address);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agentss_updated_at BEFORE UPDATE ON agentss
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert mock agents
INSERT INTO agentss (name, contract_address, vault_type, risk_score, validation, performance_score, medal_url) VALUES
('Giza', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'Stablecoin yield', 0.92, 'verified', 88.4, '/giza_logo.ico'),
('Sail.Money', '0x1234567890123456789012345678901234567890', 'Stablecoin yield', 0.87, 'processing', 83.1, '/sale_money_logo.ico'),
('Almanak', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', 'Stablecoin yield', 0.94, 'verified', 81.7, '/almanak_logo.ico'),
('SurfLiquid', '0x9876543210987654321098765432109876543210', 'Stablecoin yield', 0.80, 'pending', 74.9, '/surf_logo.avif'),
('Mamo', '0x5555555555555555555555555555555555555555', 'Stablecoin yield', 0.71, 'warning', 69.3, '/mamo_agent.ico');
