import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { usePatient } from "../api/patients"
import { useCalculateAge, useCreateAssessment } from "../api/assessments"
import type { ApplicablePauta, AssessmentItemInput } from "../types"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { StepIndicator } from "@/components/ui/StepIndicator"
import { AvatarInitials } from "@/components/ui/AvatarInitials"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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
  const progressPct = pautas.length > 0 ? (answeredCount / pautas.length) * 100 : 0

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
    return (
      <div className="mt-4 space-y-4">
            {/* Resumen de edad */}
            <div className="bg-white rounded-lg p-4 border border-[var(--border)]">
              <p className="text-sm">
                <strong>Edad Cronológica:</strong>{" "}
                {chronoAge?.toFixed(2)} años
                {correctedAge != null && (
                  <>
                    {" "}
                    |{" "}
                    <strong>Edad Corregida:</strong>{" "}
                    {correctedAge.toFixed(2)} años
                  </>
                )}
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Total: {pautas.length} pautas | Respondidas: {answeredCount}
              </p>
              <Progress
                value={progressPct}
                className="mt-2 h-2"
                aria-label={`Progreso: ${answeredCount} de ${pautas.length} pautas respondidas`}
              />
            </div>

            {/* Pautas por área */}
            {AREAS.map((area) => {
              const areaPautas = pautas.filter((p) => p.area === area)
              if (areaPautas.length === 0) return null
              const areaCompleted = areaPautas.filter(
                (p) => responses[p.id] !== undefined
              ).length

              return (
                <details key={area} open className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer font-semibold text-sm select-none hover:bg-[var(--muted)]">
                    <span>{area}</span>
                    <span className="text-[var(--muted-foreground)] font-normal">
                      {areaCompleted}/{areaPautas.length}
                    </span>
                  </summary>
                  <div className="divide-y divide-[var(--border)]">
                    {areaPautas.map((pauta) => {
                      const resp = responses[pauta.id]
                      return (
                        <div
                          key={pauta.id}
                          className={cn(
                            "flex items-center justify-between px-4 py-3 gap-4",
                            resp !== undefined && "bg-gray-50"
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{pauta.name}</span>
                              <span
                                className={cn(
                                  "text-xs px-2 py-0.5 rounded-full font-medium",
                                  pauta.pauta_type === "A"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                )}
                              >
                                Tipo {pauta.pauta_type}
                              </span>
                            </div>
                            <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                              P75: {pauta.p75.toFixed(2)} | P90:{" "}
                              {pauta.p90.toFixed(2)}
                            </div>
                          </div>
                          <ToggleGroup
                            type="single"
                            value={
                              resp !== undefined ? resp.toString() : ""
                            }
                            onValueChange={(v) => {
                              if (v !== "") handleResponse(pauta.id, v === "true")
                            }}
                            aria-label={pauta.name}
                            variant="outline"
                            size="sm"
                          >
                            <ToggleGroupItem
                              value="true"
                              aria-label="Cumple"
                              className={cn(
                                resp === true &&
                                  "bg-green-600 text-white border-green-600 data-[state=on]:bg-green-600 data-[state=on]:text-white"
                              )}
                            >
                              Cumple
                            </ToggleGroupItem>
                            <ToggleGroupItem
                              value="false"
                              aria-label="No cumple"
                              className={cn(
                                resp === false &&
                                  "bg-red-600 text-white border-red-600 data-[state=on]:bg-red-600 data-[state=on]:text-white"
                              )}
                            >
                              No cumple
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                      )
                    })}
                  </div>
                </details>
              )
            })}

            {error && (
              <p className="text-red-600 text-sm" role="alert">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                Volver
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!allAnswered}
              >
                Revisar y Enviar
              </Button>
            </div>
          </div>
    )
  }

  function StepRevision() {
    return (
      <div className="mt-4 space-y-4">
            <div className="bg-white rounded-lg p-6 border border-[var(--border)]">
              <h2 className="text-lg font-semibold mb-4">Resumen de Respuestas</h2>

              {AREAS.map((area) => {
                const areaPautas = pautas.filter((p) => p.area === area)
                if (areaPautas.length === 0) return null
                return (
                  <div key={area} className="mb-5">
                    <h3 className="font-semibold text-sm text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
                      {area}
                    </h3>
                    <div className="space-y-1">
                      {areaPautas.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-3 text-sm py-1"
                        >
                          <span
                            className={cn(
                              "font-semibold min-w-[90px]",
                              responses[p.id]
                                ? "text-green-700"
                                : "text-red-700"
                            )}
                          >
                            {responses[p.id] ? "Cumple" : "No cumple"}
                          </span>
                          <span className="flex-1">{p.name}</span>
                          <span className="text-[var(--muted-foreground)]">
                            Tipo {p.pauta_type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {error && (
              <p className="text-red-600 text-sm" role="alert">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
              >
                Volver a Editar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createAssessment.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {createAssessment.isPending
                  ? "Guardando..."
                  : "Confirmar Evaluación"}
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
