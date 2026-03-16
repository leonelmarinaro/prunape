# Guía de Usuario - PRUNAPE

Bienvenido a la aplicación PRUNAPE. Esta guía te mostrará paso a paso cómo usar la herramienta para evaluar el desarrollo psicomotor de niños.

## Requisitos Previos

- Acceso a la aplicación web (URL proporcionada por tu institución)
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Información básica del niño (nombre, fecha nacimiento)
- Conocimiento de los hitos del desarrollo (ver sección "Preparación para la Evaluación")

## Preparación para la Evaluación

Antes de realizar una evaluación, es recomendable:

1. **Revisar los hitos relevantes** para la edad del niño
2. **Ambiente tranquilo** - Evaluar en lugar sin distracciones
3. **Relación de confianza** - El niño debe estar cómodo y disponible
4. **Padre/cuidador presente** - Para responder preguntas sobre comportamientos en casa
5. **Información completa** - Tener disponible:
   - Fecha de nacimiento exacta
   - Semanas de gestación (si fue prematuro)
   - Historial de desarrollo relevante

## Flujo General de la Aplicación

```
INICIO
  ↓
CREAR PACIENTE (una sola vez por niño)
  ↓
CREAR EVALUACIÓN
  ├─ PASO 1: Ingresa fecha de evaluación
  ├─ PASO 2: Evalúa cada hito (PASA/NO PASA)
  └─ PASO 3: Ve el resultado (PASA/NO_PASA)
  ↓
VER HISTORIAL (múltiples evaluaciones)
  ↓
TOMAR DECISIONES CLÍNICAS
```

## Paso a Paso: Crear un Paciente

### Acceder a la Pantalla de Creación

1. Haz clic en el botón "Crear Paciente" o navega a `/patients/new`
2. Verás un formulario con los siguientes campos

### Completar el Formulario

#### Campo: Nombre (Requerido)

```
Ingresa el nombre completo del niño

Ejemplo: Juan Carlos López García

Consejos:
- Nombres y apellidos completos para identificación única
- Útil para búsqueda posterior
```

#### Campo: Fecha de Nacimiento (Requerido)

```
Ingresa la fecha de nacimiento exacta

Ejemplo: 15/03/2023

Formato: DD/MM/AAAA

Consejos:
- Ser exacto en la fecha
- Si no tienes la fecha exacta, consultar con padre/cuidador
- Afecta cálculo de edad para evaluaciones
```

#### Campo: Semanas de Gestación (Opcional)

```
Ingresa solo si el niño fue prematuro

Ejemplo: 34

Rango: 22-36 semanas (nacimiento antes de 37 semanas = prematuro)

Consejos:
- Dejar vacío si fue nacimiento a término (≥37 semanas)
- Esencial para corrección de edad en menores de 2 años
- Preguntar al padre/cuidador si no tiene historial
- Afecta la selección de hitos a evaluar
```

### Guardar el Paciente

1. Haz clic en el botón "Guardar Paciente"
2. La aplicación mostrará un mensaje de confirmación
3. Serás redirigido a la página de detalle del paciente

**Nota:** El paciente solo se crea una vez. Luego puedes realizar múltiples evaluaciones.

---

## Paso a Paso: Realizar una Evaluación

### 1. Acceder al Paciente

Hay dos formas:

**Opción A: Desde lista de pacientes**
1. Haz clic en "Ver Pacientes" en la página de inicio
2. Busca el paciente por nombre (usa el buscador)
3. Haz clic en el nombre del paciente

**Opción B: Búsqueda rápida**
- Usa la barra de búsqueda en la página de inicio
- Selecciona el paciente de los resultados

### 2. Iniciar Nueva Evaluación

En la página de detalle del paciente:

1. Verás un botón "Nueva Evaluación"
2. Haz clic en ese botón
3. Se abrirá el wizard de 3 pasos

### PASO 1: Selecciona Fecha de Evaluación

**Pantalla: Selección de Fecha**

```
Fecha de evaluación: [selector de fecha]
```

**Qué hace:**
- El sistema calcula automáticamente la edad del niño
- Si el niño es prematuro, calcula edad corregida
- Determina qué hitos son aplicables (Type A o Type B)

**Cómo proceder:**

1. Selecciona la fecha en el calendario
   - Por defecto es hoy
   - Puedes seleccionar fecha anterior si necesitas registrar evaluación pasada

2. Haz clic en "Siguiente" o "Continuar"

**Ejemplo:**

```
Paciente: Juan Carlos López García
Nacimiento: 15/03/2023
Gestacional: 34 semanas
Fecha evaluación: 15/09/2023 (6 meses cronológicos)

Sistema calcula:
- Edad cronológica: 0.5 años (6 meses)
- Edad corregida: 0.385 años (4.6 meses)
- Hitos aplicables: Aquellos con P75 entre 0.385 y 0.5 años
```

### PASO 2: Evalúa los Hitos

**Pantalla: Grid de Hitos**

Verás una serie de tarjetas, cada una representa un hito del desarrollo.

```
┌─────────────────────────────────────┐
│ HITO: Señala objetos                │
│ ÁREA: Lenguaje                      │
│ TIPO: Prueba                        │
│ CLASIFICACIÓN: Type B (En riesgo)   │
├─────────────────────────────────────┤
│ [PASA]  [NO PASA]                   │
└─────────────────────────────────────┘
```

**Cómo evaluar:**

Para cada hito:

1. **Lee el nombre del hito** - Describe qué debe lograr el niño

2. **Revisa qué tipo de evaluación es:**
   - **Prueba**: Realiza prueba directa con el niño
   - **Pregunta**: Pregunta al padre/cuidador
   - **Prueba Demostrada**: Demuestra primero, luego observa al niño

3. **Realiza la evaluación según el tipo**

4. **Haz clic en PASA o NO PASA según resultado**

5. **Continúa con el siguiente hito**

### Ejemplos de Evaluación

**Ejemplo 1: Prueba directa**

```
HITO: Copia un círculo
TIPO: Prueba

Cómo evaluar:
1. Dibuja un círculo simple en papel
2. Pídele al niño: "Copia esto, haz un círculo como el mío"
3. Observa si el resultado es reconocible como círculo
   - PASA: Dibuja un círculo (no tiene que ser perfecto)
   - NO PASA: Dibuja líneas al azar, no intenta círculo
```

**Ejemplo 2: Pregunta a cuidador**

```
HITO: Come solo con cuchara
TIPO: Pregunta

Cómo evaluar:
1. Pregunta al padre/cuidador:
   "¿Tu hijo come solo con cuchara durante las comidas?"
2. Escucha la respuesta
   - PASA: Sí, come solo la mayoría de las veces
   - NO PASA: No, aún necesita ayuda
```

**Ejemplo 3: Prueba demostrada**

```
HITO: Apila 2-3 bloques
TIPO: Prueba Demostrada

Cómo evaluar:
1. Coloca 3 bloques en la mesa
2. Demuestra: Apila 2 bloques lentamente
3. Di: "Ahora haz tú, apila los bloques como hice"
4. Observa si logra apilar
   - PASA: Apila al menos 2 bloques
   - NO PASA: No logra apilar, los deja caer
```

**Criterios para PASA/NO PASA:**

- **PASA**: El niño logra el hito de manera consistente, aunque no sea perfecta
- **NO PASA**: El niño no logra el hito, se rehúsa, o no muestra el comportamiento

**Consejo importante:**

No es necesario ser perfeccionista. Los hitos son cualitativos:
- "Señala" = Extiende dedo hacia objeto (no necesita ser extremadamente preciso)
- "Dice palabra" = Sonido reconocible como palabra, aunque esté mal pronunciado
- "Se para" = Sin apoyo firme, aunque sea inestable

### PASO 3: Ve el Resultado

**Pantalla: Resumen de Resultado**

```
┌──────────────────────────────────┐
│     RESULTADO: PASA              │
│        (o NO_PASA)               │
└──────────────────────────────────┘

Paciente: Juan Carlos López García
Edad: 0.5 años (6 meses)
Edad corregida: 0.385 años (4.6 meses)

Estadísticas:
- Hitos evaluados: 12
- Hitos PASA: 10
- Fallas Tipo A: 0
- Fallas Tipo B: 1

Gráfico de Percentiles:
[Gráfico visual con barras]
```

**Interpretación:**

- **RESULTADO: PASA**
  - Desarrollo normal para edad
  - Continuar control periódico
  - Sin derivación necesaria

- **RESULTADO: NO_PASA**
  - Posible retraso del desarrollo
  - Requiere derivación a especialista (Neurólogo Pediátrico)
  - Realizar evaluación especializada dentro de 2-4 semanas

**Gráfico de Percentiles:**

El gráfico muestra para cada hito:
- Barra azul: Percentil P75 (edad donde 75% logran el hito)
- Barra roja: Percentil P90 (edad donde 90% logran el hito)
- Línea verde: Edad actual del niño

Interpretación visual:
```
Si la línea verde está MÁS ALLÁ de P90 (barra roja)
→ Hito Type A (crítico si falla)

Si la línea verde está ENTRE P75 y P90
→ Hito Type B (en riesgo si falla)
```

### Guardar la Evaluación

1. El resultado se guarda automáticamente
2. Aparece en el historial del paciente
3. Puedes verlo nuevamente cuando lo necesites

---

## Cómo Interpretar el Resultado

### Si el Resultado es PASA

**Buen news:** El desarrollo del niño está dentro de los parámetros normales para su edad.

**Acciones:**
1. Comunicar al padre/cuidador:
   - "El niño está desarrollándose bien"
   - Reforzar prácticas de estimulación en casa
2. Continuar controles periódicos según protocolo (ej: cada 6 meses)
3. No se requiere derivación especializada

**Próximos pasos:**
- Control de salud general
- Vacunaciones
- Estimulación en casa
- Seguimiento según protocolos locales

### Si el Resultado es NO_PASA

**Atención:** Existen indicadores de posible retraso. Requiere evaluación especializada.

**Acciones (Muy importante):**

1. **NO ALARMES al padre/cuidador**
   - Explicar que PRUNAPE es un tamizaje (pesquisa), no un diagnóstico
   - Decir: "Encontramos algunos hitos que necesitan revisión por un especialista"

2. **DERIVAR a especialista**
   - Neurólogo pediátrico preferentemente
   - Pediatra especialista en desarrollo
   - En próximas 2-4 semanas

3. **DOCUMENTAR**
   - Guardar resultado de PRUNAPE
   - Anotar qué hitos fallaron
   - Incluir en referencia al especialista

4. **SEGUIMIENTO**
   - Especialista confirmará o descartará retraso
   - Iniciará tratamiento/estimulación si corresponde

**Diagnósticos posibles a explorar:**
- Parálisis cerebral
- Retraso global del desarrollo
- Trastorno específico del lenguaje
- Trastorno del espectro autista
- Deficiencia auditiva
- Causas ambientales/sociales

**Mensaje útil para padre/cuidador:**

> "La evaluación mostró que tu hijo podría beneficiarse de una revisión por un especialista. Esto no es un diagnóstico de enfermedad, sino una recomendación de monitoreo. Es como cuando el pediatra nos sugiere una opinión adicional. Te daremos una referencia para que vea a un [Neurólogo/Especialista]."

---

## Lectura del Gráfico de Percentiles

El gráfico visual muestra la relación entre edad del niño y hitos del desarrollo.

**Elementos del gráfico:**

```
           EDAD →
   ┌───────────────────────────────────┐
   │ ▓ (azul)  = P75                   │
   │ ▓ (rojo)  = P90                   │
   │ ▓ (verde) = Edad actual del niño  │
   └───────────────────────────────────┘

Ejemplo visual:
Hito "Señala"
   P75  P90  Edad
   |    |    |
   1.0  1.5  2.0 años

Interpretación:
- A los 1.0 años, 75% de niños señalan
- A los 1.5 años, 90% de niños señalan
- Nuestro niño tiene 2.0 años
- Edad > P90 → Type A (crítico si falla)
- Si falla este hito → Requiere investigación
```

---

## Búsqueda de Pacientes

### Cómo Buscar

En la página "Ver Pacientes":

1. Verás una barra de búsqueda en la parte superior
2. Escribe parte del nombre del paciente
3. Presiona Enter o espera a que aparezcan resultados
4. Haz clic en el paciente deseado

**Ejemplo de búsqueda:**

```
Buscando a "Juan Carlos López García"

Escribe: "juan"     → Aparecen todos los pacientes con "juan" en el nombre
Escribe: "lopez"    → Aparecen todos los pacientes con "lopez" en el apellido
Escribe: "j.c.l"    → Búsqueda más específica
```

### Filtrado

Si necesitas ver:
- **Todos los pacientes:** Deja buscador vacío
- **Por reciente:** Ordenados por fecha de creación (más reciente primero)
- **Por nombre:** Búsqueda alfabética

---

## Historial de Evaluaciones

### Ver Historial de un Paciente

1. En la página de detalle del paciente
2. Desplázate hacia abajo
3. Verás sección "Evaluaciones Previas"
4. Lista todas las evaluaciones del paciente, con fechas

### Ver Evaluación Anterior

1. Haz clic en la evaluación en el historial
2. Verás todos los detalles de esa evaluación:
   - Fecha
   - Edad en ese momento
   - Resultado (PASA/NO_PASA)
   - Hitos evaluados y resultados
   - Gráfico de percentiles

### Comparar Evaluaciones

Para comparar el progreso:

1. Abre dos evaluaciones del mismo paciente
2. Observa:
   - ¿Mejoró de NO_PASA a PASA?
   - ¿Qué hitos mejoraron?
   - ¿Qué hitos empeoraron?
3. Usa esto para decisiones de seguimiento

---

## Casos de Uso Comunes

### Caso 1: Control Periódico de Guardería

```
ESCENARIO: Niño de 18 meses en guardería, control de rutina

PASOS:
1. Abre paciente "Lucía Martínez"
2. Crear evaluación en su fecha de nacimiento
3. Evalúa los 15-20 hitos Type A y B aplicables
4. Resultado: PASA
5. CONCLUSIÓN: Continuar en guardería, sin derivación

REGISTRO: Imprime resultado para historial de guardería
```

### Caso 2: Sospecha de Retraso

```
ESCENARIO: Madre preocupada porque niño de 2.5 años no habla

PASOS:
1. Crea paciente "Mateo López"
2. Realizar evaluación a edad actual
3. Evalúa 20-25 hitos aplicables
4. Múltiples fallos en lenguaje (Type A y B)
5. Resultado: NO_PASA

ACCIONES:
- Explicar a madre que necesita especialista
- Derivar a Neurología/ORL
- Guardar resultado para llevar a consulta
- Seguimiento a especialista
```

### Caso 3: Paciente Prematuro

```
ESCENARIO: Niño nacido a las 34 semanas, ahora con 8 meses cronológicos

PASOS:
1. Crear paciente con gestational_age_weeks = 34
2. Realizar evaluación
3. Sistema calcula:
   - Edad cronológica: 0.67 años (8 meses)
   - Edad corregida: 0.556 años (6.7 meses)
4. Hitos aplicables calculados con edad corregida
5. Es normal que parezca "retrasado" en edad crónica
   pero está bien en edad corregida

CONCLUSIÓN: Interpretación correcta requiere entender prematuridad
```

### Caso 4: Seguimiento a NO_PASA

```
ESCENARIO: Niño que hace 2 meses NO_PASA, ahora 6 meses después

PASOS:
1. Abrir paciente, ver evaluación anterior (NO_PASA)
2. Crear nueva evaluación
3. Comparar hitos:
   - ¿Algunos hitos que fallaban ahora pasan?
   - ¿Sigue habiendo fallas Type A?
4. Si ahora PASA → Evaluación especializada confirmó que estaba bien
5. Si NO_PASA → Podría requerir más intervención

CONCLUSIÓN: Útil para monitoreo post-derivación
```

---

## Preguntas Frecuentes (FAQ)

### P: ¿Cuánto tarda una evaluación?

R: Una evaluación típica toma 15-25 minutos, dependiendo del número de hitos aplicables y la edad del niño.

### P: ¿Puedo evaluar un niño que está enfermo?

R: No es recomendable. Un niño enfermo, incómodo o cansado puede no mostrar sus capacidades reales. Mejor esperar a que esté bien.

### P: ¿Qué pasa si un niño se rehúsa a responder?

R: Marca como "NO PASA" para ese hito. Nota que fue negativa por comportamiento. Puedes intentar otro día.

### P: ¿Puedo evaluar un niño mayor de 6 años?

R: PRUNAPE está validada para 0-6 años. Mayores de 6 años requieren otros instrumentos.

### P: ¿Cómo sé si el resultado es confiable?

R: Un resultado es más confiable si:
- Niño estaba cómodo y disponible
- Ambiente tranquilo
- Múltiples hitos evaluados (no solo 1-2)
- Consistencia con historial del niño

### P: ¿Si da PASA, nunca tendrá retraso?

R: PRUNAPE evalúa un momento en el tiempo. Un PASA significa que ese día estaba bien. Cambios o preocupaciones posteriores podrían requerir nueva evaluación.

### P: ¿Por qué corrijo por prematuridad?

R: Los prematuros necesitan "tiempo de catch-up". Sin corrección, parecerían retrasados cuando están en desarrollo normal.

**Ejemplo:**
```
Nacimiento: 32 semanas (8 semanas antes de término)
Edad cronológica: 4 meses
Edad corregida: 2 meses

Si evaluamos como 4 meses: parecería retrasado
Si evaluamos como 2 meses: desarrollo es normal
Corrección es clave para interpretación correcta.
```

### P: ¿A quién derivar si NO_PASA?

R: Idealmente:
1. **Neurólogo Pediátrico** (especialista en desarrollo)
2. **Pediatra especialista en desarrollo**
3. En su defecto, pediatra con experiencia en desarrollo

### P: ¿Se ve distinto por edad gestacional en pantalla?

R: En entrada de datos puedes ver si se aplicó corrección. En evaluación, los hitos mostrados ya tienen en cuenta la corrección.

### P: ¿Puedo editar una evaluación después de crear?

R: Actualmente no. Puedes crear una nueva evaluación o eliminar y recrear si fue error.

### P: ¿Dónde se guardan los datos?

R: Los datos se guardan en la base de datos de la aplicación (SQLite local). Tu institución es responsable de backups.

### P: ¿Cómo aseguro confidencialidad?

R: La aplicación no requiere datos personales más allá de nombre y fecha. No hay envío a servidores externos (validar con tu IT). Cumplir con leyes locales de protección de datos.

---

## Soporte y Ayuda

Si tienes problemas con la aplicación:

1. **Error al crear paciente**
   - Verificar que los datos sean correctos
   - Fecha de nacimiento debe ser anterior a hoy
   - Intentar con navegador diferente

2. **No aparecen hitos para evaluar**
   - Verificar que la fecha de evaluación sea válida
   - Asegurar que la edad sea entre 0-6 años

3. **No puedo guardar evaluación**
   - Verificar conexión a internet
   - Intentar desde otra página y volver

4. **Problema técnico persistente**
   - Contactar a: [email de soporte]
   - Incluir: descripción del problema, navegador, hora

---

## Consejos Prácticos

### Para Evaluadores Nuevos

1. **Practica primero** con un paciente conocido
2. **Lee los hitos** completamente antes de evaluar
3. **No tienes que memorizar** - la app muestra descripción
4. **Tómate tiempo** - no hay prisa
5. **Comunica claramente** con padre/cuidador qué haces

### Para Optimizar Evaluaciones

1. **Agenda evaluaciones en horarios buenos**
   - Mañana para niños pequeños (menos cansados)
   - Después de comidas (menos hambra)
   - Evitar horarios de sueño

2. **Ten materiales listos**
   - Papel, crayones para dibujar
   - Bloques, juguetes
   - Objetos para señalar

3. **Documenta notas importantes**
   - Si el niño estuvo enfermo ese día
   - Si se rehusó a participar
   - Comportamientos relevantes

4. **Revisa historial**
   - Ver evaluación anterior antes de nueva evaluación
   - Nota cambios/progreso

### Comunicación con Familia

**Mensaje cuando PASA:**
> "Muy bien, el niño está desarrollándose normalmente. Continúen estimulando en casa y traerlo a control en 6 meses."

**Mensaje cuando NO_PASA:**
> "Encontramos algunos hitos que necesitan revisión por un especialista. No es un diagnóstico grave, pero es mejor estar seguro. Te daré una referencia para ver a un Neurólogo."

---

**Versión:** 1.0
**Última actualización:** Marzo 2026
**Para preguntas:** Contactar a Hospital Garrahan
