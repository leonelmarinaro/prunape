# UI Redesign — PRUNAPE Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar la UI de PRUNAPE con paleta Azul Garrahan, sidebar mejorado, wizard más claro, resultado sin rojo agresivo y dashboard útil.

**Architecture:** Actualización de design tokens CSS → componentes de layout (sidebar/topbar) → páginas de izquierda a derecha del flujo clínico. Sin cambios en lógica de negocio ni hooks de API. El nuevo `StepIndicator` reemplaza los `Tabs` del wizard.

**Tech Stack:** React 19, TypeScript strict, Tailwind v4, shadcn/ui, lucide-react, React Router v7

**Spec:** `docs/superpowers/specs/2026-05-07-ui-redesign-design.md`

**Tests:** Correr `cd frontend && npm test -- --run` después de cada chunk para verificar que los 109 tests siguen pasando.

---

## Chunk 1: Design Tokens + Sidebar + Topbar

### Task 1: Design tokens en `index.css`

**Files:**
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Reemplazar las variables CSS en `:root`**

Reemplazar el bloque `@layer base { :root { ... } }` existente:

```css
@layer base {
  :root {
    --primary:            #1e3a5f;
    --primary-accent:     #2563eb;
    --primary-foreground: #ffffff;
    --success:            #16a34a;
    --success-foreground: #ffffff;
    --neutral:            #334155;
    --neutral-foreground: #ffffff;
    --background:         #f1f5f9;
    --surface:            #ffffff;
    --foreground:         #0f172a;
    --muted:              #f8fafc;
    --muted-foreground:   #64748b;
    --border:             #e2e8f0;
    --radius:             0.5rem;
    /* Aliases para compatibilidad shadcn */
    --color-primary:      var(--primary);
    --color-success:      var(--success);
    --color-neutral:      var(--neutral);
    --color-muted:        var(--muted);
  }
}
```

- [ ] **Step 2: Actualizar el color del `body`**

Cambiar `color: #1f2937` a `color: var(--foreground)` y `background: #f5f7fa` a `background: var(--background)`.

- [ ] **Step 3: Correr tests**

```bash
cd frontend && npm test -- --run
```
Esperado: 109 tests pasan.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/index.css
git commit -m "Actualizar design tokens — paleta Azul Garrahan"
```

---

### Task 2: Redesign del componente `Sidebar`

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Agregar imports de lucide-react al inicio del archivo**

```typescript
import { Home, Users } from "lucide-react"
```

- [ ] **Step 2: Reemplazar el array `navItems`**

```typescript
const navItems = [
  { to: "/", label: "Inicio", end: true, icon: <Home size={16} /> },
  { to: "/patients", label: "Pacientes", icon: <Users size={16} /> },
]
```

- [ ] **Step 3: Reemplazar el componente `Sidebar` completo**

```tsx
function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-60 bg-white border-r border-[var(--border)] flex flex-col",
          "transition-transform duration-200",
          "lg:static lg:translate-x-0 lg:flex",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Navegación principal"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
          <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 2C8 2 4 5 4 9a4 4 0 008 0c0-4-4-7-4-7z" fill="white" opacity=".9"/>
              <circle cx="8" cy="9" r="1.5" fill="#93c5fd"/>
            </svg>
          </div>
          <div>
            <div className="font-extrabold text-sm text-[var(--primary)] leading-tight">PRUNAPE</div>
            <div className="text-[10px] text-[var(--muted-foreground)] leading-tight">Hospital Garrahan</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "border-l-[3px] border-[var(--primary-accent)] bg-blue-50 font-semibold text-[var(--primary)]"
                    : "border-l-[3px] border-transparent text-[var(--muted-foreground)] hover:bg-slate-50 hover:text-[var(--foreground)]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? "text-[var(--primary-accent)]" : ""}>
                    {item.icon}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--border)]">
          <div className="text-[10px] text-[var(--muted-foreground)] text-center">
            Hospital Garrahan · PRUNAPE
          </div>
        </div>
      </aside>
    </>
  )
}
```

**Nota:** El footer con datos de usuario de Clerk se agrega en Task 3 junto con el topbar para manejar el contexto de Clerk en un solo lugar.

- [ ] **Step 4: Correr tests**

```bash
cd frontend && npm test -- --run
```
Esperado: 109 tests pasan.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "Rediseñar sidebar — identidad Garrahan con iconos y estado activo"
```

---

### Task 3: Redesign del Topbar y breadcrumb

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Agregar hook para label de página actual**

Antes del componente `AppShell`, agregar:

```typescript
import { useLocation, useNavigate } from "react-router-dom"

function usePageLabel(): string {
  const { pathname } = useLocation()
  if (pathname === "/") return "Inicio"
  if (pathname === "/patients/new") return "Nuevo Paciente"
  if (/^\/patients\/\d+\/edit$/.test(pathname)) return "Editar Paciente"
  if (/^\/patients\/\d+\/assess$/.test(pathname)) return "Nueva Evaluación"
  if (/^\/assessments\/\d+$/.test(pathname)) return "Resultado"
  if (/^\/patients\/\d+$/.test(pathname)) return "Ficha de Paciente"
  if (pathname.startsWith("/patients")) return "Pacientes"
  return "PRUNAPE"
}
```

- [ ] **Step 2: Agregar hook para URL del botón contextual**

```typescript
function useNewAssessmentHref(): string {
  const { pathname } = useLocation()
  const match = pathname.match(/^\/patients\/(\d+)/)
  if (match) return `/patients/${match[1]}/assess`
  return "/patients"
}
```

- [ ] **Step 3: Reemplazar el `header` dentro de `AppShell`**

```tsx
function AppShellTopbar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const pageLabel = usePageLabel()
  const newAssessmentHref = useNewAssessmentHref()

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-[var(--border)] px-4 py-2.5 flex items-center gap-3">
      {/* Hamburger mobile */}
      <button
        className="lg:hidden p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        onClick={onMenuOpen}
        aria-label="Abrir menú"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Breadcrumb — solo desktop */}
      <nav aria-label="Ubicación" className="hidden lg:flex items-center gap-1.5 text-sm">
        <span className="text-[var(--muted-foreground)]">PRUNAPE</span>
        <span className="text-[var(--muted-foreground)]">/</span>
        <span className="font-semibold text-[var(--primary)]">{pageLabel}</span>
      </nav>

      {/* Título mobile */}
      <span className="font-semibold text-[var(--foreground)] lg:hidden">PRUNAPE</span>

      <div className="flex-1" />

      {/* Botón Nueva Evaluación — solo desktop */}
      <Link
        to={newAssessmentHref}
        className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary-accent)] text-white text-sm font-semibold rounded-md hover:opacity-90 transition-opacity"
      >
        + Nueva Evaluación
      </Link>

      {CLERK_KEY && <UserButton />}
    </header>
  )
}
```

Luego en `AppShell`, reemplazar el `<header>` existente por `<AppShellTopbar onMenuOpen={() => setSidebarOpen(true)} />`.

Asegurarse de agregar `import { Link } from "react-router-dom"` si no está ya importado (ya está).

- [ ] **Step 4: Correr tests**

```bash
cd frontend && npm test -- --run
```
Esperado: 109 tests pasan.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "Agregar breadcrumb y botón contextual Nueva Evaluación en topbar"
```

---

## Chunk 2: StepIndicator + Wizard

### Task 4: Componente `StepIndicator`

**Files:**
- Create: `frontend/src/components/ui/StepIndicator.tsx`
- Create: `frontend/src/components/ui/__tests__/StepIndicator.test.tsx`

- [ ] **Step 1: Escribir el test primero**

```typescript
// frontend/src/components/ui/__tests__/StepIndicator.test.tsx
import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { StepIndicator } from "../StepIndicator"

describe("StepIndicator", () => {
  const steps = ["Fecha", "Evaluación", "Resultado"]

  it("marca el paso activo con aria-current", () => {
    render(<StepIndicator steps={steps} current={2} />)
    const items = screen.getAllByRole("listitem")
    expect(items[1]).toHaveAttribute("aria-current", "step")
  })

  it("marca pasos completados como aria-label completado", () => {
    render(<StepIndicator steps={steps} current={2} />)
    const items = screen.getAllByRole("listitem")
    expect(items[0]).toHaveAttribute("aria-label", "Fecha: completado")
  })

  it("marca pasos futuros como aria-disabled", () => {
    render(<StepIndicator steps={steps} current={2} />)
    const items = screen.getAllByRole("listitem")
    expect(items[2]).toHaveAttribute("aria-disabled", "true")
  })

  it("llama onBack al clickear un paso anterior", async () => {
    const onBack = vi.fn()
    render(<StepIndicator steps={steps} current={3} onBack={onBack} />)
    const items = screen.getAllByRole("listitem")
    items[0].click()
    expect(onBack).toHaveBeenCalledWith(1)
  })
})
```

- [ ] **Step 2: Correr el test para verificar que falla**

```bash
cd frontend && npm test -- --run StepIndicator
```
Esperado: FAIL (StepIndicator no existe).

- [ ] **Step 3: Implementar `StepIndicator`**

```tsx
// frontend/src/components/ui/StepIndicator.tsx
import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  steps: string[]
  current: number  // 1-based
  onBack?: (step: number) => void
}

export function StepIndicator({ steps, current, onBack }: StepIndicatorProps) {
  return (
    <ol role="list" aria-label="Pasos de la evaluación" className="flex items-center w-full mb-6">
      {steps.map((label, idx) => {
        const step = idx + 1
        const isCompleted = step < current
        const isActive = step === current
        const isPending = step > current
        const isClickable = isCompleted && onBack

        return (
          <li
            key={label}
            role="listitem"
            aria-current={isActive ? "step" : undefined}
            aria-label={isCompleted ? `${label}: completado` : undefined}
            aria-disabled={isPending ? "true" : undefined}
            className="flex items-center flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onBack(step)}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                  isCompleted && "bg-green-600 text-white",
                  isActive && "bg-[var(--primary-accent)] text-white",
                  isPending && "bg-slate-200 text-slate-400 cursor-default",
                  isClickable && "cursor-pointer hover:opacity-80"
                )}
                aria-label={isClickable ? `Volver al paso ${step}: ${label}` : undefined}
              >
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  step
                )}
              </button>
              <span
                className={cn(
                  "text-[10px] font-medium whitespace-nowrap",
                  isCompleted && "text-green-600",
                  isActive && "text-[var(--primary-accent)]",
                  isPending && "text-slate-400"
                )}
              >
                {label}
              </span>
            </div>

            {/* Línea conectora */}
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mb-5 mx-1",
                  isCompleted ? "bg-green-500" : "bg-slate-200"
                )}
                aria-hidden="true"
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
```

- [ ] **Step 4: Correr el test para verificar que pasa**

```bash
cd frontend && npm test -- --run StepIndicator
```
Esperado: 4 tests pasan.

- [ ] **Step 5: Correr todos los tests**

```bash
cd frontend && npm test -- --run
```
Esperado: 113 tests pasan (109 anteriores + 4 nuevos).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/ui/StepIndicator.tsx frontend/src/components/ui/__tests__/StepIndicator.test.tsx
git commit -m "Agregar componente StepIndicator accesible con tests"
```

---

### Task 5: Redesign del Wizard — Step 1 + integrar StepIndicator

**Files:**
- Modify: `frontend/src/pages/NewAssessmentPage.tsx`

- [ ] **Step 1: Agregar import de StepIndicator**

```typescript
import { StepIndicator } from "@/components/ui/StepIndicator"
```

- [ ] **Step 2: Reemplazar los `<Tabs>` por `StepIndicator` + lógica condicional**

Reemplazar la sección `<Tabs value={stepValue} ...>` completa. La nueva estructura usa renderizado condicional con `{currentStep === N && ...}`:

```tsx
const STEP_LABELS = ["Fecha", "Evaluación", "Resultado"]

// En el return, reemplazar todo el bloque <Tabs> por:
return (
  <div className="max-w-3xl mx-auto">
    <h1 className="text-xl font-bold mb-2 text-[var(--foreground)]">
      Nueva Evaluación
    </h1>
    <p className="text-sm text-[var(--muted-foreground)] mb-5">{patient.name}</p>

    <div aria-live="polite" aria-atomic="true" className="sr-only">
      Paso {currentStep} de 3
    </div>

    <StepIndicator
      steps={STEP_LABELS}
      current={currentStep}
      onBack={(step) => {
        if (step < currentStep) setCurrentStep(step as Step)
      }}
    />

    {currentStep === 1 && <StepFecha />}
    {currentStep === 2 && <StepEvaluacion />}
    {currentStep === 3 && <StepRevision />}
  </div>
)
```

- [ ] **Step 3: Extraer el contenido de Step 1 como función interna `StepFecha`**

```tsx
function StepFecha() {
  return (
    <div className="bg-white rounded-lg p-6 border border-[var(--border)]">
      {/* Card contexto paciente */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[var(--border)]">
        <AvatarInitials name={patient.name} size="md" />
        <div>
          <div className="font-semibold text-[var(--foreground)]">{patient.name}</div>
          <div className="text-xs text-[var(--muted-foreground)]">
            Nacimiento: {new Date(patient.birth_date + "T00:00:00").toLocaleDateString("es-AR")}
          </div>
        </div>
      </div>

      <label className="block mb-4">
        <span className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          Fecha de Evaluación
        </span>
        <input
          type="date"
          value={assessmentDate}
          onChange={(e) => setAssessmentDate(e.target.value)}
          className="px-3 py-2 rounded-md border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)]"
        />
      </label>

      {error && (
        <p className="text-red-600 text-sm mb-4" role="alert">{error}</p>
      )}

      <Button
        onClick={handleCalculateAge}
        disabled={calculateAge.isPending}
        className="w-full bg-[var(--primary-accent)] hover:opacity-90"
      >
        {calculateAge.isPending ? "Calculando..." : "Comenzar Evaluación →"}
      </Button>
    </div>
  )
}
```

Agregar `import { AvatarInitials } from "@/components/ui/AvatarInitials"` al inicio del archivo.

- [ ] **Step 4: Correr tests**

```bash
cd frontend && npm test -- --run
```
Esperado: 113 tests pasan.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/NewAssessmentPage.tsx
git commit -m "Integrar StepIndicator y rediseñar paso 1 del wizard"
```

---

### Task 6: Wizard — Step 2 (acordeones) y Step 3

**Files:**
- Modify: `frontend/src/pages/NewAssessmentPage.tsx`

- [ ] **Step 1: Reemplazar el renderizado de Step 2**

La función `StepEvaluacion` reemplaza el contenido de `<TabsContent value="step-2">`:

```tsx
function StepEvaluacion() {
  const progressPct = pautas.length > 0 ? Math.round((answeredCount / pautas.length) * 100) : 0

  return (
    <div className="space-y-3">
      {/* Progress */}
      <div className="bg-white rounded-lg p-3.5 border border-[var(--border)] flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium text-[var(--muted-foreground)]">
              {answeredCount} / {pautas.length} pautas
            </span>
          </div>
          <Progress
            value={progressPct}
            className="h-2"
            aria-label={`Progreso: ${answeredCount} de ${pautas.length} pautas respondidas`}
          />
        </div>
        <div className="text-2xl font-extrabold text-[var(--primary-accent)] w-12 text-right">
          {progressPct}%
        </div>
      </div>

      {/* Edad */}
      <div className="text-xs text-[var(--muted-foreground)] px-1">
        Edad cronológica: <strong>{chronoAge?.toFixed(2)} años</strong>
        {correctedAge != null && (
          <> · Edad corregida: <strong>{correctedAge.toFixed(2)} años</strong></>
        )}
      </div>

      {/* Pautas por área */}
      {AREAS.map((area) => {
        const areaPautas = pautas.filter((p) => p.area === area)
        if (areaPautas.length === 0) return null
        const areaAnswered = areaPautas.filter((p) => responses[p.id] !== undefined).length
        const areaCompleted = areaAnswered === areaPautas.length
        const areaActive = !areaCompleted && areaPautas.some((p) => responses[p.id] !== undefined)

        return (
          <details
            key={area}
            open={!areaCompleted}
            className={cn(
              "rounded-lg border overflow-hidden",
              areaCompleted && "border-green-200",
              areaActive && "border-[1.5px] border-blue-300",
              !areaCompleted && !areaActive && "border-[var(--border)]"
            )}
          >
            <summary
              className={cn(
                "flex items-center justify-between px-4 py-2.5 cursor-pointer select-none text-sm font-semibold",
                areaCompleted && "bg-green-50 text-green-800",
                areaActive && "bg-blue-50 text-[var(--primary)]",
                !areaCompleted && !areaActive && "bg-white text-[var(--foreground)] opacity-70"
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  areaCompleted && "bg-green-500",
                  areaActive && "bg-[var(--primary-accent)]",
                  !areaCompleted && !areaActive && "bg-slate-300"
                )} />
                {area}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-normal text-xs">
                  {areaAnswered}/{areaPautas.length}
                </span>
                {areaCompleted && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 7l3.5 3.5L12 3" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
            </summary>

            <div className="divide-y divide-[var(--border)] bg-white">
              {areaPautas.map((pauta) => {
                const resp = responses[pauta.id]
                return (
                  <div
                    key={pauta.id}
                    className={cn(
                      "flex items-center justify-between px-4 py-2.5 gap-4",
                      resp === true && "bg-green-50",
                      resp === false && "bg-red-50",
                      resp === undefined && "bg-white"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{pauta.name}</span>
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-semibold",
                          pauta.pauta_type === "A"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        )}>
                          Tipo {pauta.pauta_type}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleResponse(pauta.id, true)}
                        aria-pressed={resp === true}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
                          resp === true
                            ? "bg-green-600 text-white"
                            : "border-2 border-green-600 text-green-700 bg-white hover:bg-green-50"
                        )}
                      >
                        Cumple
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResponse(pauta.id, false)}
                        aria-pressed={resp === false}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
                          resp === false
                            ? "bg-red-600 text-white"
                            : "border-2 border-red-600 text-red-700 bg-white hover:bg-red-50"
                        )}
                      >
                        No cumple
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </details>
        )
      })}

      {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}

      <div className="flex gap-3 pt-1">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>Volver</Button>
        <Button
          onClick={() => setCurrentStep(3)}
          disabled={!allAnswered}
          className="bg-[var(--primary-accent)] hover:opacity-90 text-white"
        >
          Revisar y Enviar
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Actualizar Step 3 (revisión) con colores consistentes**

```tsx
function StepRevision() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-5 border border-[var(--border)]">
        <h2 className="text-base font-semibold mb-4">Resumen de Respuestas</h2>
        {AREAS.map((area) => {
          const areaPautas = pautas.filter((p) => p.area === area)
          if (areaPautas.length === 0) return null
          return (
            <div key={area} className="mb-5">
              <h3 className="font-semibold text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
                {area}
              </h3>
              <div className="space-y-1">
                {areaPautas.map((p) => (
                  <div
                    key={p.id}
                    className={cn(
                      "flex items-center gap-3 text-sm py-1.5 px-2 rounded",
                      responses[p.id] ? "bg-green-50" : "bg-red-50"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-bold min-w-[72px]",
                      responses[p.id] ? "text-green-700" : "text-red-700"
                    )}>
                      {responses[p.id] ? "Cumple" : "No cumple"}
                    </span>
                    <span className="flex-1 text-[var(--foreground)]">{p.name}</span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-semibold",
                      p.pauta_type === "A" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                    )}>
                      Tipo {p.pauta_type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setCurrentStep(2)}>Volver a Editar</Button>
        <Button
          onClick={handleSubmit}
          disabled={createAssessment.isPending}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {createAssessment.isPending ? "Guardando..." : "Confirmar Evaluación"}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Eliminar imports de `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` del archivo**

Estos ya no se usan.

- [ ] **Step 4: Correr tests**

```bash
cd frontend && npm test -- --run
```
Esperado: 113 tests pasan.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/NewAssessmentPage.tsx
git commit -m "Rediseñar wizard — acordeones con feedback visual por color, pasos 2 y 3"
```

---

## Chunk 3: Homepage + PatientList

### Task 7: Homepage — Dashboard con stats

**Files:**
- Modify: `frontend/src/pages/HomePage.tsx`

**⚠️ DESVIACIÓN APROBADA DEL SPEC:** `usePatients()` devuelve `Patient[]` sin assessments (el spec asumía que vendrían incluidos, pero el endpoint `/api/patients` solo devuelve datos básicos). En consecuencia:
- Stat 1 (Total pacientes): implementada con `patients.length` ✓
- Stats 2 y 3 (evaluaciones del mes / tasa de aprobación): reemplazadas por un card informativo que redirige a la ficha de cada paciente
- "Últimas evaluaciones": reemplazado por "Últimos pacientes registrados" (ordenados por ID desc)

Esta divergencia es intencional y aprobada. Si en el futuro se quiere el comportamiento original, agregar un endpoint `/api/stats` en el backend.

- [ ] **Step 1: Reescribir `HomePage.tsx`**

```tsx
import { useMemo } from "react"
import { Link } from "react-router-dom"
import { usePatients } from "../api/patients"
import { Button } from "@/components/ui/button"
import { AvatarInitials } from "@/components/ui/AvatarInitials"
import { SkeletonTable } from "@/components/ui/SkeletonTable"

export default function HomePage() {
  const { data: patients = [], isLoading, isError } = usePatients()

  const recentPatients = useMemo(
    () => [...patients].sort((a, b) => b.id - a.id).slice(0, 5),
    [patients]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Inicio</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
          Prueba Nacional de Pesquisa — Sistema de Evaluación del Desarrollo Infantil
        </p>
      </div>

      {/* Stat: Total pacientes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-[var(--border)] p-4">
          <div className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
            Total Pacientes
          </div>
          {isLoading ? (
            <div className="h-8 w-12 bg-slate-200 animate-pulse rounded" />
          ) : (
            <div className="text-3xl font-extrabold text-[var(--primary)]">{patients.length}</div>
          )}
          <div className="text-xs text-[var(--muted-foreground)] mt-1">registrados</div>
        </div>

        <div className="bg-white rounded-lg border border-[var(--border)] p-4 sm:col-span-2 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-[var(--muted-foreground)]">
              Para ver estadísticas de evaluaciones por mes y tasa de aprobación, accedé al historial de cada paciente.
            </p>
          </div>
          <Button asChild size="sm" className="bg-[var(--primary-accent)] text-white shrink-0">
            <Link to="/patients">Ver Pacientes</Link>
          </Button>
        </div>
      </div>

      {/* Últimos pacientes registrados */}
      <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <span className="text-sm font-bold text-[var(--primary)]">Últimos pacientes registrados</span>
          <Link to="/patients" className="text-xs text-[var(--primary-accent)] font-medium hover:underline">
            Ver todos →
          </Link>
        </div>

        {isLoading && <SkeletonTable columns={2} rows={4} />}

        {isError && (
          <p className="text-sm text-[var(--muted-foreground)] px-4 py-6 text-center">
            No se pudieron cargar los pacientes.
          </p>
        )}

        {!isLoading && !isError && patients.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-[var(--muted-foreground)] mb-3">Todavía no hay pacientes registrados.</p>
            <Button asChild size="sm" className="bg-[var(--primary-accent)] text-white">
              <Link to="/patients/new">Registrar primer paciente</Link>
            </Button>
          </div>
        )}

        {!isLoading && !isError && recentPatients.length > 0 && (
          <ul>
            {recentPatients.map((p) => (
              <li key={p.id} className="border-b border-[var(--border)] last:border-0">
                <Link
                  to={`/patients/${p.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                >
                  <AvatarInitials name={p.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--foreground)] truncate">{p.name}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {new Date(p.birth_date + "T00:00:00").toLocaleDateString("es-AR")}
                      {p.gestational_age_weeks != null && ` · EG: ${p.gestational_age_weeks} sem`}
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300" aria-hidden="true">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round"/>
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Correr tests**

```bash
cd frontend && npm test -- --run
```
Esperado: 113 tests pasan (el test de HomePage testea el render y los links — verificar que sigan funcionando).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/HomePage.tsx
git commit -m "Rediseñar homepage — dashboard con stat de pacientes y lista reciente"
```

---

### Task 8: PatientListPage — avatares y badge de resultado

**Files:**
- Modify: `frontend/src/pages/PatientListPage.tsx`

- [ ] **Step 1: Actualizar el botón "+ Nuevo Paciente"**

Cambiar `size="sm"` y sin variant a `className="bg-[var(--primary-accent)] text-white"`:

```tsx
<Button asChild size="sm" className="bg-[var(--primary-accent)] text-white hover:opacity-90">
  <Link to="/patients/new">+ Nuevo Paciente</Link>
</Button>
```

- [ ] **Step 2: Agregar `AvatarInitials` a cada fila**

Agregar import: `import { AvatarInitials } from "@/components/ui/AvatarInitials"`

En `<TableCell>` del nombre, envolver en flex con el avatar:

```tsx
<TableCell>
  <div className="flex items-center gap-2.5">
    <AvatarInitials name={p.name} size="sm" />
    <div>
      <Link
        to={`/patients/${p.id}`}
        className="font-medium text-[var(--primary-accent)] hover:underline block"
      >
        {p.name}
      </Link>
      <div className="sm:hidden text-xs text-[var(--muted-foreground)] mt-0.5">
        {formatBirthDate(p.birth_date)}
        {p.gestational_age_weeks != null && (
          <> &bull; EG: {p.gestational_age_weeks} sem</>
        )}
      </div>
    </div>
  </div>
</TableCell>
```

- [ ] **Step 3: Correr tests**

```bash
cd frontend && npm test -- --run
```
Esperado: 113 tests pasan.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/PatientListPage.tsx
git commit -m "Agregar avatares y mejorar CTA en lista de pacientes"
```

---

## Chunk 4: AssessmentResult + PatientDetail + ResultSummary

### Task 9: AssessmentResultPage — banner y hitos

**Files:**
- Modify: `frontend/src/pages/AssessmentResultPage.tsx`

- [ ] **Step 1: Reemplazar el banner PASA/NO PASA**

```tsx
{/* Banner */}
<div
  className={cn(
    "rounded-xl border-2 p-6 text-center bg-white",
    passed ? "border-green-500" : "border-slate-400"
  )}
  role="status"
  aria-live="polite"
>
  <div className={cn(
    "w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3",
    passed ? "bg-green-100" : "bg-slate-100"
  )}>
    {passed ? (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ) : (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 9v4M12 17h.01" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="9" stroke="#334155" strokeWidth="2"/>
      </svg>
    )}
  </div>
  <div className={cn(
    "text-4xl font-black mb-2 tracking-tight",
    passed ? "text-green-800" : "text-slate-800"
  )}>
    {passed ? "PASA" : "NO PASA"}
  </div>
  <p className={cn("text-sm", passed ? "text-green-700" : "text-slate-600")}>
    {passed
      ? "El niño aprueba la pesquisa. Se recomienda control en la próxima visita pediátrica."
      : "Se recomienda derivar para evaluación diagnóstica completa del desarrollo."}
  </p>
</div>
```

- [ ] **Step 2: Reemplazar el grid de datos clínicos**

```tsx
<div className="bg-white rounded-lg border border-[var(--border)] p-5">
  <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
    {patient && (
      <div>
        <dt className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-0.5">Paciente</dt>
        <dd className="font-semibold text-[var(--foreground)]">{patient.name}</dd>
      </div>
    )}
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-0.5">Fecha</dt>
      <dd className="font-semibold">
        {new Date(assessment.assessment_date + "T00:00:00").toLocaleDateString("es-AR")}
      </dd>
    </div>
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-0.5">Edad cronológica</dt>
      <dd className="font-semibold">{assessment.chronological_age.toFixed(2)} años</dd>
    </div>
    {assessment.corrected_age != null && (
      <div>
        <dt className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-0.5">Edad corregida</dt>
        <dd className="font-semibold">{assessment.corrected_age.toFixed(2)} años</dd>
      </div>
    )}
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-0.5">Pautas evaluadas</dt>
      <dd className="font-semibold">{assessment.items.length}</dd>
    </div>
  </dl>
</div>
```

- [ ] **Step 3: Agregar sección de hitos no alcanzados (solo si NO PASA)**

Insertar entre el grid de datos y `<ResultSummary>`:

```tsx
{!passed && (
  <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
    <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-slate-500" />
        <span className="text-sm font-bold text-[var(--foreground)]">Hitos no alcanzados</span>
      </div>
      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
        {assessment.items.filter(i => !i.passed).length} falla{assessment.items.filter(i => !i.passed).length !== 1 ? "s" : ""}
      </span>
    </div>
    <div className="divide-y divide-[var(--border)]">
      {assessment.items
        .filter(i => !i.passed)
        .map(item => (
          <div key={item.id} className="flex items-start gap-3 px-4 py-3">
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0 mt-0.5",
              item.pauta_type === "A" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
            )}>
              Tipo {item.pauta_type}
            </span>
            <div>
              <div className="text-sm font-medium text-[var(--foreground)]">{item.pauta_name}</div>
              <div className="text-xs text-[var(--muted-foreground)]">{item.area}</div>
            </div>
          </div>
        ))}
    </div>
  </div>
)}
```

- [ ] **Step 4: Actualizar los CTAs**

```tsx
<div className="flex gap-3 flex-wrap">
  <Button
    onClick={() => window.print()}
    variant="outline"
  >
    Imprimir
  </Button>
  {patient && (
    <Button
      onClick={handleDownloadPDF}
      className="bg-[var(--primary)] text-white hover:opacity-90"
    >
      Descargar PDF
    </Button>
  )}
</div>
```

- [ ] **Step 5: Correr tests**

```bash
cd frontend && npm test -- --run
```
Esperado: 113 tests pasan.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/AssessmentResultPage.tsx
git commit -m "Rediseñar resultado — banner neutral para NO PASA, hitos fallados, grid clínico"
```

---

### Task 10: PatientDetailPage — header y historial

**Files:**
- Modify: `frontend/src/pages/PatientDetailPage.tsx`

- [ ] **Step 1: Mejorar el header card del paciente**

Reemplazar la sección de header existente:

```tsx
<div className="bg-white rounded-lg border border-[var(--border)] p-5">
  <div className="flex items-start gap-4">
    <AvatarInitials name={patient.name} size="lg" />
    <div className="flex-1 min-w-0">
      <h1 className="text-xl font-bold truncate text-[var(--foreground)]">{patient.name}</h1>
      <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{age}</p>
    </div>
    <Button asChild variant="outline" size="sm" className="shrink-0">
      <Link to={`/patients/${patient.id}/edit`}>Editar</Link>
    </Button>
  </div>
  <div className="grid grid-cols-2 gap-3 mt-4">
    <div className="bg-slate-50 rounded-md p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-0.5">Nacimiento</div>
      <div className="text-sm font-semibold text-[var(--primary)]">
        {new Date(patient.birth_date + "T00:00:00").toLocaleDateString("es-AR")}
      </div>
    </div>
    <div className="bg-slate-50 rounded-md p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-0.5">Edad Gestacional</div>
      <div className="text-sm font-semibold text-[var(--primary)]">
        {patient.gestational_age_weeks ? `${patient.gestational_age_weeks} semanas` : "Término"}
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Actualizar badges de resultado en la tabla de evaluaciones**

En la columna "Resultado", reemplazar:

```tsx
<Badge
  className={cn(
    "text-xs font-bold rounded-full border-0",
    a.result === "PASA"
      ? "bg-green-100 text-green-800"
      : "bg-slate-100 text-slate-700"
  )}
>
  {a.result === "PASA" ? "PASA" : "NO PASA"}
</Badge>
```

- [ ] **Step 3: Hacer las filas de evaluación clickeables**

Envolver el contenido de cada `<TableRow>` en un `<Link>` o agregar `onClick` a la fila:

```tsx
<TableRow
  key={a.id}
  className="cursor-pointer hover:bg-slate-50"
  onClick={() => navigate(`/assessments/${a.id}`)}
>
```

Agregar `import { useNavigate } from "react-router-dom"` y `const navigate = useNavigate()` al inicio del componente.

- [ ] **Step 4: Correr tests**

```bash
cd frontend && npm test -- --run
```
Esperado: 113 tests pasan.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/PatientDetailPage.tsx
git commit -m "Mejorar ficha de paciente — header con datos en grid, filas clickeables"
```

---

### Task 11: ResultSummary — alinear colores

**Files:**
- Modify: `frontend/src/components/ResultSummary.tsx`

El archivo actual usa `style={{}}` inline con colores hardcodeados. Reemplazar el componente completo migrando a Tailwind y el nuevo sistema de colores:

- [ ] **Step 1: Reemplazar `ResultSummary.tsx` completo**

```tsx
import type { Assessment } from "../types"
import { cn } from "@/lib/utils"

interface Props {
  assessment: Assessment
}

export default function ResultSummary({ assessment }: Props) {
  const passed = assessment.result === "PASA"
  const failedItems = assessment.items.filter((i) => !i.passed)
  const typeAFailures = failedItems.filter((i) => i.pauta_type === "A")
  const typeBFailures = failedItems.filter((i) => i.pauta_type === "B")

  if (passed || failedItems.length === 0) return null

  return (
    <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <span className="text-sm font-semibold text-[var(--foreground)]">Detalle de fallas</span>
      </div>
      <div className="p-4 space-y-4 text-sm">
        {typeAFailures.length > 0 && (
          <div>
            <p className="font-semibold text-slate-700 mb-1.5">
              Fallas Tipo A <span className="text-xs text-[var(--muted-foreground)] font-normal">(por encima de P90)</span>
            </p>
            <ul className="space-y-1">
              {typeAFailures.map((i) => (
                <li key={i.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  <span className="text-[var(--foreground)]">{i.pauta_name}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">({i.area})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {typeBFailures.length > 0 && (
          <div>
            <p className="font-semibold text-slate-700 mb-1.5">
              Fallas Tipo B <span className="text-xs text-[var(--muted-foreground)] font-normal">(entre P75-P90)</span>
            </p>
            <ul className="space-y-1">
              {typeBFailures.map((i) => (
                <li key={i.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                  <span className="text-[var(--foreground)]">{i.pauta_name}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">({i.area})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Nota:** El componente ahora retorna `null` si el resultado es PASA o no hay fallas, ya que `AssessmentResultPage` maneja el banner principal. Esto es correcto — los tests de `ResultSummary` testean el listado de fallas.

- [ ] **Step 2: Correr todos los tests finales**

```bash
cd frontend && npm test -- --run
```
Esperado: todos los tests pasan (113 mínimo).

- [ ] **Step 4: Verificar TypeScript**

```bash
cd frontend && npx tsc --noEmit
```
Esperado: 0 errores.

- [ ] **Step 5: Commit final**

```bash
git add frontend/src/components/ResultSummary.tsx
git commit -m "Alinear ResultSummary al sistema de colores rediseñado"
```

---

## Verificación final

- [ ] Levantar el servidor de desarrollo: `cd frontend && npm run dev`
- [ ] Navegar por el flujo completo: Inicio → Lista pacientes → Ficha → Nueva evaluación (los 3 pasos) → Resultado
- [ ] Verificar que el sidebar activo cambia al navegar
- [ ] Verificar que el breadcrumb del topbar muestra la página correcta en desktop
- [ ] Verificar que NO PASA aparece en gris (no rojo)
- [ ] Verificar que áreas completadas se colapsan en el wizard
- [ ] Build de producción sin errores: `cd frontend && npm run build`
