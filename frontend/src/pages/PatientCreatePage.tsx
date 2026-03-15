import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPatient } from "../api/patients";

export default function PatientCreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gestWeeks, setGestWeeks] = useState<string>("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !birthDate) {
      setError("Nombre y fecha de nacimiento son obligatorios.");
      return;
    }
    setSubmitting(true);
    try {
      const patient = await createPatient({
        name: name.trim(),
        birth_date: birthDate,
        gestational_age_weeks: gestWeeks ? parseInt(gestWeeks) : null,
      });
      navigate(`/patients/${patient.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 500 }}>
      <h1>Nuevo Paciente</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>Nombre</div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", boxSizing: "border-box" }}
          />
        </label>
        <label>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>Fecha de Nacimiento</div>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", boxSizing: "border-box" }}
          />
        </label>
        <label>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>Edad Gestacional (semanas) - opcional</div>
          <input
            type="number"
            min={24}
            max={42}
            value={gestWeeks}
            onChange={(e) => setGestWeeks(e.target.value)}
            placeholder="Dejar vacío si término (>=37 sem)"
            style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", boxSizing: "border-box" }}
          />
        </label>
        {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          style={{
            background: "#1a56db",
            color: "white",
            padding: "10px 20px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          {submitting ? "Guardando..." : "Crear Paciente"}
        </button>
      </form>
    </div>
  );
}
