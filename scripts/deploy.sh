#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "==> Deploy: starting database and generating client..."
echo ""

# 1. Start database with Docker Compose
echo "[1/2] Starting database (docker-compose up -d)..."
docker compose up -d

# 2. Wait for Postgres to be ready (optional but recommended)
echo ""
echo "Waiting for Postgres to be ready..."
for i in {1..30}; do
  if docker compose exec -T postgres pg_isready -U postgres -q 2>/dev/null; then
    echo "Postgres is ready."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "Warning: Postgres did not become ready in time. Continuing anyway."
  fi
  sleep 1
done

# 3. Generate Prisma client
echo ""
echo "[2/2] Generating Prisma client..."
pnpm prisma generate

echo ""
echo "==> Deploy done. Database is running; Prisma client generated."
echo "    Run 'pnpm dev' to start the app, or 'pnpm build && pnpm start' for production."
