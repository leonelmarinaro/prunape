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
          "rounded-xl border-2 p-8 text-center",
          passed
            ? "bg-green-50 border-green-500"
            : "bg-red-50 border-red-500"
        )}
        role="status"
        aria-live="polite"
      >
        <div
          className={cn(
            "text-5xl font-bold mb-2",
            passed ? "text-green-800" : "text-red-800"
          )}
        >
          {passed ? "PASA" : "NO PASA"}
        </div>
        <p className={cn("text-sm", passed ? "text-green-700" : "text-red-700")}>
          {passed
            ? "El niño aprueba la pesquisa. Se recomienda control en la próxima visita pediátrica."
            : "Se recomienda derivar para evaluación diagnóstica completa del desarrollo."}
        </p>
      </div>

      {/* Datos de la evaluación */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-5">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 text-sm">
          <div>
            <dt className="text-[var(--muted-foreground)]">Fecha</dt>
            <dd className="font-medium">
              {new Date(assessment.assessment_date + "T00:00:00").toLocaleDateString("es-AR")}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Edad Cronológica:</dt>
            <dd className="font-medium">
              {assessment.chronological_age.toFixed(2)} años
            </dd>
          </div>
          {assessment.corrected_age != null && (
            <div>
              <dt className="text-[var(--muted-foreground)]">Edad Corregida:</dt>
              <dd className="font-medium">
                {assessment.corrected_age.toFixed(2)} años
              </dd>
            </div>
          )}
        </dl>
      </div>

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
          variant="outline"
          onClick={() => window.print()}
        >
          Imprimir
        </Button>
        {patient && (
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
          >
            Descargar PDF
          </Button>
        )}
      </div>
    </div>
  )
}
