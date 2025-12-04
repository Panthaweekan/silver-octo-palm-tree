-- FitJourney Database Initialization Script

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- Create initial database
-- (Already created by POSTGRES_DB env variable)

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE fitjourney_dev TO fitjourney;

-- Log
SELECT 'Database initialized successfully' AS status;
