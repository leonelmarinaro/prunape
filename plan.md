# Plan de Implementación - PRUNAPE Web Application

## Resumen
Aplicación web para realizar la Prueba Nacional de Pesquisa (PRUNAPE) del Hospital Garrahan. Permite a profesionales de salud evaluar el desarrollo de niños de 0 a 6 años mediante 79 pautas organizadas en 4 áreas del desarrollo.

## Stack Tecnológico
- **Backend**: FastAPI + SQLAlchemy + SQLite (reutilizando código Python existente)
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Visualización**: Recharts (gráfico de percentiles SVG)

---

## Paso 1: Backend - Base de Datos y Modelos

### 1.1 Crear `backend/database.py`
- Configurar SQLAlchemy con SQLite (`prunape.db`)
- SessionLocal, engine, Base

### 1.2 Crear `backend/models.py` (SQLAlchemy ORM)
```
Patient:
  - id: Integer PK
  - name: String
  - birth_date: Date
  - gestational_age_weeks: Integer (default 40)
  - created_at: DateTime

Assessment:
  - id: Integer PK
  - patient_id: FK → Patient
  - assessment_date: Date
  - chronological_age: Float
  - corrected_age: Float
  - result: String (PASA / NO_PASA)
  - notes: Text (opcional)
  - created_at: DateTime

AssessmentItem:
  - id: Integer PK
  - assessment_id: FK → Assessment
  - pauta_id: Integer
  - pauta_type: String (A / B / normal)
  - passed: Boolean
```

### 1.3 Crear `backend/schemas.py` (Pydantic)
- PatientCreate, PatientResponse
- AssessmentCreate, AssessmentResponse
- AssessmentItemCreate, AssessmentItemResponse
- AgeCalculationRequest, AgeCalculationResponse
- PautaResponse (serialización de pautas existentes)

---

## Paso 2: Backend - API REST

### 2.1 Crear `backend/main.py`
- App FastAPI con CORS middleware
- Incluir routers
- Crear tablas al startup

### 2.2 Crear `backend/routers/patients.py`
- `POST /api/patients` - Crear paciente
- `GET /api/patients` - Listar pacientes (con búsqueda por nombre)
- `GET /api/patients/{id}` - Detalle paciente con historial
- `PUT /api/patients/{id}` - Actualizar paciente
- `DELETE /api/patients/{id}` - Eliminar paciente

### 2.3 Crear `backend/routers/assessments.py`
- `POST /api/assessments/calculate` - Calcular edad y obtener pautas aplicables
  - Input: birth_date, assessment_date, gestational_age_weeks
  - Output: chronological_age, corrected_age, applicable_pautas (con tipo A/B)
- `POST /api/assessments` - Guardar evaluación completa
  - Input: patient_id, assessment_date, items [{pauta_id, passed}]
  - Calcula resultado (PASA/NO_PASA) en el servidor
  - Output: resultado con detalle
- `GET /api/assessments/{id}` - Detalle de evaluación
- `GET /api/patients/{id}/assessments` - Historial de evaluaciones

### 2.4 Crear `backend/routers/pautas.py`
- `GET /api/pautas` - Todas las pautas (para el gráfico de percentiles)
- `GET /api/pautas/areas` - Lista de áreas

### 2.5 Lógica de evaluación (en `backend/services.py`)
Reutiliza `child.py` y `percetiles.py`:
```python
def evaluate_assessment(items, corrected_age, repo):
    failed_a = 0
    failed_b = 0
    for item in items:
        pauta = repo.find_by_id(item.pauta_id)
        if not item.passed:
            if pauta.is_pauta_a(corrected_age):
                failed_a += 1
            elif pauta.is_pauta_b(corrected_age):
                failed_b += 1
    # NO PASA si falla cualquier tipo A o 2+ tipo B
    if failed_a > 0 or failed_b >= 2:
        return "NO_PASA"
    return "PASA"
```

---

## Paso 3: Frontend - Setup y Estructura

### 3.1 Inicializar proyecto React
```bash
cd prunape
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install react-router-dom axios recharts tailwindcss @headlessui/react
```

### 3.2 Estructura de carpetas
```
frontend/src/
├── api/
│   └── client.ts          (Axios instance + API functions)
├── types/
│   └── index.ts           (TypeScript interfaces)
├── components/
│   ├── Layout.tsx          (Header, nav, footer)
│   ├── PatientForm.tsx     (Formulario paciente)
│   ├── PatientList.tsx     (Lista de pacientes)
│   ├── AssessmentWizard.tsx (Wizard de evaluación paso a paso)
│   ├── PautaCard.tsx       (Card individual de pauta con botón pasa/falla)
│   ├── PercentileChart.tsx (Gráfico SVG de percentiles)
│   └── ResultSummary.tsx   (Resultado PASA/NO PASA)
├── pages/
│   ├── HomePage.tsx
│   ├── PatientsPage.tsx
│   ├── PatientDetailPage.tsx
│   ├── NewAssessmentPage.tsx
│   └── AssessmentResultPage.tsx
├── App.tsx
├── main.tsx
└── index.css
```

---

## Paso 4: Frontend - Páginas y Componentes

### 4.1 HomePage
- Bienvenida con descripción de PRUNAPE
- Botones: "Nueva Evaluación" / "Ver Pacientes"

### 4.2 PatientsPage
- Lista de pacientes con búsqueda
- Botón "Nuevo Paciente" → modal/form
- Click en paciente → PatientDetailPage

### 4.3 NewAssessmentPage (flujo principal)
**Paso 1**: Seleccionar o crear paciente
**Paso 2**: Confirmar fecha de evaluación → sistema calcula edad cronológica y corregida
**Paso 3**: Mostrar gráfico de percentiles + lista de pautas a evaluar por área
**Paso 4**: Para cada pauta, marcar PASA / FALLA
**Paso 5**: Ver resultado (PASA / NO PASA) con detalle

### 4.4 PercentileChart (componente clave)
- SVG/Recharts con 4 filas (áreas)
- Cada pauta es una barra horizontal de P75 a P90
- Línea vertical roja = edad corregida del niño
- Colores:
  - Verde: pautas pasadas
  - Rojo: pautas falladas tipo A (edad > P90)
  - Amarillo: pautas falladas tipo B (P75 ≤ edad ≤ P90)
  - Gris: pautas no evaluadas

### 4.5 ResultSummary
- Resultado grande: "PASA" (verde) o "NO PASA" (rojo)
- Tabla resumen por área con items fallados
- Botón imprimir (window.print() con CSS print)
- Botón guardar evaluación

---

## Paso 5: Integración y Testing

### 5.1 Backend
- Instalar dependencias: `pip install fastapi uvicorn sqlalchemy pydantic`
- Correr: `uvicorn backend.main:app --reload --port 8000`

### 5.2 Frontend
- Proxy API a localhost:8000
- Correr: `npm run dev` (puerto 5173)

### 5.3 Verificación
- Crear paciente de prueba
- Ejecutar evaluación completa
- Verificar cálculo de edad corregida para prematuros
- Verificar clasificación A/B de pautas
- Verificar resultado PASA/NO_PASA
- Probar impresión

---

## Orden de Implementación

1. `backend/database.py` + `backend/models.py` + `backend/schemas.py`
2. `backend/services.py` (lógica de evaluación)
3. `backend/routers/patients.py` + `backend/routers/assessments.py` + `backend/routers/pautas.py`
4. `backend/main.py` (integración)
5. Frontend setup (Vite + React + Tailwind)
6. `api/client.ts` + `types/index.ts`
7. `Layout.tsx` + `HomePage.tsx`
8. `PatientForm.tsx` + `PatientList.tsx` + `PatientsPage.tsx`
9. `AssessmentWizard.tsx` + `PautaCard.tsx` + `NewAssessmentPage.tsx`
10. `PercentileChart.tsx`
11. `ResultSummary.tsx` + `AssessmentResultPage.tsx`
12. Testing e integración final
