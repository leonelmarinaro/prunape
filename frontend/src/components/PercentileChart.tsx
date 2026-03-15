import { useState } from "react";
import type { Pauta, AssessmentItem } from "../types";

interface Props {
  pautas: Pauta[];
  childAgeYears: number;
  assessmentItems?: AssessmentItem[];
}

const AREAS = ["Personal Social", "Motor Fino", "Lenguaje", "Motor Grueso"];
const AREA_COLORS: Record<string, string> = {
  "Personal Social": "#6366f1",
  "Motor Fino": "#0891b2",
  Lenguaje: "#d97706",
  "Motor Grueso": "#059669",
};

const MARGIN = { top: 40, right: 20, bottom: 30, left: 200 };
const BAR_HEIGHT = 14;
const BAR_GAP = 3;
const AREA_HEADER_HEIGHT = 28;
const AREA_GAP = 12;
const MAX_AGE = 6; // years

export default function PercentileChart({ pautas, childAgeYears, assessmentItems }: Props) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const chartWidth = 800;

  // Group pautas by area, sorted by p75
  const grouped = AREAS.map((area) => ({
    area,
    pautas: pautas
      .filter((p) => p.area === area)
      .sort((a, b) => a.p75 - b.p75),
  })).filter((g) => g.pautas.length > 0);

  // Calculate total height
  let totalHeight = 0;
  for (const group of grouped) {
    totalHeight += AREA_HEADER_HEIGHT + group.pautas.length * (BAR_HEIGHT + BAR_GAP) + AREA_GAP;
  }
  const svgHeight = totalHeight + MARGIN.top + MARGIN.bottom;

  const plotWidth = chartWidth - MARGIN.left - MARGIN.right;
  const scale = (age: number) => MARGIN.left + (age / MAX_AGE) * plotWidth;

  // Build assessment item lookup
  const itemMap = new Map<number, AssessmentItem>();
  if (assessmentItems) {
    for (const item of assessmentItems) {
      itemMap.set(item.pauta_id, item);
    }
  }

  const getBarColor = (pautaId: number, area: string) => {
    const item = itemMap.get(pautaId);
    if (!item) return AREA_COLORS[area] || "#94a3b8";
    if (item.passed) return "#22c55e";
    return item.pauta_type === "A" ? "#ef4444" : "#f59e0b";
  };

  const getBarOpacity = (pautaId: number) => {
    return itemMap.has(pautaId) ? 0.85 : 0.5;
  };

  // X-axis ticks
  const ticks = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6];

  let yOffset = MARGIN.top;

  return (
    <div style={{ overflowX: "auto", background: "white", borderRadius: 8, padding: 16, position: "relative" }}>
      <svg width={chartWidth} height={svgHeight} style={{ fontFamily: "system-ui, sans-serif" }}>
        {/* X-axis ticks and labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={scale(t)}
              y1={MARGIN.top - 5}
              x2={scale(t)}
              y2={svgHeight - MARGIN.bottom}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            <text
              x={scale(t)}
              y={MARGIN.top - 10}
              textAnchor="middle"
              fontSize={10}
              fill="#6b7280"
            >
              {t % 1 === 0 ? `${t}a` : ""}
            </text>
          </g>
        ))}

        {/* Child age vertical line */}
        <line
          x1={scale(childAgeYears)}
          y1={MARGIN.top - 5}
          x2={scale(childAgeYears)}
          y2={svgHeight - MARGIN.bottom}
          stroke="#1a56db"
          strokeWidth={2}
          strokeDasharray="6,3"
        />
        <text
          x={scale(childAgeYears)}
          y={MARGIN.top - 20}
          textAnchor="middle"
          fontSize={11}
          fill="#1a56db"
          fontWeight={600}
        >
          {childAgeYears.toFixed(2)} años
        </text>

        {/* Areas and bars */}
        {grouped.map((group) => {
          const areaY = yOffset;
          yOffset += AREA_HEADER_HEIGHT;

          const bars = group.pautas.map((pauta, i) => {
            const barY = yOffset + i * (BAR_HEIGHT + BAR_GAP);
            const x1 = scale(0);
            const xP75 = scale(Math.min(pauta.p75, MAX_AGE));
            const xP90 = scale(Math.min(pauta.p90, MAX_AGE));
            const color = getBarColor(pauta.id, group.area);
            const opacity = getBarOpacity(pauta.id);

            return (
              <g
                key={pauta.id}
                onMouseEnter={(e) => {
                  const item = itemMap.get(pauta.id);
                  const status = item ? (item.passed ? "Cumple" : "No cumple") : "No evaluada";
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    text: `${pauta.name}\nP75: ${pauta.p75} | P90: ${pauta.p90}\n${status}`,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Solid bar: 0 to P75 */}
                <rect
                  x={x1}
                  y={barY}
                  width={xP75 - x1}
                  height={BAR_HEIGHT}
                  fill={color}
                  opacity={opacity}
                  rx={2}
                />
                {/* Lighter bar: P75 to P90 */}
                <rect
                  x={xP75}
                  y={barY}
                  width={xP90 - xP75}
                  height={BAR_HEIGHT}
                  fill={color}
                  opacity={opacity * 0.5}
                  rx={2}
                />
                {/* Label */}
                <text
                  x={MARGIN.left - 6}
                  y={barY + BAR_HEIGHT / 2 + 4}
                  textAnchor="end"
                  fontSize={9}
                  fill="#374151"
                >
                  {pauta.name.length > 28 ? pauta.name.slice(0, 26) + "..." : pauta.name}
                </text>
              </g>
            );
          });

          yOffset += group.pautas.length * (BAR_HEIGHT + BAR_GAP) + AREA_GAP;

          return (
            <g key={group.area}>
              {/* Area header */}
              <text
                x={8}
                y={areaY + AREA_HEADER_HEIGHT - 8}
                fontSize={12}
                fontWeight={700}
                fill={AREA_COLORS[group.area]}
              >
                {group.area}
              </text>
              <line
                x1={MARGIN.left}
                y1={areaY + AREA_HEADER_HEIGHT - 2}
                x2={chartWidth - MARGIN.right}
                y2={areaY + AREA_HEADER_HEIGHT - 2}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              {bars}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x + 12,
            top: tooltip.y + 12,
            background: "#1f2937",
            color: "white",
            padding: "8px 12px",
            borderRadius: 6,
            fontSize: 12,
            whiteSpace: "pre-line",
            pointerEvents: "none",
            zIndex: 100,
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12, flexWrap: "wrap" }}>
        <span><span style={{ display: "inline-block", width: 12, height: 12, background: "#22c55e", borderRadius: 2, marginRight: 4, verticalAlign: "middle" }}></span>Cumple</span>
        <span><span style={{ display: "inline-block", width: 12, height: 12, background: "#ef4444", borderRadius: 2, marginRight: 4, verticalAlign: "middle" }}></span>No cumple (Tipo A)</span>
        <span><span style={{ display: "inline-block", width: 12, height: 12, background: "#f59e0b", borderRadius: 2, marginRight: 4, verticalAlign: "middle" }}></span>No cumple (Tipo B)</span>
        <span><span style={{ display: "inline-block", width: 12, height: 12, background: "#94a3b8", borderRadius: 2, marginRight: 4, verticalAlign: "middle" }}></span>No evaluada</span>
        <span style={{ color: "#1a56db" }}>- - - Edad del niño</span>
      </div>
    </div>
  );
}
