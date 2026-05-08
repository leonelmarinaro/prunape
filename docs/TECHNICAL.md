# Documentación Técnica - PRUNAPE

## Descripción General de la Arquitectura

PRUNAPE es una aplicación web con arquitectura cliente-servidor:

- **Backend**: FastAPI con SQLAlchemy como ORM
- **Base de Datos**: SQLite
- **Frontend**: React 19 con TypeScript y React Router v7
- **Build**: Vite para bundling y HMR

```
┌─────────────────────────────────────────────────────────────────┐
│                     Web Browser (React 19)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ React Router v7                                          │  │
│  │ ├─ HomePage      ├─ PatientListPage                     │  │
│  │ ├─ PatientDetailPage                                    │  │
│  │ ├─ NewAssessmentPage (3-step wizard)                    │  │
│  │ └─ AssessmentResultPage                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           HTTP/JSON                             │
├─────────────────────────────────────────────────────────────────┤
│                    FastAPI Backend (Python)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Routers                                                  │  │
│  │ ├─ /api/patients      (CRUD)                            │  │
│  │ ├─ /api/assessments   (CRUD + calculate-age)            │  │
│  │ └─ /api/pautas        (Read-only: milestones)           │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Services                                                 │  │
│  │ ├─ age_service: Cálculo de edad crónica y corregida    │  │
│  │ ├─ evaluation: Algoritmo PASA/NO_PASA                   │  │
│  │ └─ percentiles: PautasRepository (79 hitos)             │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ORM (SQLAlchemy 2.0)                                     │  │
│  │ ├─ Patient    (tabla: patient)                          │  │
│  │ ├─ Assessment (tabla: assessment)                       │  │
│  │ └─ AssessmentItem (tabla: assessment_item)              │  │
│  └──────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      SQLite Database                             │
│  prunape.db                                                      │
│  ├─ patient (id, name, birth_date, gestational_age_weeks)       │
│  ├─ assessment (id, patient_id, date, ages, result)             │
│  └─ assessment_item (id, assessment_id, pauta_id, passed)       │
└─────────────────────────────────────────────────────────────────┘
```

## Backend

### FastAPI y Configuración

**Archivo: `main.py`**

```python
app = FastAPI(title="PRUNAPE API")

# CORS habilitado para desarrollo
app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Lifespan para inicialización
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Crear tablas
    yield
    # Shutdown
```

Endpoints registrados:
- `router_patients` en `/api/patients`
- `router_assessments` en `/api/assessments`

### SQLAlchemy y Base de Datos

**Archivo: `database.py`**

```python
DATABASE_URL = "sqlite:///./prunape.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

SessionLocal = sessionmaker(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

Dependencia inyectada en todos los routers mediante `get_db`.

### Modelos ORM

**Archivo: `models.py`**

#### Patient

```python
class Patient(Base):
    __tablename__ = "patient"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    birth_date: Mapped[date]
    gestational_age_weeks: Mapped[int | None]  # Opcional, para prematuros
    created_at: Mapped[datetime] = mapped_column(default_func=datetime.utcnow)

    assessments: Mapped[list["Assessment"]] = relationship(back_populates="patient")
```

#### Assessment

```python
class Assessment(Base):
    __tablename__ = "assessment"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patient.id"))
    assessment_date: Mapped[date]
    chronological_age: Mapped[float]  # Edad crónica en años decimales
    corrected_age: Mapped[float | None]  # Edad corregida (si es prematuro)
    result: Mapped[str]  # "PASA" o "NO_PASA"
    created_at: Mapped[datetime] = mapped_column(default_func=datetime.utcnow)

    patient: Mapped["Patient"] = relationship(back_populates="assessments")
    items: Mapped[list["AssessmentItem"]] = relationship(back_populates="assessment")
```

#### AssessmentItem

```python
class AssessmentItem(Base):
    __tablename__ = "assessment_item"

    id: Mapped[int] = mapped_column(primary_key=True)
    assessment_id: Mapped[int] = mapped_column(ForeignKey("assessment.id"))
    pauta_id: Mapped[int]
    pauta_name: Mapped[str]
    area: Mapped[str]  # P.Social, Motor Fino, Lenguaje, Motor Grueso
    pauta_type: Mapped[str]  # "A" o "B"
    passed: Mapped[bool]

    assessment: Mapped["Assessment"] = relationship(back_populates="items")
```

### Esquemas Pydantic

**Archivo: `schemas.py`**

```python
class PatientCreate(BaseModel):
    name: str
    birth_date: date
    gestational_age_weeks: int | None = None

class PatientOut(BaseModel):
    id: int
    name: str
    birth_date: date
    gestational_age_weeks: int | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AssessmentItemOut(BaseModel):
    id: int
    pauta_id: int
    pauta_name: str
    area: str
    pauta_type: str
    passed: bool

    model_config = ConfigDict(from_attributes=True)

class AssessmentOut(BaseModel):
    id: int
    patient_id: int
    assessment_date: date
    chronological_age: float
    corrected_age: float | None
    result: str
    items: list[AssessmentItemOut]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

### Servicios

#### `age_service.py`

```python
def calculate_chronological_age(birth_date: date, assessment_date: date) -> float:
    """Retorna edad crónica en años (con decimales)."""
    delta = assessment_date - birth_date
    return delta.days / 365.25

def calculate_corrected_age(
    birth_date: date,
    assessment_date: date,
    gestational_age_weeks: int
) -> float:
    """
    Calcula edad corregida para niños prematuros.
    Válida solo para menores de 2 años.

    Formula:
        correction_weeks = 40 - gestational_age_weeks
        correction_years = correction_weeks / 52
        corrected_age = chronological_age - correction_years
    """
```

#### `evaluation.py`

```python
def evaluate_assessment(
    chronological_age: float,
    corrected_age: float | None,
    assessment_items: list[dict]
) -> str:
    """
    Implementa el algoritmo PASA/NO_PASA.

    Retorna "PASA" o "NO_PASA" según:
    - Contar Type A con passed=False: si >= 1 -> NO_PASA
    - Contar Type B con passed=False: si >= 2 -> NO_PASA
    - Sino -> PASA
    """
```

### Routers

#### `routers/patients.py`

| Método | Path | Parámetros | Respuesta |
|--------|------|-----------|----------|
| GET | `/api/patients` | `skip=0, limit=10, search=""` | `list[PatientOut]` (200) |
| POST | `/api/patients` | `PatientCreate` (body) | `PatientOut` (201) |
| GET | `/api/patients/{id}` | `id: int` | `PatientOut + assessments` (200) |
| PUT | `/api/patients/{id}` | `PatientCreate` (body) | `PatientOut` (200) |
| DELETE | `/api/patients/{id}` | `id: int` | (204 No Content) |

#### `routers/assessments.py`

| Método | Path | Descripción | Respuesta |
|--------|------|-----------|----------|
| POST | `/api/assessments/calculate-age` | Calcula edad e hitos aplicables | `{chronological_age, corrected_age?, applicable_pautas}` (200) |
| POST | `/api/assessments` | Crea evaluación y calcula resultado | `AssessmentOut` (201) |
| GET | `/api/assessments/{id}` | Obtiene evaluación completa | `AssessmentOut` (200) |
| DELETE | `/api/assessments/{id}` | Elimina evaluación | (204) |
| GET | `/api/pautas` | Lista los 79 hitos | `list[{id, name, area, p75, p90, type, ...}]` (200) |

## Frontend

### Estructura de React 19

**Archivo: `src/App.tsx`**

Configuración de rutas con React Router v7:

```typescript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/patients" element={<PatientListPage />} />
    <Route path="/patients/new" element={<PatientCreatePage />} />
    <Route path="/patients/:id" element={<PatientDetailPage />} />
    <Route path="/patients/:id/assessment/new" element={<NewAssessmentPage />} />
    <Route path="/assessments/:id" element={<AssessmentResultPage />} />
  </Routes>
</BrowserRouter>
```

### API Client

**Archivo: `src/api/client.ts`**

```typescript
const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api`;

export async function fetchAPI<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}
```

**Archivo: `src/api/patients.ts`**

```typescript
export function getPatients(skip?: number, limit?: number, search?: string) {
  return fetchAPI(`/api/patients?skip=${skip}&limit=${limit}&search=${search}`);
}

export function createPatient(data: PatientCreate) {
  return fetchAPI("/api/patients", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getPatient(id: number) {
  return fetchAPI(`/api/patients/${id}`);
}

export function updatePatient(id: number, data: PatientCreate) {
  return fetchAPI(`/api/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deletePatient(id: number) {
  return fetchAPI(`/api/patients/${id}`, { method: "DELETE" });
}
```

**Archivo: `src/api/assessments.ts`**

```typescript
export function calculateAge(
  birth_date: string,
  assessment_date: string,
  gestational_age_weeks?: number
) {
  return fetchAPI("/api/assessments/calculate-age", {
    method: "POST",
    body: JSON.stringify({
      birth_date,
      assessment_date,
      gestational_age_weeks,
    }),
  });
}

export function createAssessment(data: AssessmentCreate) {
  return fetchAPI("/api/assessments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getAssessment(id: number) {
  return fetchAPI(`/api/assessments/${id}`);
}

export function deleteAssessment(id: number) {
  return fetchAPI(`/api/assessments/${id}`, { method: "DELETE" });
}

export function getPautas() {
  return fetchAPI("/api/pautas");
}
```

### Componentes Principales

#### `PautaCard.tsx`

Tarjeta para cada hito del desarrollo con botones PASA/FALLA:

```typescript
interface PautaCardProps {
  pauta: Pauta;
  onPass: (id: number) => void;
  onFail: (id: number) => void;
  disabled?: boolean;
}

export function PautaCard({ pauta, onPass, onFail, disabled }: PautaCardProps) {
  return (
    <div className="pauta-card">
      <h4>{pauta.name}</h4>
      <p className="area">{pauta.area}</p>
      <p className="type">Tipo: {pauta.type}</p>
      <p className="description">{pauta.description}</p>
      <div className="buttons">
        <button onClick={() => onPass(pauta.id)} disabled={disabled}>
          PASA
        </button>
        <button onClick={() => onFail(pauta.id)} disabled={disabled}>
          NO PASA
        </button>
      </div>
    </div>
  );
}
```

#### `ResultSummary.tsx`

Resumen del resultado PASA/NO_PASA con estadísticas:

```typescript
interface ResultSummaryProps {
  assessment: AssessmentOut;
  patient: PatientOut;
}

export function ResultSummary({ assessment, patient }: ResultSummaryProps) {
  const failedTypeA = assessment.items.filter(
    (item) => item.pauta_type === "A" && !item.passed
  ).length;

  const failedTypeB = assessment.items.filter(
    (item) => item.pauta_type === "B" && !item.passed
  ).length;

  return (
    <div className="result-summary">
      <h2 className={`result ${assessment.result.toLowerCase()}`}>
        {assessment.result}
      </h2>
      <p>Paciente: {patient.name}</p>
      <p>Edad: {assessment.chronological_age.toFixed(2)} años</p>
      {assessment.corrected_age && (
        <p>Edad corregida: {assessment.corrected_age.toFixed(2)} años</p>
      )}
      <p>Fallas Tipo A: {failedTypeA}</p>
      <p>Fallas Tipo B: {failedTypeB}</p>
    </div>
  );
}
```

#### `PercentileChart.tsx`

Gráfico SVG mostrando percentiles P75 y P90:

```typescript
interface PercentileChartProps {
  pautas: Pauta[];
  currentAge: number;
}

export function PercentileChart({ pautas, currentAge }: PercentileChartProps) {
  return (
    <svg width="800" height="400" className="percentile-chart">
      {pautas.map((pauta, i) => (
        <g key={pauta.id}>
          {/* Barra P75 */}
          <rect x={pauta.p75 * scale} y={i * height} width={10} height={height} fill="blue" />

          {/* Barra P90 */}
          <rect x={pauta.p90 * scale} y={i * height} width={10} height={height} fill="red" />

          {/* Línea de edad actual */}
          {currentAge > pauta.p90 && (
            <line x1={currentAge * scale} y1={i * height} x2={currentAge * scale} y2={i * height + height} stroke="green" />
          )}
        </g>
      ))}
    </svg>
  );
}
```

### Pages (Páginas)

#### `NewAssessmentPage.tsx` - Wizard 3 pasos

```typescript
type Step = "edad" | "evaluacion" | "resultado";

export function NewAssessmentPage() {
  const [step, setStep] = useState<Step>("edad");
  const [chronologicalAge, setChronologicalAge] = useState(0);
  const [correctedAge, setCorrectedAge] = useState<number | null>(null);
  const [items, setItems] = useState<Record<number, boolean>>({});
  const [assessment, setAssessment] = useState<AssessmentOut | null>(null);

  const handleCalculateAge = async (birthDate: string, assessmentDate: string) => {
    const result = await calculateAge(birthDate, assessmentDate);
    setChronologicalAge(result.chronological_age);
    setCorrectedAge(result.corrected_age);
    setStep("evaluacion");
  };

  const handleSubmitItems = async () => {
    const result = await createAssessment({
      patient_id: patientId,
      assessment_date: new Date().toISOString().split("T")[0],
      items: Object.entries(items).map(([id, passed]) => ({
        pauta_id: parseInt(id),
        passed,
      })),
    });
    setAssessment(result);
    setStep("resultado");
  };

  return (
    <div>
      {step === "edad" && <StepAge onNext={handleCalculateAge} />}
      {step === "evaluacion" && (
        <StepEvaluation
          age={correctedAge || chronologicalAge}
          onNext={handleSubmitItems}
        />
      )}
      {step === "resultado" && <StepResult assessment={assessment!} />}
    </div>
  );
}
```

### TypeScript Types

**Archivo: `src/types/index.ts`**

```typescript
export interface Patient {
  id: number;
  name: string;
  birth_date: string;
  gestational_age_weeks?: number;
  created_at: string;
}

export interface Pauta {
  id: number;
  name: string;
  area: "P.Social" | "Motor Fino" | "Lenguaje" | "Motor Grueso";
  p75: number;
  p90: number;
  type: "A" | "B";
  milestone_type: "Prueba" | "Pregunta" | "Prueba Demostrada";
  description: string;
}

export interface Assessment {
  id: number;
  patient_id: number;
  assessment_date: string;
  chronological_age: number;
  corrected_age?: number;
  result: "PASA" | "NO_PASA";
  items: AssessmentItem[];
  created_at: string;
}

export interface AssessmentItem {
  id: number;
  pauta_id: number;
  pauta_name: string;
  area: string;
  pauta_type: "A" | "B";
  passed: boolean;
}
```

## Flujo de Datos

### Crear Evaluación

```
1. Usuario selecciona paciente en PatientListPage
   ↓
2. NavEga a NewAssessmentPage con patient_id
   ↓
3. Paso 1: Selecciona fecha de evaluación
   - POST /api/assessments/calculate-age
   - Recibe: chronological_age, corrected_age, applicable_pautas
   ↓
4. Paso 2: Evalúa cada hito (PASA/NO_PASA)
   - Almacena en estado local
   ↓
5. Paso 3: Envía evaluación
   - POST /api/assessments con items[]
   - Backend calcula PASA/NO_PASA
   - Retorna Assessment completa
   ↓
6. Muestra ResultSummary con gráfico
```

### Algoritmo PASA/NO_PASA

Implementado en `backend/services/evaluation.py`:

```
1. Contar hitos Type A con passed=False → countA
2. Contar hitos Type B con passed=False → countB

3. Si countA >= 1 → resultado = "NO_PASA"
   Si countB >= 2 → resultado = "NO_PASA"
   Sino → resultado = "PASA"
```

## Testing

### Backend Tests

```bash
pytest tests/test_models.py         # ORM models
pytest tests/test_evaluation.py     # Algoritmo
pytest tests/test_age_service.py    # Cálculo de edad
pytest tests/test_routers.py        # Endpoints
```

### Frontend Tests

```bash
npm test                            # Todos los tests
npm test -- --coverage             # Con cobertura
npm test -- PatientListPage        # Tests específicos
```

## Consideraciones de Despliegue

### Base de Datos

- SQLite se crea automáticamente en `./prunape.db`
- Las tablas se crean en el lifespan de FastAPI
- Backup: simplemente copiar `prunape.db`

### CORS

En `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Modificar para producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Variables de Entorno (Frontend)

Crear `.env.local` o `.env.production`:
```
VITE_API_URL=https://api.prunape.hospital.ar
```

Vite reemplaza automáticamente `import.meta.env.VITE_API_URL` en build. Pasá solo el host — el cliente agrega `/api` internamente.
