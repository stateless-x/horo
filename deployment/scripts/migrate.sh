#!/bin/bash
# Database migration script for Railway deployment
# This script runs Drizzle migrations for the database

set -e

echo "Starting database migration..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set"
  exit 1
fi

# Navigate to the db package directory
cd "$(dirname "$0")/../../packages/db"

echo "Running Drizzle migrations..."
bun run drizzle-kit migrate

echo "Migration completed successfully!"
