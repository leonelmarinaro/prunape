import type { Assessment } from "../types";

interface Props {
  assessment: Assessment;
}

export default function ResultSummary({ assessment }: Props) {
  const passed = assessment.result === "PASA";
  const failedItems = assessment.items.filter((i) => !i.passed);
  const typeAFailures = failedItems.filter((i) => i.pauta_type === "A");
  const typeBFailures = failedItems.filter((i) => i.pauta_type === "B");

  return (
    <div
      style={{
        background: passed ? "#d1fae5" : "#fee2e2",
        border: `2px solid ${passed ? "#059669" : "#dc2626"}`,
        borderRadius: 12,
        padding: 24,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          color: passed ? "#065f46" : "#991b1b",
          marginBottom: 8,
        }}
      >
        {passed ? "PASA" : "NO PASA"}
      </div>

      {!passed && (
        <div style={{ textAlign: "left", marginTop: 16 }}>
          {typeAFailures.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <strong style={{ color: "#991b1b" }}>
                Fallas Tipo A (por encima de P90):
              </strong>
              <ul style={{ margin: "4px 0" }}>
                {typeAFailures.map((i) => (
                  <li key={i.id}>
                    {i.pauta_name} ({i.area})
                  </li>
                ))}
              </ul>
            </div>
          )}
          {typeBFailures.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <strong style={{ color: "#92400e" }}>
                Fallas Tipo B (entre P75-P90):
              </strong>
              <ul style={{ margin: "4px 0" }}>
                {typeBFailures.map((i) => (
                  <li key={i.id}>
                    {i.pauta_name} ({i.area})
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p style={{ color: "#991b1b", fontStyle: "italic", marginTop: 16 }}>
            Se recomienda derivar para evaluación diagnóstica completa del desarrollo.
          </p>
        </div>
      )}

      {passed && (
        <p style={{ color: "#065f46" }}>
          El niño aprueba la pesquisa. Se recomienda control en la próxima visita pediátrica.
        </p>
      )}
    </div>
  );
}
