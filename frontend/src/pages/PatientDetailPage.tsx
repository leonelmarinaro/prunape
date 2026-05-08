import { useParams, Link } from "react-router-dom";
import { usePatient } from "../api/patients";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const patientId = id ? parseInt(id) : undefined;
  const { data: patient, isLoading: loading } = usePatient(patientId);

  if (loading) return <p>Cargando...</p>;
  if (!patient) return <p>Paciente no encontrado.</p>;

  return (
    <div>
      <h1>{patient.name}</h1>
      <div style={{ background: "white", padding: 20, borderRadius: 8, marginBottom: 20 }}>
        <p>
          <strong>Fecha de Nacimiento:</strong>{" "}
          {new Date(patient.birth_date + "T00:00:00").toLocaleDateString("es-AR")}
        </p>
        <p>
          <strong>Edad Gestacional:</strong>{" "}
          {patient.gestational_age_weeks ? `${patient.gestational_age_weeks} semanas` : "Término"}
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>Evaluaciones</h2>
        <Link
          to={`/patients/${patient.id}/assess`}
          style={{
            background: "#059669",
            color: "white",
            padding: "8px 16px",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          + Nueva Evaluación
        </Link>
      </div>

      {patient.assessments.length === 0 ? (
        <p style={{ color: "#888" }}>Sin evaluaciones registradas.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 8 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
              <th style={{ padding: "10px 14px" }}>Fecha</th>
              <th style={{ padding: "10px 14px" }}>Edad Cronológica</th>
              <th style={{ padding: "10px 14px" }}>Edad Corregida</th>
              <th style={{ padding: "10px 14px" }}>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {patient.assessments.map((a) => (
              <tr key={a.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "10px 14px" }}>
                  <Link to={`/assessments/${a.id}`} style={{ color: "#1a56db" }}>
                    {new Date(a.assessment_date + "T00:00:00").toLocaleDateString("es-AR")}
                  </Link>
                </td>
                <td style={{ padding: "10px 14px" }}>{a.chronological_age.toFixed(2)} años</td>
                <td style={{ padding: "10px 14px" }}>
                  {a.corrected_age != null ? `${a.corrected_age.toFixed(2)} años` : "-"}
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <span
                    style={{
                      background: a.result === "PASA" ? "#d1fae5" : "#fee2e2",
                      color: a.result === "PASA" ? "#065f46" : "#991b1b",
                      padding: "4px 10px",
                      borderRadius: 4,
                      fontWeight: 600,
                    }}
                  >
                    {a.result === "PASA" ? "PASA" : "NO PASA"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
