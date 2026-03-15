import type { ApplicablePauta } from "../types";

interface Props {
  pauta: ApplicablePauta;
  answer: boolean | undefined;
  onAnswer: (passed: boolean) => void;
}

export default function PautaCard({ pauta, answer, onAnswer }: Props) {
  const borderColor = pauta.pauta_type === "A" ? "#ef4444" : "#f59e0b";

  return (
    <div
      style={{
        background: "white",
        borderLeft: `4px solid ${borderColor}`,
        padding: "12px 16px",
        borderRadius: 6,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ fontWeight: 500 }}>
          {pauta.name}
          <span
            style={{
              marginLeft: 8,
              fontSize: "0.75rem",
              background: pauta.pauta_type === "A" ? "#fee2e2" : "#fef3c7",
              color: pauta.pauta_type === "A" ? "#991b1b" : "#92400e",
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            Tipo {pauta.pauta_type}
          </span>
        </div>
        <div style={{ fontSize: "0.85rem", color: "#888" }}>
          {pauta.tipo_pauta} | P75: {pauta.p75.toFixed(2)} | P90: {pauta.p90.toFixed(2)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => onAnswer(true)}
          style={{
            background: answer === true ? "#059669" : "#e5e7eb",
            color: answer === true ? "white" : "#374151",
            padding: "6px 14px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            fontWeight: answer === true ? 600 : 400,
          }}
        >
          Cumple
        </button>
        <button
          onClick={() => onAnswer(false)}
          style={{
            background: answer === false ? "#dc2626" : "#e5e7eb",
            color: answer === false ? "white" : "#374151",
            padding: "6px 14px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            fontWeight: answer === false ? 600 : 400,
          }}
        >
          No cumple
        </button>
      </div>
    </div>
  );
}
