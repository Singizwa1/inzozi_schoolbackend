#!/bin/sh
set -e

echo "Starting Inzozi Backend (Dev Mode)..."

# Wait for PostgreSQL
echo "Waiting for PostgreSQL at ${DEV_HOST:-postgres}:${DEV_PORT:-5432}..."
i=1
while [ $i -le 30 ]; do
  if nc -z "${DEV_HOST:-postgres}" "${DEV_PORT:-5432}" >/dev/null 2>&1; then
    echo "✅ PostgreSQL is ready!"
    break
  fi
  echo "🟨 PostgreSQL not ready yet... retrying ($i/30)"
  sleep 2
  i=$((i + 1))
done

# Run migrations
echo "🔧 Running migrations..."
if ! npx sequelize-cli db:migrate --config src/config/config.js; then
  echo "❌ Migrations failed!"
  exit 1
fi

# Seed (optional in dev)
echo "🌱 Seeding database..."
if ! npx sequelize-cli db:seed:all --config src/config/config.js; then
  echo "❌ Seeding failed!"
  exit 1
fi

# Start dev server (no build step)
echo "🚀 Starting dev server with 'npm run dev'..."
exec npm run dev
