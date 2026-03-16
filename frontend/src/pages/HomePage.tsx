import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div style={{ textAlign: "center", paddingTop: 60 }}>
      <h1 style={{ fontSize: "2rem", marginBottom: 8 }}>PRUNAPE</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>
        Prueba Nacional de Pesquisa - Sistema de Evaluación del Desarrollo Infantil
      </p>
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        <Link
          to="/patients"
          style={{
            background: "#1a56db",
            color: "white",
            padding: "12px 24px",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          Ver Pacientes
        </Link>
        <Link
          to="/patients/new"
          style={{
            background: "#059669",
            color: "white",
            padding: "12px 24px",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          Nuevo Paciente
        </Link>
      </div>
    </div>
  );
}
