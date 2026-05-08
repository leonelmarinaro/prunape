import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePatient } from "../api/patients";
import { useCalculateAge, useCreateAssessment } from "../api/assessments";
import type { ApplicablePauta, AssessmentItemInput } from "../types";
import PautaCard from "../components/PautaCard";

type Step = "date" | "evaluate" | "review";

const AREAS = ["Personal Social", "Motor Fino", "Lenguaje", "Motor Grueso"];

export default function NewAssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patientId = id ? parseInt(id) : undefined;

  const { data: patient } = usePatient(patientId);
  const calculateAge = useCalculateAge();
  const createAssessment = useCreateAssessment();

  const [step, setStep] = useState<Step>("date");
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [pautas, setPautas] = useState<ApplicablePauta[]>([]);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [error, setError] = useState("");
  const [chronoAge, setChronoAge] = useState<number | null>(null);
  const [correctedAge, setCorrectedAge] = useState<number | null>(null);

  const handleCalculateAge = async () => {
    if (!id) return;
    setError("");
    try {
      const result = await calculateAge.mutateAsync({
        patient_id: parseInt(id),
        assessment_date: assessmentDate,
      });
      setPautas(result.applicable_pautas);
      setChronoAge(result.chronological_age);
      setCorrectedAge(result.corrected_age);
      setStep("evaluate");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al calcular la edad");
    }
  };

  const handleAnswer = (pautaId: number, passed: boolean) => {
    setAnswers((prev) => ({ ...prev, [pautaId]: passed }));
  };

  const allAnswered = pautas.every((p) => answers[p.id] !== undefined);

  const handleSubmit = async () => {
    if (!id) return;
    setError("");
    try {
      const items: AssessmentItemInput[] = pautas.map((p) => ({
        pauta_id: p.id,
        passed: answers[p.id],
      }));
      const assessment = await createAssessment.mutateAsync({
        patient_id: parseInt(id),
        assessment_date: assessmentDate,
        items,
      });
      navigate(`/assessments/${assessment.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar la evaluación");
    }
  };

  if (!patient) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Nueva Evaluación - {patient.name}</h1>

      {step === "date" && (
        <div style={{ background: "white", padding: 20, borderRadius: 8 }}>
          <label>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>Fecha de Evaluación</div>
            <input
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db" }}
            />
          </label>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div style={{ marginTop: 16 }}>
            <button
              onClick={handleCalculateAge}
              style={{
                background: "#1a56db",
                color: "white",
                padding: "10px 20px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
              }}
            >
              Comenzar Evaluación
            </button>
          </div>
        </div>
      )}

      {step === "evaluate" && (
        <div>
          <div style={{ background: "white", padding: 16, borderRadius: 8, marginBottom: 20 }}>
            <p>
              <strong>Edad Cronológica:</strong> {chronoAge?.toFixed(2)} años
              {correctedAge != null && (
                <> | <strong>Edad Corregida:</strong> {correctedAge.toFixed(2)} años</>
              )}
            </p>
            <p style={{ color: "#666" }}>
              Total de pautas a evaluar: {pautas.length} | Respondidas: {Object.keys(answers).length}
            </p>
          </div>

          {AREAS.map((area) => {
            const areaPautas = pautas.filter((p) => p.area === area);
            if (areaPautas.length === 0) return null;
            return (
              <div key={area} style={{ marginBottom: 24 }}>
                <h2 style={{ borderBottom: "2px solid #e5e7eb", paddingBottom: 8 }}>{area}</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {areaPautas.map((p) => (
                    <PautaCard
                      key={p.id}
                      pauta={p}
                      answer={answers[p.id]}
                      onAnswer={(passed) => handleAnswer(p.id, passed)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {error && <p style={{ color: "red" }}>{error}</p>}
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button
              onClick={() => setStep("review")}
              disabled={!allAnswered}
              style={{
                background: allAnswered ? "#1a56db" : "#9ca3af",
                color: "white",
                padding: "10px 20px",
                borderRadius: 6,
                border: "none",
                cursor: allAnswered ? "pointer" : "not-allowed",
              }}
            >
              Revisar y Enviar
            </button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div>
          <div style={{ background: "white", padding: 20, borderRadius: 8, marginBottom: 20 }}>
            <h2>Resumen de Respuestas</h2>
            {AREAS.map((area) => {
              const areaPautas = pautas.filter((p) => p.area === area);
              if (areaPautas.length === 0) return null;
              return (
                <div key={area} style={{ marginBottom: 16 }}>
                  <h3>{area}</h3>
                  {areaPautas.map((p) => (
                    <div key={p.id} style={{ display: "flex", gap: 8, padding: "4px 0" }}>
                      <span
                        style={{
                          color: answers[p.id] ? "#059669" : "#dc2626",
                          fontWeight: 600,
                          minWidth: 80,
                        }}
                      >
                        {answers[p.id] ? "Cumple" : "No cumple"}
                      </span>
                      <span>{p.name}</span>
                      <span style={{ color: "#888", marginLeft: "auto" }}>
                        Tipo {p.pauta_type}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setStep("evaluate")}
              style={{
                background: "white",
                color: "#1a56db",
                padding: "10px 20px",
                borderRadius: 6,
                border: "1px solid #1a56db",
                cursor: "pointer",
              }}
            >
              Volver a Editar
            </button>
            <button
              onClick={handleSubmit}
              disabled={createAssessment.isPending}
              style={{
                background: "#059669",
                color: "white",
                padding: "10px 20px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
              }}
            >
              {createAssessment.isPending ? "Guardando..." : "Confirmar Evaluación"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
