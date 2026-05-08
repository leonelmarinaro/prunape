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
| Color NO PASA | `#475569` (slate-600) — gris neutro |
| Navegación | Sidebar completo con iconos + texto |
| Áreas a mejorar | Todas (home, wizard, pacientes, resultado) |

---

## 1. Design Tokens (`frontend/src/index.css`)

Reemplazar variables CSS actuales por:

```css
--primary:           #1e3a5f;   /* Azul Garrahan */
--primary-accent:    #2563eb;   /* blue-600 — botones, activos */
--primary-foreground:#ffffff;
--success:           #16a34a;   /* PASA */
--success-foreground:#ffffff;
--warning:           #475569;   /* NO PASA — gris, sin alarma */
--warning-foreground:#ffffff;
--background:        #f1f5f9;   /* fondo app */
--surface:           #ffffff;   /* fondo cards */
--foreground:        #0f172a;   /* texto principal */
--muted:             #f8fafc;
--muted-foreground:  #64748b;
--border:            #e2e8f0;
--radius:            0.5rem;
```

---

## 2. Sidebar (`frontend/src/App.tsx` — componente `Sidebar`)

### Estructura visual
- **Logo area**: ícono SVG (gota/pediatría) + "PRUNAPE" bold + subtítulo "Hospital Garrahan" en muted
- **Nav items**: ícono SVG (16px) + label, gap-10
- **Active state**: `border-left: 3px solid #2563eb` + `background: #eff6ff` + texto `#1e3a5f` bold
- **Inactive state**: ícono y texto en `#64748b`, hover `bg-slate-50`
- **Footer**: avatar de iniciales del usuario (desde Clerk `fullName`) + nombre + rol + menú contextual (tres puntos)

### Íconos a agregar
- Inicio → `<Home />` de lucide-react
- Pacientes → `<Users />` de lucide-react

### Topbar
- Reemplazar el logo mobile por **breadcrumb**: `PRUNAPE / {página actual}` en texto muted/bold
- Agregar botón **"+ Nueva Evaluación"** (azul, primario) a la derecha del topbar — siempre visible

---

## 3. Homepage — Dashboard (`frontend/src/pages/HomePage.tsx`)

Reemplazar las 3 info-cards estáticas por:

### Stats row (3 cards)
Datos reales desde la API existente:
1. **Total Pacientes** — `GET /api/patients` → `count`
2. **Evaluaciones este mes** — conteo de assessments del mes actual
3. **Tasa de Aprobación** — `% PASA` sobre últimas 30 evaluaciones

Cada stat card: label uppercase pequeño + número grande bold (`#1e3a5f`) + descripción muted.  
La tasa de aprobación usa `#16a34a` (verde) para el número.

### Últimas evaluaciones (lista)
Card blanca con header "Últimas evaluaciones" + link "Ver todos →".  
Cada fila: avatar iniciales + nombre + edad + fecha relativa + badge PASA/NO PASA.  
Badge PASA: `bg-dcfce7 text-15803d`. Badge NO PASA: `bg-f1f5f9 text-475569`.

**Nota de implementación**: los datos de stats se pueden derivar del hook `usePatients()` existente y un nuevo hook `useRecentAssessments()`. Si el cálculo de stats resulta costoso en frontend, se puede diferir a v2 con endpoint dedicado.

---

## 4. Wizard de Evaluación (`frontend/src/pages/NewAssessmentPage.tsx`)

### Step indicator
Reemplazar `<Tabs>` por un componente `<StepIndicator>` custom:
- Círculo numerado (32px): completado = `bg-green-600` + check SVG, activo = `bg-blue-600` + número, pendiente = `bg-slate-200` + número gris
- Línea conectora entre pasos: verde cuando el paso anterior está completo, gris sino
- Label debajo de cada círculo

### Paso 1
- Mostrar card del paciente arriba (avatar + nombre + fecha de nacimiento) para contexto
- Input de fecha con label claro
- Card de "Edad cronológica calculada" en azul suave (`bg-eff6ff border-l-2563eb`) una vez calculada
- CTA "Comenzar Evaluación →" full-width

### Paso 2 — Evaluación de pautas
**Progress bar mejorada**: número grande (%) a la derecha + "X / Y pautas" a la izquierda.

**Acordeones por área rediseñados**:
- **Área completada**: header `bg-green-50 border-green-100`, punto verde, contador "4/4" + check → colapsada automáticamente
- **Área activa**: `border-1.5 border-blue-300 bg-blue-50` — visualmente separada
- **Área pendiente**: gris, colapsada, opacidad reducida

**Filas de pauta**:
- Sin responder: botones con borde de color (`border-2 border-green-600` / `border-2 border-red-600`), fondo blanco
- Respondida Cumple: fondo `bg-green-50`, botón "Cumple" relleno verde, botón "No cumple" gris plano
- Respondida No Cumple: fondo `bg-red-50`, botón "No cumple" relleno rojo, botón "Cumple" gris plano
- Badge Tipo A: `bg-red-100 text-red-800`. Badge Tipo B: `bg-yellow-100 text-yellow-800`

### Paso 3 — Revisión
Mantener estructura actual pero con el mismo sistema de colores: filas verdes/rojas según respuesta.

---

## 5. Resultado de Evaluación (`frontend/src/pages/AssessmentResultPage.tsx`)

### Banner principal
Card con borde de color (2px), ícono circular de 52px, texto grande, descripción:

**PASA**: borde `#16a34a`, fondo ícono `bg-green-100`, ícono checkmark SVG verde, título `text-green-800`.  
**NO PASA**: borde `#475569`, fondo ícono `bg-slate-100`, ícono alerta SVG gris, título `text-slate-800`.

### Grid de datos clínicos
`grid-cols-2 sm:grid-cols-4` con: Paciente, Fecha, Edad Cronológica, Pautas evaluadas.  
Cada celda: label muted uppercase + valor bold.

### Hitos no alcanzados (solo si NO PASA)
Card con header "Hitos no alcanzados" + badge con conteo de fallas.  
Cada fila: badge Tipo (A/B) + nombre de la pauta + área + percentil.  
Sin este listado, el médico no puede comunicar el resultado a los padres con precisión.

### CTAs
- Primario: "Descargar PDF" — `bg-primary` (azul Garrahan)
- Secundario: "Imprimir" — outline
- Terciario: link "← Volver al paciente" arriba (breadcrumb)

---

## 6. Ficha de Paciente (`frontend/src/pages/PatientDetailPage.tsx`)

### Header
Card blanca: avatar iniciales (40px, `bg-blue-100`) + nombre bold + edad en muted + EG.  
Info clínica en grid `2x2`: Nacimiento, EG, (espacio para futuras métricas).  
Botón "Editar" outline a la derecha.

### Historial de evaluaciones
Card con header "Historial" + botón "+ Nueva" (azul, pequeño).  
Cada fila: fecha + edad al momento + badge resultado + chevron →.  
Badge PASA: pill verde. Badge NO PASA: pill gris (`bg-slate-100 text-slate-700`).  
Click en fila → navega a `/assessments/:id`.

---

## 7. Lista de Pacientes (`frontend/src/pages/PatientListPage.tsx`)

Cambios menores:
- Agregar avatar de iniciales a cada fila de la tabla
- Mostrar badge del último resultado inline (si existe)
- Barra de búsqueda full-width en mobile, `max-w-sm` en desktop
- Botón "+ Nuevo Paciente" como acción primaria azul (no outline)

---

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `frontend/src/index.css` | Reemplazar design tokens |
| `frontend/src/App.tsx` | Sidebar + Topbar rediseñados |
| `frontend/src/pages/HomePage.tsx` | Dashboard con stats + últimas evaluaciones |
| `frontend/src/pages/NewAssessmentPage.tsx` | Step indicator + acordeones rediseñados |
| `frontend/src/pages/AssessmentResultPage.tsx` | Banner + grid clínico + hitos fallados |
| `frontend/src/pages/PatientDetailPage.tsx` | Header mejorado + historial con badges |
| `frontend/src/pages/PatientListPage.tsx` | Avatares + badge último resultado |
| `frontend/src/components/ui/` | Posible `StepIndicator.tsx` nuevo |

---

## Restricciones

- No modificar lógica de negocio ni hooks de API existentes
- Mantener todos los tests actuales pasando (109 tests)
- No romper accesibilidad existente (aria-live, aria-label, roles)
- TypeScript strict — sin errores nuevos
- El componente `PautaCard.tsx` puede quedar sin uso (la lógica pasó a `NewAssessmentPage`) — no eliminarlo hasta confirmar
