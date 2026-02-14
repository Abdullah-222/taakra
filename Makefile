.PHONY: help build up down logs restart clean dev prod prisma-migrate prisma-studio

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

logs: ## Show logs
	docker-compose logs -f

restart: ## Restart all services
	docker-compose restart

clean: ## Remove containers, volumes, and images
	docker-compose down -v --rmi all

dev: ## Start development environment
	docker-compose -f docker-compose.dev.yml up

dev-build: ## Build and start development environment
	docker-compose -f docker-compose.dev.yml up --build

prod: ## Start production environment
	docker-compose up -d

prisma-migrate: ## Run Prisma migrations
	docker-compose exec app pnpm prisma migrate dev

prisma-studio: ## Open Prisma Studio
	docker-compose exec app pnpm prisma studio

prisma-generate: ## Generate Prisma Client
	docker-compose exec app pnpm prisma generate

prisma-push: ## Push Prisma schema to database
	docker-compose exec app pnpm prisma db push

shell: ## Open shell in app container
	docker-compose exec app sh

db-shell: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U postgres -d estatepro

status: ## Show status of all services
	docker-compose ps

install: ## Install dependencies in container
	docker-compose exec app pnpm install
