-- Generate historical performance snapshots for each agent
-- This creates 168 hourly snapshots (7 days) with realistic volatility

DO $$
DECLARE
  agent_record RECORD;
  base_value DECIMAL := 2000.00;
  current_value DECIMAL;
  target_value DECIMAL;
  i INTEGER;
  snapshot_time TIMESTAMP;
  volatility DECIMAL;
  noise DECIMAL;
  roi_percent DECIMAL;
BEGIN
  FOR agent_record IN SELECT id, name FROM agentss LOOP
    -- Calculate target ROI based on agent
    CASE agent_record.name
      WHEN 'Arma' THEN roi_percent := 9.8;
      WHEN 'Sail' THEN roi_percent := 7.3;
      WHEN 'Almanak' THEN roi_percent := 5.2;
      WHEN 'SurfLiquid' THEN roi_percent := 3.9;
      WHEN 'Mamo' THEN roi_percent := 1.1;
      ELSE roi_percent := 0.0;
    END CASE;

    target_value := base_value * (1 + roi_percent / 100);
    current_value := base_value;

    -- Generate 168 hourly snapshots (7 days)
    FOR i IN 0..167 LOOP
      snapshot_time := NOW() - INTERVAL '1 hour' * (167 - i);

      -- Calculate expected value based on progress
      volatility := 0.015 + (random() * 0.01);
      noise := (random() - 0.5) * base_value * volatility;

      current_value := base_value +
                      (target_value - base_value) * (i::DECIMAL / 167) +
                      noise;

      -- Keep values reasonable
      current_value := GREATEST(current_value, base_value * 0.8);
      current_value := LEAST(current_value, base_value * 1.5);

      INSERT INTO performance_snapshots (
        agent_id,
        usdc_amount,
        total_value_usd,
        timestamp
      ) VALUES (
        agent_record.id,
        current_value,
        current_value,
        snapshot_time
      );
    END LOOP;

    RAISE NOTICE 'Generated snapshots for agent: %', agent_record.name;
  END LOOP;
END $$;
