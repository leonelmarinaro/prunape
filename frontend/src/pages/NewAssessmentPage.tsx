import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { usePatient } from "../api/patients"
import { useCalculateAge, useCreateAssessment } from "../api/assessments"
import type { ApplicablePauta, AssessmentItemInput } from "../types"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { StepIndicator } from "@/components/ui/StepIndicator"
import { AvatarInitials } from "@/components/ui/AvatarInitials"
import { cn } from "@/lib/utils"
import { useAuth } from "@clerk/clerk-react"

type Step = 1 | 2 | 3

const STEP_LABELS = ["Fecha", "Evaluación", "Resultado"]

const AREAS = ["Personal Social", "Motor Fino", "Lenguaje", "Motor Grueso"]

// Hook seguro para obtener el userId de Clerk.
// useAuth lanza si no hay ClerkProvider; capturamos el error con un wrapper.
function SafeClerkUserIdInner(): string {
  const { userId } = useAuth()
  return userId ?? "anon"
}

function useClerkUserId(): string {
  // Verificar si el key está configurado (solo en runtime con Vite env)
  const clerkEnabled = Boolean(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (import.meta as unknown as { env: Record<string, string> }).env
      ?.VITE_CLERK_PUBLISHABLE_KEY
  )
  if (!clerkEnabled) return "anon"
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return SafeClerkUserIdInner()
  } catch {
    return "anon"
  }
}

export default function NewAssessmentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const patientId = id ? parseInt(id) : undefined

  const { data: patient } = usePatient(patientId)
  const calculateAge = useCalculateAge()
  const createAssessment = useCreateAssessment()

  const userId = useClerkUserId()
  const storageKey = `prunape-wizard-${patientId ?? "unknown"}-${userId}`

  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [assessmentDate, setAssessmentDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [pautas, setPautas] = useState<ApplicablePauta[]>([])
  const [responses, setResponses] = useState<Record<number, boolean>>({})
  const [error, setError] = useState("")
  const [chronoAge, setChronoAge] = useState<number | null>(null)
  const [correctedAge, setCorrectedAge] = useState<number | null>(null)
  const [currentPautaIndex, setCurrentPautaIndex] = useState(0)

  // Autosave: hidratar al montar
  useEffect(() => {
    try {
      const saved = window.localStorage?.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved) as {
          currentStep?: number
          responses?: Record<number, boolean>
        }
        if (parsed.currentStep && parsed.currentStep > 1) {
          // Solo restaurar si hay datos válidos para pasos avanzados
          setResponses(parsed.responses ?? {})
        }
      }
    } catch {
      // ignorar estado corrupto o localStorage no disponible
    }
    // Solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  // Autosave: guardar en cada cambio (no en mount)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    try {
      window.localStorage?.setItem(
        storageKey,
        JSON.stringify({ currentStep, responses })
      )
    } catch {
      // ignorar si localStorage no está disponible
    }
  }, [storageKey, currentStep, responses])

  const handleCalculateAge = async () => {
    if (!id) return
    setError("")
    try {
      const result = await calculateAge.mutateAsync({
        patient_id: parseInt(id),
        assessment_date: assessmentDate,
      })
      setPautas(result.applicable_pautas)
      setChronoAge(result.chronological_age)
      setCorrectedAge(result.corrected_age)
      setCurrentStep(2)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al calcular la edad"
      )
    }
  }

  const handleResponse = (pautaId: number, passed: boolean) => {
    setResponses((prev) => ({ ...prev, [pautaId]: passed }))
  }

  const allAnswered =
    pautas.length > 0 && pautas.every((p) => responses[p.id] !== undefined)
  const answeredCount = Object.keys(responses).length

  const handleSubmit = async () => {
    if (!id) return
    setError("")
    try {
      const items: AssessmentItemInput[] = pautas.map((p) => ({
        pauta_id: p.id,
        passed: responses[p.id],
      }))
      const assessment = await createAssessment.mutateAsync({
        patient_id: parseInt(id),
        assessment_date: assessmentDate,
        items,
      })
      try { window.localStorage?.removeItem(storageKey) } catch { /* ignorar */ }
      navigate(`/assessments/${assessment.id}`)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al guardar la evaluación"
      )
    }
  }

  // Atajos de teclado en paso 2
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (currentStep !== 2 || pautas.length === 0) return
      const currentPauta = pautas[currentPautaIndex]
      if (!currentPauta) return

      if (e.key === "1" || e.key === "s") {
        handleResponse(currentPauta.id, true)
      } else if (e.key === "2" || e.key === "n") {
        handleResponse(currentPauta.id, false)
      } else if (e.key === "ArrowRight") {
        if (currentPautaIndex < pautas.length - 1) {
          setCurrentPautaIndex((i) => i + 1)
        }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, currentPautaIndex, pautas])

  if (!patient) return <p>Cargando...</p>

  function StepFecha() {
    return (
      <div className="bg-white rounded-lg p-6 border border-[var(--border)]">
        {/* Card contexto paciente */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[var(--border)]">
          <AvatarInitials name={patient!.name} size="md" />
          <div className="text-xs text-[var(--muted-foreground)]">
            Nacimiento: {new Date(patient!.birth_date + "T00:00:00").toLocaleDateString("es-AR")}
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
          {calculateAge.isPending ? "Calculando..." : "Comenzar Evaluación"}
        </Button>
      </div>
    )
  }

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
          <strong>Edad Cronológica:</strong> {chronoAge?.toFixed(2)} años
          {correctedAge != null && (
            <> · <strong>Edad Corregida:</strong> {correctedAge.toFixed(2)} años</>
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
              key={`${area}-${areaCompleted ? 'done' : 'open'}`}
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

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-5 text-[var(--foreground)]">
        Nueva Evaluación — {patient.name}
      </h1>

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
}
