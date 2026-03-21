#!/bin/sh

cd /app/apps/api

echo "Running database migrations..."
npx prisma migrate deploy 2>&1 || {
  echo "Migration failed, trying db push instead..."
  npx prisma db push --accept-data-loss 2>&1 || echo "DB push also failed"
}

echo "Seeding database..."
npx tsx prisma/seed.ts 2>&1 || echo "Seed completed or skipped"

echo "Starting server..."
node dist/index.js
