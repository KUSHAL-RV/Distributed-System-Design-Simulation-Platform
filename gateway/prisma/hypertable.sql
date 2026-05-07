-- Enable the TimescaleDB extension if not already enabled
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Convert the standard Prisma table into a TimescaleDB hypertable partitioned by the `timestamp` column
-- Prisma defines our table name mapped dynamically to `simulation_metrics`
-- We use skip_data_copy if it's a fresh DB, or if not, Timescale will attempt migration natively
SELECT create_hypertable('simulation_metrics', 'timestamp', migrate_data => true, if_not_exists => true);
