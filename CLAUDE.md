# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

PRUNAPE (Prueba Nacional de Pesquisa) es una aplicación de screening del desarrollo infantil para Hospital Garrahan. Evalúa 79 hitos del desarrollo (0-6 años) y determina si un niño PASA o NO_PASA la pesquisa.

## Comandos

### Backend

```bash
# Instalar dependencias (desde raíz)
pip install -e ".[dev]"

# Correr servidor de desarrollo
uvicorn backend.main:app --reload

# Correr todos los tests
pytest

# Correr un test específico
pytest tests/test_evaluation.py

# Cobertura
pytest --cov=backend --cov-report=html
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Dev server (HMR)
npm run dev

# Build de producción
npm run build

# Lint
npm run lint

# Tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con reporte de cobertura
npm run test:coverage
```

## Arquitectura

### Backend (FastAPI + SQLAlchemy + SQLite)

```
routers/ → services/ → models.py → SQLite
```

- `backend/routers/` — endpoints REST (`/api/patients`, `/api/assessments`)
- `backend/services/age_service.py` — cálculo de edad cronológica y corregida (prematuros)
- `backend/services/evaluation.py` — algoritmo PASA/NO_PASA (lógica crítica del dominio)
- `backend/percetiles.py` — `PautasRepository` con los 79 hitos en memoria (no en DB)
- `backend/models.py` — ORM: `Patient`, `Assessment`, `AssessmentItem`

El algoritmo de evaluación está en `evaluation.py`:
- Tipo A: si `age > P90` y `passed=False` → cuenta como falla grave (1 falla → NO_PASA)
- Tipo B: si `P75 <= age <= P90` y `passed=False` → cuenta como falla moderada (2 fallas → NO_PASA)

La edad corregida solo aplica para prematuros (`gestational_age_weeks < 37`) menores de 2 años.

### Frontend (React 19 + Vite + React Router v7)

```
pages/ (containers con estado) → components/ (presentacionales) → api/
```

- `src/pages/` — páginas con estado local (`useState`/`useEffect`), sin state management global
- `src/components/` — componentes presentacionales (`PautaCard`, `ResultSummary`, `PercentileChart`)
- `src/api/` — wrapper HTTP simple sobre `fetch`; URL base desde `VITE_API_URL`

El flujo principal es el wizard en `NewAssessmentPage.tsx` (3 pasos: Edad → Evaluación → Resultado).

### Modelo de datos

```
Patient (id, name, birth_date, gestational_age_weeks?)
  └── Assessment (id, patient_id, result: PASA|NO_PASA, chronological_age, corrected_age?)
        └── AssessmentItem (id, assessment_id, pauta_id, passed)
```

## Tests

### Backend (`tests/`)
- `conftest.py` — fixtures: DB SQLite en memoria + cliente HTTP de prueba
- Cada archivo de test cubre una capa (routers, services, models, schemas)

### Frontend (`src/**/__tests__/`)
- Setup: Vitest + jsdom + `src/test/mocks.ts` (mocks de la capa API)
- Exclusiones de cobertura: `App.tsx` (usa `BrowserRouter` sin mockeabilidad), `main.tsx`, `types/`, `test/`

## Configuración relevante

- Backend escucha en `http://localhost:8000`, frontend en `http://localhost:5173`
- CORS configurado en `backend/main.py` para `localhost:5173` y `localhost:3000`
- `pyproject.toml` — dependencias Python, config pytest (`pythonpath = ["backend"]`, `testpaths = ["tests"]`)
- `frontend/vitest.config.ts` — proveedor de cobertura v8, ambiente jsdom
- TypeScript en modo strict con `noUnusedLocals` y `noUnusedParameters`
- `backend/assessment.py` y `backend/child.py` son archivos legacy — no modificar, se excluyen de cobertura
