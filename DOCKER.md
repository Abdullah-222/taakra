# Docker Setup Guide

## Prerequisites
- Docker and Docker Compose installed
- `.env` file with all required environment variables

## Quick Start

### Development Mode
```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up

# Or with rebuild
docker-compose -f docker-compose.dev.yml up --build
```

### Production Mode
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## Using Makefile (Recommended)

```bash
# Show all available commands
make help

# Development
make dev              # Start dev environment
make dev-build        # Build and start dev

# Production
make build           # Build images
make up              # Start services
make down            # Stop services
make logs            # View logs
make restart         # Restart all services

# Database
make prisma-migrate  # Run migrations
make prisma-studio   # Open Prisma Studio
make prisma-push     # Push schema to DB

# Utilities
make shell           # Open app shell
make db-shell        # Open PostgreSQL shell
make status          # Show service status
```

## Environment Variables

1. Copy the example env file:
```bash
cp .env.example .env
```

2. Update `.env` with your actual credentials:
   - Database credentials (auto-configured for Docker)
   - Supabase keys
   - Pusher credentials
   - 100ms video tokens
   - Stripe keys
   - Email service keys

## Database Setup

The PostgreSQL database is automatically configured in Docker. The connection string in `.env` should be:

```
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/estatepro?schema=public"
```

### Run Migrations
```bash
# After containers are running
make prisma-migrate

# Or manually
docker-compose exec app pnpm prisma migrate dev
```

### Access Prisma Studio
```bash
make prisma-studio

# Or manually
docker-compose exec app pnpm prisma studio
```

## Service URLs

- **Application**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Prisma Studio**: http://localhost:5555 (when running)

## Troubleshooting

### Reset Everything
```bash
make clean
```

### View Container Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Access Container Shell
```bash
# App container
make shell

# Database container
make db-shell
```

### Rebuild After Code Changes
```bash
# Development (auto-reload)
docker-compose -f docker-compose.dev.yml up --build

# Production
docker-compose up --build
```

## Architecture

- **app**: Next.js application (port 3000)
- **postgres**: PostgreSQL database (port 5432)
- **Volume**: Persistent database storage
- **Network**: Bridge network for service communication

## Notes

- Development mode uses volume mounts for hot reload
- Production mode uses standalone Next.js build
- Database data persists in Docker volumes
- Health checks ensure services start in correct order
