.PHONY: help build up down logs restart clean backup restore

# Default environment
ENV_FILE ?= .env

help: ## Show this help message
	@echo "Docapture Docker Compose Commands"
	@echo ""
	@echo "Usage: make [command]"
	@echo ""
	@echo "Commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-25s %s\n", $$1, $$2}'

# Development commands
dev: ## Start development environment
	docker-compose up -d
	@echo "Development environment started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:5000"

dev-build: ## Build and start development environment
	docker-compose up -d --build
	@echo "Development environment built and started!"

dev-logs: ## View development logs
	docker-compose logs -f

dev-stop: ## Stop development environment
	docker-compose down
	@echo "Development environment stopped!"

# Production commands
prod: ## Start production environment
	docker-compose --env-file $(ENV_FILE) up -d
	@echo "Production environment started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:5000"

prod-build: ## Build and start production environment
	docker-compose --env-file $(ENV_FILE) up -d --build
	@echo "Production environment built and started!"

prod-logs: ## View production logs
	docker-compose logs -f

prod-stop: ## Stop production environment
	docker-compose down
	@echo "Production environment stopped!"

# Service management
build: ## Build all services
	docker-compose build

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

restart-ui: ## Restart frontend only
	docker-compose restart docapture-ui

restart-api: ## Restart backend only
	docker-compose restart docextract-api

restart-db: ## Restart database only
	docker-compose restart mongodb

# Logs and monitoring
logs: ## View all logs
	docker-compose logs -f

logs-ui: ## View frontend logs
	docker-compose logs -f docapture-ui

logs-api: ## View backend logs
	docker-compose logs -f docextract-api

logs-db: ## View database logs
	docker-compose logs -f mongodb

status: ## Show service status
	docker-compose ps

stats: ## Show resource usage
	docker stats

# Database operations
db-test: ## Test MongoDB connection
	@echo "Testing MongoDB connection..."
	@docker-compose exec docextract-api sh -c "echo 'db.runCommand(\"ping\").ok' | mongosh \"$$MONGODB_URI\" --quiet" || echo "Failed to connect to MongoDB"

# Cleanup operations
clean: ## Remove stopped containers and unused images
	docker-compose down
	docker system prune -f

clean-all: ## Remove everything including volumes (WARNING: DATA LOSS)
	@echo "WARNING: This will delete all data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		docker system prune -af --volumes; \
		echo "All data cleaned!"; \
	fi

# Health checks
health: ## Check health of all services
	@echo "Service Health Status:"
	@docker inspect --format='{{.Name}}: {{.State.Health.Status}}' \
		$$(docker-compose ps -q) 2>/dev/null || echo "No health checks available"

test-frontend: ## Test frontend accessibility
	@curl -f http://localhost:3000 > /dev/null 2>&1 && \
		echo "✅ Frontend is accessible" || \
		echo "❌ Frontend is not accessible"

test-backend: ## Test backend accessibility
	@curl -f http://localhost:5000 > /dev/null 2>&1 && \
		echo "✅ Backend is accessible" || \
		echo "❌ Backend is not accessible"

test-all: test-frontend test-backend ## Test all services

# Environment setup
init: ## Initialize environment file
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✅ .env file created from template"; \
		echo "⚠️  Please edit .env with your configuration"; \
	else \
		echo ".env file already exists"; \
	fi

init-prod: ## Initialize production environment file
	@if [ ! -f .env.production ]; then \
		cp .env.example .env.production; \
		echo "✅ .env.production file created from template"; \
		echo "⚠️  Please edit .env.production with your production configuration"; \
	else \
		echo ".env.production file already exists"; \
	fi

# Update operations
update: ## Pull latest code and restart services
	git pull
	docker-compose down
	docker-compose build
	docker-compose up -d
	@echo "Services updated and restarted!"

update-images: ## Pull latest Docker images
	docker-compose pull
	@echo "Docker images updated!"

# Scaling operations
scale-ui: ## Scale frontend (specify REPLICAS=N)
	@if [ -z "$(REPLICAS)" ]; then \
		echo "Error: Please specify REPLICAS=N"; \
		exit 1; \
	fi
	docker-compose up -d --scale docapture-ui=$(REPLICAS)
	@echo "Frontend scaled to $(REPLICAS) replicas"

scale-api: ## Scale backend (specify REPLICAS=N)
	@if [ -z "$(REPLICAS)" ]; then \
		echo "Error: Please specify REPLICAS=N"; \
		exit 1; \
	fi
	docker-compose up -d --scale docextract-api=$(REPLICAS)
	@echo "Backend scaled to $(REPLICAS) replicas"