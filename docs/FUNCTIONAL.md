# Documentación Funcional - PRUNAPE

## ¿Qué es PRUNAPE?

PRUNAPE es la **Prueba Nacional de Pesquisa**, un instrumento de evaluación del desarrollo psicomotor en niños de 0 a 6 años desarrollado por el Hospital Garrahan de Buenos Aires, Argentina.

La pesquisa (detección) es el primer paso en la identificación de niños con posible retraso del desarrollo. PRUNAPE permite a profesionales de salud (pediatras, enfermeros, promotores de salud) realizar evaluaciones rápidas y sistemáticas en centros de atención primaria, guarderías y terreno.

**Propósito:** Identificar niños que probablemente requieran evaluación especializada por un neurólogo del desarrollo o pediatra especialista.

**Ámbito de uso:**
- Centros de atención primaria (CAPS)
- Guarderías y jardines de infantes
- Hospitales públicos
- Campañas de salud

**No es un diagnóstico.** PRUNAPE es una herramienta de pesquisa; un resultado NO_PASA requiere confirmación con evaluaciones especializadas.

## Los 4 Áreas del Desarrollo

PRUNAPE evalúa el desarrollo en 4 áreas. Cada área tiene entre 18 y 23 hitos (milestones) que representen logros clave del desarrollo:

### 1. Personal Social (P.Social) - 18 hitos

Capacidad de interacción social, autonomía y comportamiento adaptativo.

**Hitos ejemplares:**
- Sonríe (0-3 meses)
- Interactúa con juguetes (3-6 meses)
- Juega con pares (12-18 meses)
- Se viste solo (3-4 años)
- Controla esfínter (2-3 años)

### 2. Motor Fino - 19 hitos

Coordinación y precisión de movimientos de manos y dedos.

**Hitos ejemplares:**
- Sigue objetos con la vista (0-3 meses)
- Toma objeto entre dedo pulgar e índice (6-9 meses)
- Pasa páginas de un libro (12-15 meses)
- Dibuja líneas y círculos (2-3 años)
- Copia letras (4-5 años)

### 3. Lenguaje - 19 hitos

Comprensión y expresión del lenguaje verbal.

**Hitos ejemplares:**
- Vocaliza (0-3 meses)
- Dice "mamá" o "papá" (6-9 meses)
- Señala y dice palabras (12-15 meses)
- Frases de 2-3 palabras (18-24 meses)
- Lenguaje claro y comprensible (3-4 años)

### 4. Motor Grueso - 23 hitos

Control del tono, equilibrio y movimientos del cuerpo entero.

**Hitos ejemplares:**
- Levanta la cabeza (0-3 meses)
- Se sienta sin apoyo (6 meses)
- Se para sin apoyo (12 meses)
- Camina sin ayuda (12-15 meses)
- Corre y salta (2-3 años)

## Conceptos Clave: Percentiles P75 y P90

Cada hito tiene dos valores percentilares clave:

### P75 (Percentil 75)

Edad a la que el 75% de los niños normales logran el hito.

**Ejemplo:** Si P75 del hito "Señala" es 1.0 año, significa que a los 12 meses, el 75% de los niños normales ya señalan.

### P90 (Percentil 90)

Edad a la que el 90% de los niños normales logran el hito.

**Ejemplo:** Si P90 del hito "Señala" es 1.5 años, significa que a los 18 meses, el 90% de los niños normales ya señalan.

### Interpretación

```
Edad del niño:         0.5 años (6 meses)

Hito "Señala":
- P75: 1.0 años       (75% logran a los 12 meses)
- P90: 1.5 años       (90% logran a los 18 meses)

A los 6 meses:
- No ha llegado a P75 aún ✓
- Aún hay tiempo normal para desarrollar este hito

Edad del niño:         1.2 años (14.4 meses)

Hito "Señala":
- P75: 1.0 años       (75% logran a los 12 meses)
- P90: 1.5 años       (90% logran a los 18 meses)

A los 14.4 meses:
- Ya pasó P75 pero no P90 ⚠
- En zona de riesgo (entre 75% y 90%)
```

## Clasificación de Hitos: Tipo A vs Tipo B

Basado en los percentiles, cada hito se clasifica como Tipo A o Tipo B:

### Tipo A (Crítico)

Edad actual del niño **> P90**

Significa que el 90% de los niños ya deberían haber logrado este hito. Si el niño no lo ha logrado, es indicador de retraso.

**Riesgo:** Crítico/Severo

**Ejemplo:**
```
Hito "Señala" - P90: 1.5 años
Niño evaluado a los 2.0 años

Edad > P90 → Tipo A
Si el niño no señala → Riesgo crítico
```

### Tipo B (En Riesgo)

P75 ≤ Edad actual ≤ P90

Significa que el niño está en la "ventana de riesgo". El hito debería estar emergiendo o a punto de lograrse.

**Riesgo:** Moderado/En desarrollo

**Ejemplo:**
```
Hito "Señala" - P75: 1.0 años, P90: 1.5 años
Niño evaluado a los 1.2 años

1.0 ≤ 1.2 ≤ 1.5 → Tipo B
Si el niño no señala → En riesgo, requiere monitoreo
```

### Tipo C (No Aplicable - No aparece en evaluación)

Edad actual < P75

El hito aún no es aplicable para este niño. Se omite de la evaluación.

**Ejemplo:**
```
Hito "Señala" - P75: 1.0 años
Niño evaluado a los 0.5 años

0.5 < 1.0 → No aplicable, no se evalúa
```

## Algoritmo de Evaluación: PASA vs NO_PASA

El resultado final de una evaluación es **PASA** o **NO_PASA**, calculado según estas reglas:

### Regla 1: Type A Failures

```
Si existe 1 o más hitos Type A con resultado FALLA (passed=False)
→ Resultado final: NO_PASA
```

**Razonamiento:** Un hito Type A no logrado indica retraso severo (probablemente > 12 meses de atraso). Requiere evaluación especializada inmediata.

### Regla 2: Type B Failures

```
Si existen 2 o más hitos Type B con resultado FALLA
→ Resultado final: NO_PASA
```

**Razonamiento:** 2+ hitos en riesgo sugieren tendencia de retraso. Requiere monitoreo o evaluación especializada.

### Regla 3: PASA

```
Si (Type A failures < 1) AND (Type B failures < 2)
→ Resultado final: PASA
```

Significa que el desarrollo está dentro de los parámetros normales esperados.

### Ejemplo de Cálculo

```
Evaluación de niño 18 meses:

Hitos aplicables (P75 ≤ 1.5 años ≤ P90):
1. Señala (Type B) - PASA ✓
2. Dice 2 palabras (Type B) - FALLA ✗
3. Se para sin apoyo (Type A) - PASA ✓
4. Controla esfínter (Type B) - FALLA ✗

Conteos:
- Type A FALLA: 0
- Type B FALLA: 2

Evaluación:
- Type A failures (0) < 1 → OK
- Type B failures (2) >= 2 → NO_PASA

Resultado: NO_PASA
Interpretación: Requiere monitoreo o evaluación especializada por 2 fallos en hitos en riesgo.
```

## Corrección por Prematuridad

Para niños nacidos antes de las 37 semanas de gestación y menores de 2 años, se aplica una corrección de edad.

### Justificación

Los niños prematuros necesitan "tiempo de catch-up" para alcanzar el desarrollo de niños nacidos a término. Sin corrección, parecería que están retrasados cuando en realidad están en desarrollo normal.

### Fórmula

```
correction_weeks = 40 - gestational_age_weeks
correction_years = correction_weeks / 52

corrected_age = chronological_age - correction_years
```

### Ejemplos

**Ejemplo 1: Prematuro moderado**
```
Nacimiento: 34 semanas (6 semanas antes de término)
Cronológico: 6 meses (0.5 años)
Gestacional: 34 semanas

Cálculo:
correction_weeks = 40 - 34 = 6 semanas
correction_years = 6 / 52 = 0.115 años ≈ 1.4 meses

Edad corregida = 0.5 - 0.115 = 0.385 años ≈ 4.6 meses

Interpretación:
- A nivel cronológico parece tener 6 meses
- Pero con corrección por prematuridad, está más cerca de 4.6 meses
- Hitos aplicables se seleccionan usando edad corregida
```

**Ejemplo 2: Prematuro severo**
```
Nacimiento: 28 semanas (12 semanas antes de término)
Cronológico: 6 meses (0.5 años)
Gestacional: 28 semanas

Cálculo:
correction_weeks = 40 - 28 = 12 semanas
correction_years = 12 / 52 = 0.231 años ≈ 2.8 meses

Edad corregida = 0.5 - 0.231 = 0.269 años ≈ 3.2 meses

Interpretación:
- A nivel cronológico parece tener 6 meses
- Con corrección está más cerca de 3.2 meses
- Diferencia significativa: casi 3 meses
```

### Aplicación en PRUNAPE

1. Al crear evaluación:
   - Usuario ingresa fecha nacimiento e (opcionalmente) semanas de gestación
   - Sistema calcula edad cronológica E corregida
   - **Se utiliza edad corregida para seleccionar hitos aplicables**

2. Todos los hitos Type A y B se basan en la **edad corregida**

3. La corrección se aplica solo mientras edad cronológica < 2 años
   - A partir de los 2 años, se usa edad cronológica
   - Razón: El efecto del nacimiento prematuro se normaliza

## Tipos de Hitos

Los 79 hitos de PRUNAPE se clasifican también por tipo de evaluación:

### Prueba (Test directo)

El evaluador realiza una prueba directa con el niño para verificar el logro.

**Ejemplos:**
- "Señala objetos" - Evaluador muestra objetos y observa si señala
- "Copia un círculo" - Evaluador pide dibujar un círculo
- "Se para sin apoyo" - Evaluador observa si el niño se para

**Ventaja:** Mayor objetividad

### Pregunta (Informe de padre/cuidador)

El evaluador pregunta al padre o cuidador si el niño ha logrado el hito.

**Ejemplos:**
- "¿Come solo con cuchara?"
- "¿Controla la orina durante el día?"
- "¿Dice palabras con sentido?"

**Ventaja:** Evalúa comportamientos en contexto natural

### Prueba Demostrada (Demostración)

El evaluador demuestra el hito primero, luego el niño intenta imitarlo.

**Ejemplos:**
- "Tira un objeto intencionalmente" - Evaluador tira, niño intenta
- "Apila bloques" - Evaluador apila 2-3 bloques, niño intenta

**Ventaja:** Combina directividad con contexto

## Interpretación Clínica de Resultados

### Resultado: PASA

Significa que el desarrollo psicomotor del niño está acorde a su edad.

**Acciones:**
- ✓ Desarrollo normal
- Continuar control periódico según protocolos de APS
- Sin referencia a especialista en este momento

**Seguimiento:** Control a los 6-12 meses dependiendo de la edad

### Resultado: NO_PASA

Significa que existen indicadores de posible retraso del desarrollo.

**Acciones:**
- ⚠ Requiere evaluación especializada
- Derivar a neurología pediátrica o pediatra especialista
- No es un diagnóstico, es indicador de riesgo
- Importante: comunicar al padre/cuidador en forma comprensible y no alarmista

**Plazo:** Evaluación especializada dentro de 2-4 semanas

**Posibles diagnósticos a explorar:**
- Parálisis cerebral
- Retraso global del desarrollo
- Trastornos específicos del lenguaje
- Autismo (si hay señales de interacción social)
- Causas ambientales/sociales (falta de estimulación, etc.)

## Limitaciones de PRUNAPE

- No diagnostica condiciones específicas
- No valida para niños con parálisis cerebral severa (no se pueden evaluar motricidad)
- No reemplaza evaluación especializada completa
- Sensible a factores ambientales (estrés, hambre, enfermedad aguda)
- Validada para población argentina

## Workflow Clínico Estándar

```
1. CONTROL PERIÓDICO
   ↓
2. PESQUISA CON PRUNAPE
   ├─ Si PASA → Continuar control normal
   └─ Si NO_PASA → Derivar a especialista
   ↓
3. EVALUACIÓN ESPECIALIZADA
   (Neurólogo/Pediatra especialista)
   ├─ Confirmación diagnóstica
   ├─ Etiología
   └─ Plan de tratamiento/estimulación
```

## Entrada de Datos

### Al Crear Paciente

```
Nombre: (Requerido)
Fecha de nacimiento: (Requerido)
Semanas de gestación: (Opcional - si fue prematuro)
  - Si es prematuro: 22-36 semanas
  - Si es a término: dejar vacío o ≥37 semanas
```

### Al Realizar Evaluación

```
Paciente: (Seleccionar de lista)
Fecha de evaluación: (Hoy o anterior)
  - Sistema calcula edad cronológica automáticamente
  - Si paciente es prematuro: calcula edad corregida

Evaluación de hitos:
Para cada hito aplicable:
  - Nombre del hito
  - Área (P.Social, Motor Fino, Lenguaje, Motor Grueso)
  - Tipo (Prueba, Pregunta, Prueba Demostrada)
  - Tipo de clasificación (A o B)
  - Botón: PASA / NO PASA
```

## Reporte de Resultados

Un reporte típico contiene:

```
PESQUISA DE DESARROLLO PSICOMOTOR
Instrumento: PRUNAPE

Paciente: [Nombre]
Fecha de evaluación: [Fecha]
Edad cronológica: [n.nn años]
Edad corregida: [n.nn años] (si aplica)

RESULTADO: PASA / NO_PASA

Hallazgos:
- Hitos evaluados: [número]
- Hitos logrados: [número]
- Fallas Tipo A: [número]
- Fallas Tipo B: [número]

Recomendaciones:
[Según resultado]

Evaluador: [Nombre]
Profesión: [Profesión]
```

## Referencias

- PRUNAPE es una adaptación local de instrumentos internacionales de pesquisa (como Denver II)
- Desarrollada por Hospital Garrahan en colaboración con profesionales de toda Argentina
- Validada en población pediátrica argentina
- Basada en hitos del desarrollo normativo

## Actualización de Datos

- Los 79 hitos y sus percentiles P75/P90 se almacenan en `percentiles.py`
- Si se actualiza PRUNAPE a nivel nacional, estos datos pueden cambiar
- Procedimiento: Actualizar tabla de hitos en base de datos + migración
