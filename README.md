# PRUNAPE - Prueba Nacional de Pesquisa

Aplicación web para evaluación del desarrollo psicomotor en niños de 0 a 6 años, basada en la PRUNAPE (Prueba Nacional de Pesquisa) del Hospital Garrahan.

PRUNAPE es una herramienta de pesquisa nacional que identifica niños con posible retraso del desarrollo para derivación a evaluación especializada. Esta aplicación web permite a profesionales de salud realizar evaluaciones rápidas y sistemáticas en el terreno.

## Stack Tecnológico

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| **Backend** | FastAPI | 0.104+ |
| **ORM** | SQLAlchemy | 2.0+ |
| **Base de Datos** | SQLite | 3.40+ |
| **Validación** | Pydantic | 2.0+ |
| **Python** | CPython | 3.11+ |
| **Frontend** | React | 19+ |
| **Build** | Vite | 8+ |
| **Routing** | React Router | v7+ |
| **Lenguaje** | TypeScript | 5.0+ |
| **Node** | Node.js | 20+ |

## Requisitos Previos

- Python 3.11 o superior
- Node.js 20 o superior
- pip (gestor de paquetes Python)
- npm o yarn (gestor de paquetes Node)

## Instalación y Configuración

### Backend

```bash
# Clonar repositorio (si no está clonado)
git clone <repo-url>
cd prunape/backend

# Crear entorno virtual
python3.11 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias con extras de desarrollo
pip install -e ".[dev]"
```

### Frontend

```bash
cd prunape/frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env.local si es necesario
echo "VITE_API_URL=http://localhost:8000" > .env.local
```

## Ejecución de la Aplicación

### Backend (terminal 1)

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El servidor estará disponible en `http://localhost:8000`. La documentación interactiva en `http://localhost:8000/docs`.

### Frontend (terminal 2)

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Ejecución de Tests

### Backend

```bash
cd backend
source venv/bin/activate

# Ejecutar tests con cobertura
pytest --cov=backend --cov-report=term-missing

# Ejecutar tests específicos
pytest tests/test_models.py -v

# Ejecutar con marcadores
pytest -m "not slow" -v
```

### Frontend

```bash
cd frontend

# Ejecutar tests con cobertura
npm run test:coverage

# Modo watch
npm run test:watch

# Tests específicos
npm test -- PatientListPage
```

## Estructura del Proyecto

```
prunape/
├── backend/
│   ├── child.py                 # Clase Child para cálculo de edad
│   ├── percentiles.py           # PautasRepository con 79 hitos del desarrollo
│   ├── database.py              # Configuración SQLAlchemy
│   ├── models.py                # ORM: Patient, Assessment, AssessmentItem
│   ├── schemas.py               # Esquemas Pydantic
│   ├── main.py                  # Aplicación FastAPI, CORS, lifespan
│   ├── services/
│   │   ├── age_service.py       # Funciones de cálculo de edad
│   │   └── evaluation.py        # Algoritmo de evaluación PASA/NO_PASA
│   ├── routers/
│   │   ├── patients.py          # CRUD /api/patients
│   │   └── assessments.py       # Endpoints /api/assessments
│   ├── tests/
│   │   ├── test_models.py
│   │   ├── test_evaluation.py
│   │   ├── test_age_service.py
│   │   └── test_routers.py
│   ├── pyproject.toml
│   └── prunape.db               # Base de datos SQLite
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts        # Wrapper HTTP con fetch
│   │   │   ├── patients.ts      # Funciones API para pacientes
│   │   │   └── assessments.ts   # Funciones API para evaluaciones
│   │   ├── components/
│   │   │   ├── PautaCard.tsx         # Tarjeta de hito (botones PASA/FALLA)
│   │   │   ├── ResultSummary.tsx     # Resumen resultado PASA/NO_PASA
│   │   │   └── PercentileChart.tsx   # Gráfico SVG de percentiles
│   │   ├── pages/
│   │   │   ├── HomePage.tsx              # Página de inicio
│   │   │   ├── PatientListPage.tsx        # Listado con búsqueda
│   │   │   ├── PatientCreatePage.tsx      # Crear paciente
│   │   │   ├── PatientDetailPage.tsx      # Detalle + historial
│   │   │   ├── NewAssessmentPage.tsx      # Wizard 3 pasos
│   │   │   └── AssessmentResultPage.tsx   # Resultado de evaluación
│   │   ├── types/index.ts       # Definiciones TypeScript
│   │   ├── App.tsx              # Configuración routing
│   │   └── main.tsx             # Punto de entrada
│   ├── public/
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── index.html
│
├── docs/
│   ├── TECHNICAL.md             # Documentación técnica y arquitectura
│   ├── FUNCTIONAL.md            # Documentación funcional y dominio
│   ├── USER_GUIDE.md            # Guía de uso para usuarios finales
│   └── RUNBOOK.md               # Guía operacional
│
└── README.md                    # Este archivo
```

## Documentación

La documentación del proyecto se encuentra en la carpeta `docs/`:

- **[docs/TECHNICAL.md](docs/TECHNICAL.md)** - Arquitectura técnica, API, modelos de datos
- **[docs/FUNCTIONAL.md](docs/FUNCTIONAL.md)** - Especificación funcional, algoritmos, interpretación clínica
- **[docs/USER_GUIDE.md](docs/USER_GUIDE.md)** - Guía de uso paso a paso
- **[docs/RUNBOOK.md](docs/RUNBOOK.md)** - Guía operacional y troubleshooting

## Endpoints Principales

| Método | Ruta | Descripción |
|--------|------|------------|
| GET | `/api/patients` | Listar pacientes (con búsqueda) |
| POST | `/api/patients` | Crear nuevo paciente |
| GET | `/api/patients/{id}` | Obtener paciente con historial |
| PUT | `/api/patients/{id}` | Actualizar paciente |
| DELETE | `/api/patients/{id}` | Eliminar paciente |
| POST | `/api/assessments/calculate-age` | Calcular edad + hitos aplicables |
| POST | `/api/assessments` | Crear evaluación |
| GET | `/api/assessments/{id}` | Obtener evaluación |
| DELETE | `/api/assessments/{id}` | Eliminar evaluación |
| GET | `/api/pautas` | Listar todos los 79 hitos |

## Variables de Entorno

### Backend

Ninguna requerida para desarrollo. En producción:
- `DATABASE_URL`: Ruta a la base de datos SQLite (default: `./prunape.db`)
- `LOG_LEVEL`: Nivel de logging (default: `INFO`)

### Frontend

- `VITE_API_URL`: URL del servidor backend (default: `http://localhost:8000`)

## Contribución

Antes de hacer commit, asegurar que:

1. El código pasa los tests: `pytest` (backend) y `npm test` (frontend)
2. No hay errores de lint/type
3. Los mensajes de commit siguen el formato: imperativo, en español, sin punto final

## Licencia

Proyecto de Hospital Garrahan, Argentina.

## Soporte

Para preguntas o problemas, contactar al equipo de desarrollo del Hospital Garrahan.
