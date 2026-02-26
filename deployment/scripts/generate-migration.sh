#!/bin/bash
# Generate new migration script
# Usage: ./generate-migration.sh

set -e

echo "Generating new database migration..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set"
  exit 1
fi

# Navigate to the db package directory
cd "$(dirname "$0")/../../packages/db"

echo "Running Drizzle generate..."
bun run db:generate

echo "Migration generated successfully!"
echo "Remember to commit the new migration files in packages/db/drizzle/"
