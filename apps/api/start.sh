#!/bin/sh
set -e

cd /app/apps/api

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npx tsx prisma/seed.ts 2>/dev/null || echo "Seed completed or skipped"

echo "Starting server..."
node dist/index.js
