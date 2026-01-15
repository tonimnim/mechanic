#!/bin/sh
set -e

# Only run migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  npx prisma db push --accept-data-loss || echo "Migration failed, continuing anyway..."
else
  echo "DATABASE_URL not set, skipping migrations..."
fi

echo "Starting application..."
exec node server.js
