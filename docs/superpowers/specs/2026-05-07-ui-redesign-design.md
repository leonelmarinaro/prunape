# UI Redesign — PRUNAPE

**Fecha:** 2026-05-07  
**Alcance:** Rediseño integral de UI/UX — todas las pantallas  
**Enfoque:** Rediseño por pantalla (Opción B)

---

## Decisiones de diseño acordadas

| Decisión | Valor |
|---|---|
| Dirección visual | Clínico / Profesional |
| Paleta base | Azul Garrahan (`#1e3a5f`) |
| Acento interactivo | `#2563eb` (blue-600) |
| Fondo de app | `#f1f5f9` (slate-100) |
| Superficie (cards) | `#ffffff` |
| Color PASA | `#16a34a` (green-600) |
| Color NO PASA | `#334155` (slate-700) — gris neutro, contraste WCAG AA ≥ 4.5:1 |
| Navegación | Sidebar completo con iconos + texto |
| Áreas a mejorar | Todas (home, wizard, pacientes, resultado) |

---

## 1. Design Tokens (`frontend/src/index.css`)

Reemplazar variables CSS actuales por:

```css
--primary:            #1e3a5f;  /* Azul Garrahan */
--primary-accent:     #2563eb;  /* blue-600 — botones, nav activo */
--primary-foreground: #ffffff;
--success:            #16a34a;  /* PASA */
--success-foreground: #ffffff;
--neutral:            #334155;  /* NO PASA — slate-700, contraste 5.9:1 sobre blanco */
--neutral-foreground: #ffffff;
--background:         #f1f5f9;  /* fondo app */
--surface:            #ffffff;  /* fondo cards */
--foreground:         #0f172a;  /* texto principal */
--muted:              #f8fafc;
--muted-foreground:   #64748b;
--border:             #e2e8f0;
--radius:             0.5rem;
```

**Nota de accesibilidad**: `#334155` (slate-700) sobre blanco alcanza ratio 5.9:1, cumpliendo WCAG AA. No usar `#475569` (slate-600, ratio 4.0:1 — insuficiente).

---

## 2. Layout (`frontend/src/App.tsx`)

### Sidebar (desktop — siempre visible)
- **Logo area**: ícono SVG pediátrico (16px) + "PRUNAPE" bold `#1e3a5f` + subtítulo "Hospital Garrahan" en `#94a3b8`
- **Nav items**: `<Home />` y `<Users />` de lucide-react (16px) + label, `gap-2.5`, `px-3 py-2`
- **Active state**: `border-l-[3px] border-blue-600 bg-blue-50 text-[#1e3a5f] font-semibold`
- **Inactive state**: texto e ícono en `#64748b`, hover `bg-slate-50`
- **Footer del sidebar**: avatar de iniciales (`AvatarInitials` existente, 28px) + nombre de usuario + "Médico" como rol fijo + ícono de tres puntos. Si no hay Clerk (`!CLERK_KEY`), omitir footer.

### Topbar — comportamiento por breakpoint

**Desktop (lg+)**:
```
[ PRUNAPE / {Página Actual} ]  ----  [ + Nueva Evaluación (btn azul) ]
```
- Breadcrumb: "PRUNAPE" en `text-slate-400` + "/" separador + nombre de página en `font-semibold text-[#1e3a5f]`
- Botón "+ Nueva Evaluación": `bg-[#2563eb] text-white`, navega a `/patients` con intent de crear (no directamente a `/patients/new` porque necesita seleccionar paciente primero). En rutas `/patients/:id` o `/patients/:id/assess` cambia a `bg-[#2563eb]` y navega a `/patients/:id/assess`.
- `UserButton` de Clerk se mantiene a la derecha del botón si `CLERK_KEY` existe.

**Mobile (< lg)**:
```
[ ☰ ]  [ PRUNAPE ]  ----  (sin botón Nueva Evaluación — espacio insuficiente)
```
- Se mantiene comportamiento actual: hamburger abre sidebar con overlay.
- El botón "+ Nueva Evaluación" NO aparece en mobile topbar. Cada página expone su propio CTA.

---

## 3. Homepage — Dashboard (`frontend/src/pages/HomePage.tsx`)

### Stats row (3 cards, `grid-cols-3`)
Derivados en frontend desde `usePatients()` — sin nuevo endpoint:

1. **Total Pacientes** — `patients.length`
2. **Evaluaciones (mes actual)** — `patients.flatMap(p => p.assessments).filter(a => isSameMonth(a.assessment_date, today)).length`
3. **Tasa de Aprobación** — sobre los últimos 30 assessments ordenados por fecha: `% PASA`. Número en `#16a34a`.

Estado loading: 3 skeleton cards (`SkeletonTable` existente o `<div className="animate-pulse">`).  
Estado error: texto muted "No se pudieron cargar las estadísticas."  
Estado vacío (0 pacientes): mostrar `—` en lugar de `0%`.

### Últimas evaluaciones (lista)
Derivado del mismo `usePatients()`: todos los assessments de todos los pacientes, ordenados por `assessment_date` desc, primeros 5.

```typescript
// Shape que se construye en el componente — sin hook nuevo
interface RecentItem {
  assessmentId: number
  patientId: number
  patientName: string
  assessmentDate: string   // ISO string
  result: 'PASA' | 'NO_PASA'
  chronologicalAge: number // años decimales
}
```

Card blanca: header "Últimas evaluaciones" + link "Ver todos →" (navega a `/patients`).  
Cada fila: `AvatarInitials` (32px) + nombre + edad formateada + fecha relativa + badge resultado.  
Badge PASA: `bg-green-100 text-green-800`. Badge NO PASA: `bg-slate-100 text-slate-700`.  
Click en fila → `/assessments/:assessmentId`.

Estado vacío: `<EmptyState>` existente con CTA "Registrar primer paciente".

---

## 4. Wizard de Evaluación (`frontend/src/pages/NewAssessmentPage.tsx`)

### StepIndicator — nuevo componente `frontend/src/components/ui/StepIndicator.tsx`

**Visual únicamente** — no es libremente clickeable.  
Navegación: el usuario solo puede ir hacia atrás (step 1 desde step 2+, step 2 desde step 3). El componente no expone `onClick` hacia adelante.

```typescript
interface StepIndicatorProps {
  steps: string[]        // ['Fecha', 'Evaluación', 'Resultado']
  current: number        // 1-based
  onBack?: (step: number) => void  // llamado al click en paso anterior
}
```

Estructura HTML accesible:
```html
<ol role="list" aria-label="Pasos de la evaluación">
  <li role="listitem" aria-current="step">   <!-- paso activo -->
  <li role="listitem" aria-label="completado">  <!-- paso anterior -->
  <li role="listitem" aria-disabled="true">  <!-- paso futuro -->
</ol>
```

Estados visuales:
- **Completado**: círculo `bg-green-600` + check SVG blanco, label `text-green-600 font-semibold`
- **Activo**: círculo `bg-blue-600` + número blanco, label `text-blue-600 font-semibold`
- **Pendiente**: círculo `bg-slate-200` + número `text-slate-400`, label `text-slate-400`
- **Línea**: `bg-green-500` si el paso anterior está completo, `bg-slate-200` sino

### Paso 1 — Selección de fecha
- Card de contexto del paciente: `AvatarInitials` + nombre + fecha de nacimiento
- Input de fecha con `<label>` explícito
- Card informativa `bg-blue-50 border-l-2 border-blue-600` mostrando edad cronológica calculada (aparece solo después de calcular)
- CTA "Comenzar Evaluación →" full-width

### Paso 2 — Evaluación de pautas

**Progress bar**: contador "X / Y pautas" izquierda + porcentaje grande derecha + barra `h-2 bg-blue-600`.

**Acordeones por área** (elemento `<details>` existente, rediseñado):

| Estado | Header bg | Borde | `open` |
|---|---|---|---|
| Completada | `bg-green-50` | `border-green-200` | cerrado automáticamente |
| Activa (primera con sin responder) | `bg-blue-50` | `border-blue-300 border-[1.5px]` | abierto |
| Pendiente | `bg-white` | `border-slate-200` | cerrado, `opacity-70` |

**Filas de pauta** (`div` dentro del `<details>`):

| Estado | Fondo fila | Botón "Cumple" | Botón "No cumple" |
|---|---|---|---|
| Sin responder | `bg-white` | `border-2 border-green-600 text-green-700` | `border-2 border-red-600 text-red-700` |
| Cumple | `bg-green-50` | `bg-green-600 text-white` (filled) | gris plano outline |
| No cumple | `bg-red-50` | gris plano outline | `bg-red-600 text-white` (filled) |

Badge tipo: Tipo A = `bg-red-100 text-red-800`. Tipo B = `bg-yellow-100 text-yellow-800`.

### Paso 3 — Revisión
Misma estructura actual. Aplicar colores de filas (verde/rojo) como en paso 2.

---

## 5. Resultado de Evaluación (`frontend/src/pages/AssessmentResultPage.tsx`)

Estado loading: `<p>Cargando...</p>` existente (sin cambio funcional, puede mejorarse a skeleton en v2).

### Banner principal
```
┌─────────────────────────────────────────┐
│  [ícono circular 52px]                  │
│  PASA / NO PASA  (text-4xl font-black)  │
│  Texto descriptivo (text-sm)            │
└─────────────────────────────────────────┘
```
- **PASA**: `border-2 border-green-500 bg-white`, ícono `bg-green-100` + check SVG verde, título `text-green-800`
- **NO PASA**: `border-2 border-slate-400 bg-white`, ícono `bg-slate-100` + alerta SVG `#334155`, título `text-slate-800`

### Grid de datos clínicos
`grid grid-cols-2 sm:grid-cols-4 gap-4`. Celdas: `dt` uppercase muted + `dd` font-semibold.  
Campos: Paciente, Fecha, Edad Cronológica, Pautas evaluadas.  
Edad Corregida: aparece como 5ª celda solo si `assessment.corrected_age != null`.

### Hitos no alcanzados — solo si `result === 'NO_PASA'`
Card con header "Hitos no alcanzados" + badge `bg-slate-100 text-slate-700` con conteo.  
Cada fila: badge Tipo (A=rojo, B=amarillo) + nombre pauta + área + "P90: X.XX años".

### CTAs
- Primario: "Descargar PDF" — `bg-[#1e3a5f] text-white`
- Secundario: "Imprimir" — `variant="outline"`
- Breadcrumb arriba: "← Volver al paciente" en `text-[#2563eb]`

---

## 6. Ficha de Paciente (`frontend/src/pages/PatientDetailPage.tsx`)

### Header card
`AvatarInitials` 40px (`bg-blue-100 text-blue-800`) + nombre `text-xl font-semibold` + edad en muted + EG.  
Grid `grid-cols-2 gap-3` con celdas: Nacimiento, Edad Gestacional.  
Cada celda: `bg-slate-50 rounded-md p-2` + label muted + valor bold.  
Botón "Editar" `variant="outline" size="sm"` arriba a la derecha.

### Historial de evaluaciones
Card: header "Historial" + botón "+ Nueva" `size="sm" bg-blue-600`.  
Cada fila de la tabla: clickeable en toda la fila → `/assessments/:id`.  
Columnas: Fecha, Edad cronológica, Resultado (badge).  
Badge PASA: `bg-green-100 text-green-800`. Badge NO PASA: `bg-slate-100 text-slate-700`.

Estado vacío: `<EmptyState>` existente.

---

## 7. Lista de Pacientes (`frontend/src/pages/PatientListPage.tsx`)

- `AvatarInitials` (32px) en cada fila, antes del nombre
- Badge del último resultado inline en columna nueva "Último resultado" (visible solo en sm+)
- Botón "+ Nuevo Paciente": pasar de `variant="outline"` a `bg-[#2563eb] text-white`
- Búsqueda: sin cambio funcional, solo style del input alineado a la paleta

---

## 8. Formularios de paciente — cambios mínimos

`frontend/src/pages/PatientCreatePage.tsx` y `PatientEditPage.tsx`:  
Solo heredan la paleta desde los tokens. Sin cambios estructurales. El sistema de colores actualiza automáticamente el foco, bordes y botones.

---

## 9. ResultSummary (`frontend/src/components/ResultSummary.tsx`)

Leer el archivo al implementar para alinear el listado de hitos con el nuevo diseño de filas (badge Tipo + nombre + área). Si ya usa la estructura correcta, solo aplicar los nuevos colores de badge.

---

## Archivos a modificar / crear

### Modificar
| Archivo | Cambio |
|---|---|
| `frontend/src/index.css` | Reemplazar design tokens |
| `frontend/src/App.tsx` | Sidebar + Topbar rediseñados |
| `frontend/src/pages/HomePage.tsx` | Dashboard con stats + últimas evaluaciones |
| `frontend/src/pages/NewAssessmentPage.tsx` | StepIndicator + acordeones rediseñados |
| `frontend/src/pages/AssessmentResultPage.tsx` | Banner + grid clínico + hitos fallados |
| `frontend/src/pages/PatientDetailPage.tsx` | Header mejorado + historial con badges |
| `frontend/src/pages/PatientListPage.tsx` | Avatares + badge último resultado |
| `frontend/src/pages/PatientCreatePage.tsx` | Solo hereda paleta (sin cambios estructurales) |
| `frontend/src/pages/PatientEditPage.tsx` | Solo hereda paleta (sin cambios estructurales) |
| `frontend/src/components/ResultSummary.tsx` | Alinear colores de badges al nuevo sistema |

### Crear
| Archivo | Descripción |
|---|---|
| `frontend/src/components/ui/StepIndicator.tsx` | Componente de indicador de pasos accesible |

---

## Restricciones

- No modificar lógica de negocio ni hooks de API existentes
- Stats del dashboard: derivar en frontend desde `usePatients()` — sin endpoint nuevo
- Mantener todos los tests actuales pasando (109 tests)
- No romper accesibilidad existente (`aria-live`, `aria-label`, roles semánticos)
- `StepIndicator` debe tener `role="list"` con `role="listitem"` y `aria-current="step"`
- TypeScript strict — cero errores nuevos
- `PautaCard.tsx` puede quedar sin uso — no eliminar hasta confirmar con tests
