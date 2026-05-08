import { useParams, Link } from "react-router-dom"
import { useAssessment, usePautas } from "../api/assessments"
import { usePatient } from "../api/patients"
import { pdf } from "@react-pdf/renderer"
import { AssessmentPDF } from "../components/AssessmentPDF"
import ResultSummary from "../components/ResultSummary"
import PercentileChart from "../components/PercentileChart"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AssessmentResultPage() {
  const { id } = useParams<{ id: string }>()
  const assessmentId = id ? parseInt(id) : undefined

  const { data: assessment, isLoading: loadingAssessment } = useAssessment(assessmentId)
  const { data: allPautas = [], isLoading: loadingPautas } = usePautas()
  const { data: patient } = usePatient(assessment?.patient_id)

  const loading = loadingAssessment || loadingPautas

  if (loading) return <p>Cargando...</p>
  if (!assessment) return <p>Evaluación no encontrada.</p>

  const effectiveAge = assessment.corrected_age ?? assessment.chronological_age
  const passed = assessment.result === "PASA"

  const handleDownloadPDF = async () => {
    if (!patient) return
    const blob = await pdf(
      <AssessmentPDF patient={patient} assessment={assessment} />
    ).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `prunape-${patient.name}-${assessment.assessment_date}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          to={`/patients/${assessment.patient_id}`}
          className="text-[var(--primary)] hover:underline text-sm"
        >
          &larr; Volver al paciente
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-[var(--foreground)]">
        Resultado de Evaluación
      </h1>

      {/* Banner PASA/NO PASA */}
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

      {/* Grid de datos clínicos */}
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

      {/* Hitos no alcanzados (solo si NO PASA) */}
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

      {/* Detail summary (fallas, etc.) */}
      <ResultSummary assessment={assessment} />

      {/* Gráfico de percentiles */}
      {allPautas.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Gráfico de Percentiles</h2>
          <div className="overflow-x-auto">
            <PercentileChart
              pautas={allPautas}
              childAgeYears={effectiveAge}
              assessmentItems={assessment.items}
            />
          </div>
        </div>
      )}

      {/* Acciones */}
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
    </div>
  )
}
