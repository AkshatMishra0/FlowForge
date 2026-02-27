# FlowForge Development Makefile
# Simplified commands for common development tasks

.PHONY: help install dev build test clean docker-up docker-down migrate seed lint format

# Default target
help:
	@echo "FlowForge Development Commands"
	@echo "=============================="
	@echo ""
	@echo "Setup:"
	@echo "  make install      - Install dependencies"
	@echo "  make setup        - Initial project setup"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development servers"
	@echo "  make build        - Build all applications"
	@echo "  make test         - Run all tests"
	@echo "  make lint         - Run linters"
	@echo "  make format       - Format code"
	@echo ""
	@echo "Database:"
	@echo "  make migrate      - Run database migrations"
	@echo "  make migrate-reset - Reset database"
	@echo "  make seed         - Seed database with sample data"
	@echo "  make db-studio    - Open Prisma Studio"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up    - Start Docker services"
	@echo "  make docker-down  - Stop Docker services"
	@echo "  make docker-logs  - View Docker logs"
	@echo "  make docker-clean - Clean Docker volumes"
	@echo ""
	@echo "Cleaning:"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make clean-all    - Deep clean (includes node_modules)"
	@echo ""

# Installation
install:
	@echo "Installing dependencies..."
	npm install

setup: install
	@echo "Setting up project..."
	@if not exist ".env" copy ".env.example" ".env"
	@echo "Generating Prisma client..."
	cd apps/backend && npx prisma generate
	@echo "Setup complete! Update .env with your configuration."

# Development
dev:
	@echo "Starting development servers..."
	npm run dev

build:
	@echo "Building all applications..."
	npm run build

test:
	@echo "Running tests..."
	npm run test

test-watch:
	@echo "Running tests in watch mode..."
	npm run test:watch

test-cov:
	@echo "Running tests with coverage..."
	npm run test:cov

lint:
	@echo "Running linters..."
	npm run lint

format:
	@echo "Formatting code..."
	npm run format

# Database commands
migrate:
	@echo "Running database migrations..."
	cd apps/backend && npx prisma migrate dev

migrate-reset:
	@echo "Resetting database..."
	cd apps/backend && npx prisma migrate reset

migrate-deploy:
	@echo "Deploying migrations to production..."
	cd apps/backend && npx prisma migrate deploy

seed:
	@echo "Seeding database..."
	cd apps/backend && npx prisma db seed

db-studio:
	@echo "Opening Prisma Studio..."
	cd apps/backend && npx prisma studio

db-push:
	@echo "Pushing schema changes..."
	cd apps/backend && npx prisma db push

# Docker commands
docker-up:
	@echo "Starting Docker services..."
	docker-compose up -d

docker-down:
	@echo "Stopping Docker services..."
	docker-compose down

docker-logs:
	@echo "Viewing Docker logs..."
	docker-compose logs -f

docker-clean:
	@echo "Cleaning Docker volumes..."
	docker-compose down -v

docker-build:
	@echo "Building Docker images..."
	docker-compose build

docker-restart:
	@echo "Restarting Docker services..."
	docker-compose restart

# Production commands
prod-build:
	@echo "Building for production..."
	set NODE_ENV=production && npm run build

prod-start:
	@echo "Starting production server..."
	npm run start:prod

# Cleaning
clean:
	@echo "Cleaning build artifacts..."
	if exist "dist" rmdir /s /q dist
	if exist "apps\\backend\\dist" rmdir /s /q apps\\backend\\dist
	if exist "apps\\web\\.next" rmdir /s /q apps\\web\\.next
	if exist "apps\\worker\\dist" rmdir /s /q apps\\worker\\dist

clean-all: clean
	@echo "Deep cleaning..."
	if exist "node_modules" rmdir /s /q node_modules
	if exist "apps\\backend\\node_modules" rmdir /s /q apps\\backend\\node_modules
	if exist "apps\\web\\node_modules" rmdir /s /q apps\\web\\node_modules
	if exist "apps\\worker\\node_modules" rmdir /s /q apps\\worker\\node_modules

# Utility commands
check:
	@echo "Checking project health..."
	npm run lint
	npm run type-check
	npm run test

type-check:
	@echo "Running TypeScript type check..."
	npm run type-check

update-deps:
	@echo "Updating dependencies..."
	npm update
	npm audit fix

# Backend specific
backend-dev:
	@echo "Starting backend in development..."
	cd apps/backend && npm run start:dev

backend-test:
	@echo "Testing backend..."
	cd apps/backend && npm run test

# Frontend specific
web-dev:
	@echo "Starting frontend in development..."
	cd apps/web && npm run dev

web-build:
	@echo "Building frontend..."
	cd apps/web && npm run build

# Worker specific
worker-dev:
	@echo "Starting worker in development..."
	cd apps/worker && npm run dev

worker-build:
	@echo "Building worker..."
	cd apps/worker && npm run build

# Git helpers
git-setup:
	@echo "Setting up git hooks..."
	npm run prepare

# CI/CD helpers
ci-test:
	@echo "Running CI tests..."
	npm ci
	npm run lint
	npm run type-check
	npm run test:ci

# Health check
health:
	@echo "Checking application health..."
	@curl http://localhost:4000/health || echo "Backend not running"
	@curl http://localhost:3000 || echo "Frontend not running"
