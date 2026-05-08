import { useParams, Link } from "react-router-dom";
import { useAssessment, usePautas } from "../api/assessments";
import ResultSummary from "../components/ResultSummary";
import PercentileChart from "../components/PercentileChart";

export default function AssessmentResultPage() {
  const { id } = useParams<{ id: string }>();
  const assessmentId = id ? parseInt(id) : undefined;

  const { data: assessment, isLoading: loadingAssessment } = useAssessment(assessmentId);
  const { data: allPautas = [], isLoading: loadingPautas } = usePautas();

  const loading = loadingAssessment || loadingPautas;

  if (loading) return <p>Cargando...</p>;
  if (!assessment) return <p>Evaluación no encontrada.</p>;

  const effectiveAge = assessment.corrected_age ?? assessment.chronological_age;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Link to={`/patients/${assessment.patient_id}`} style={{ color: "#1a56db" }}>
          &larr; Volver al paciente
        </Link>
      </div>

      <h1>Resultado de Evaluación</h1>
      <div style={{ background: "white", padding: 16, borderRadius: 8, marginBottom: 20 }}>
        <p>
          <strong>Fecha:</strong>{" "}
          {new Date(assessment.assessment_date + "T00:00:00").toLocaleDateString("es-AR")}
        </p>
        <p>
          <strong>Edad Cronológica:</strong> {assessment.chronological_age.toFixed(2)} años
          {assessment.corrected_age != null && (
            <> | <strong>Edad Corregida:</strong> {assessment.corrected_age.toFixed(2)} años</>
          )}
        </p>
      </div>

      <ResultSummary assessment={assessment} />

      {allPautas.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2>Gráfico de Percentiles</h2>
          <PercentileChart
            pautas={allPautas}
            childAgeYears={effectiveAge}
            assessmentItems={assessment.items}
          />
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <button
          onClick={() => window.print()}
          style={{
            background: "#6b7280",
            color: "white",
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
          }}
        >
          Imprimir
        </button>
      </div>
    </div>
  );
}
