import { useState } from "react";
import { Link } from "react-router-dom";
import { usePatients } from "../api/patients";
import { useDebounce } from "../hooks/useDebounce";

export default function PatientListPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const { data: patients = [], isLoading: loading } = usePatients(debouncedSearch);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1>Pacientes</h1>
        <Link
          to="/patients/new"
          style={{
            background: "#059669",
            color: "white",
            padding: "8px 16px",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          + Nuevo Paciente
        </Link>
      </div>
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 6,
          border: "1px solid #d1d5db",
          marginBottom: 16,
          fontSize: "1rem",
          boxSizing: "border-box",
        }}
      />
      {loading ? (
        <p>Cargando...</p>
      ) : patients.length === 0 ? (
        <p style={{ color: "#888" }}>No se encontraron pacientes.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 8 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
              <th style={{ padding: "10px 14px" }}>Nombre</th>
              <th style={{ padding: "10px 14px" }}>Fecha de Nacimiento</th>
              <th style={{ padding: "10px 14px" }}>EG (sem)</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "10px 14px" }}>
                  <Link to={`/patients/${p.id}`} style={{ color: "#1a56db" }}>
                    {p.name}
                  </Link>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  {new Date(p.birth_date + "T00:00:00").toLocaleDateString("es-AR")}
                </td>
                <td style={{ padding: "10px 14px" }}>{p.gestational_age_weeks ?? "Término"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
