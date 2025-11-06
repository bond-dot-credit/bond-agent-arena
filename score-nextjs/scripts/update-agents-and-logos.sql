-- Update agent names and add website URLs to the agentss table

-- Update Arma (formerly using Giza logo)
UPDATE agentss 
SET medal_url = '/arma_logo.png',
    name = 'Arma'
WHERE contract_address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

-- Update Sail
UPDATE agentss 
SET medal_url = '/sale_money_logo.ico',
    name = 'Sail'
WHERE contract_address = '0x1234567890123456789012345678901234567890';

-- Update ZyFAI (changed from Almanak, using new logo)
UPDATE agentss 
SET medal_url = '/Zyfai_icon.svg',
    name = 'ZyFAI'
WHERE contract_address = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

-- Update SurfLiquid
UPDATE agentss 
SET medal_url = '/surf_logo.avif',
    name = 'SurfLiquid'
WHERE contract_address = '0x9876543210987654321098765432109876543210';

-- Update Mamo
UPDATE agentss 
SET medal_url = '/mamo_agent.ico',
    name = 'Mamo'
WHERE contract_address = '0x5555555555555555555555555555555555555555';

-- If you want to add a website column (optional - only if you want to store this in the database)
-- First, add the column if it doesn't exist:
ALTER TABLE agentss ADD COLUMN IF NOT EXISTS website TEXT;

-- Then update the websites:
UPDATE agentss SET website = 'https://arma.xyz/' 
WHERE contract_address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

UPDATE agentss SET website = 'http://sail.money/' 
WHERE contract_address = '0x1234567890123456789012345678901234567890';

UPDATE agentss SET website = 'https://www.zyf.ai/' 
WHERE contract_address = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

UPDATE agentss SET website = 'https://surfliquid.com/' 
WHERE contract_address = '0x9876543210987654321098765432109876543210';

UPDATE agentss SET website = 'https://mamo.bot/' 
WHERE contract_address = '0x5555555555555555555555555555555555555555';

-- Verify the updates
SELECT name, contract_address, medal_url, website FROM agentss ORDER BY performance_score DESC;
