.PHONY: install dev test lint build clean help \
        be-install be-dev be-test be-test-watch be-test-cov be-lint \
        fe-install fe-dev fe-test fe-test-watch fe-test-cov fe-lint fe-build

# Variables
PYTHON ?= python3
UVICORN_PORT ?= 8000
VITE_PORT ?= 5173

# ─── Default ────────────────────────────────────────────────────────────────

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─── Setup ──────────────────────────────────────────────────────────────────

install: be-install fe-install ## Instalar todas las dependencias

be-install: ## Instalar dependencias Python
	$(PYTHON) -m pip install -e ".[dev]"

fe-install: ## Instalar dependencias Node
	cd frontend && npm install

# ─── Desarrollo ─────────────────────────────────────────────────────────────

dev: ## Levantar backend y frontend en paralelo
	@trap 'kill 0' SIGINT; \
	$(MAKE) be-dev & \
	$(MAKE) fe-dev & \
	wait

be-dev: ## Levantar backend (FastAPI + uvicorn)
	uvicorn backend.main:app --reload --port $(UVICORN_PORT)

fe-dev: ## Levantar frontend (Vite HMR)
	cd frontend && npm run dev

# ─── Tests ──────────────────────────────────────────────────────────────────

test: be-test fe-test ## Correr todos los tests

be-test: ## Tests backend (pytest)
	pytest

be-test-watch: ## Tests backend en modo watch
	ptw

be-test-cov: ## Tests backend con cobertura
	pytest --cov=backend --cov-report=term-missing --cov-report=html

fe-test: ## Tests frontend (vitest)
	cd frontend && npm test

fe-test-watch: ## Tests frontend en modo watch
	cd frontend && npm run test:watch

fe-test-cov: ## Tests frontend con cobertura
	cd frontend && npm run test:coverage

# ─── Lint ───────────────────────────────────────────────────────────────────

lint: be-lint fe-lint ## Lint completo

be-lint: ## Lint Python (ruff si disponible, sino flake8)
	@if command -v ruff > /dev/null; then ruff check backend tests; \
	else echo "ruff no instalado, saltando lint Python"; fi

fe-lint: ## Lint TypeScript/React (ESLint)
	cd frontend && npm run lint

# ─── Build ──────────────────────────────────────────────────────────────────

build: fe-build ## Build de producción

fe-build: ## Build frontend (Vite)
	cd frontend && npm run build

# ─── Limpieza ───────────────────────────────────────────────────────────────

clean: ## Limpiar artefactos generados
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	rm -rf .coverage htmlcov/
	rm -rf frontend/coverage frontend/dist
