import type { Assessment } from "../types"
import { cn } from "@/lib/utils"

interface Props {
  assessment: Assessment
}

export default function ResultSummary({ assessment }: Props) {
  const passed = assessment.result === "PASA"
  const failedItems = assessment.items.filter((i) => !i.passed)
  const typeAFailures = failedItems.filter((i) => i.pauta_type === "A")
  const typeBFailures = failedItems.filter((i) => i.pauta_type === "B")

  if (passed || failedItems.length === 0) return null

  return (
    <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <span className="text-sm font-semibold text-[var(--foreground)]">Detalle de fallas</span>
      </div>
      <div className="p-4 space-y-4 text-sm">
        {typeAFailures.length > 0 && (
          <div>
            <p className="font-semibold text-slate-700 mb-1.5">
              Fallas Tipo A <span className="text-xs text-[var(--muted-foreground)] font-normal">(por encima de P90)</span>
            </p>
            <ul className="space-y-1">
              {typeAFailures.map((i) => (
                <li key={i.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  <span className="text-[var(--foreground)]">{i.pauta_name}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">({i.area})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {typeBFailures.length > 0 && (
          <div>
            <p className="font-semibold text-slate-700 mb-1.5">
              Fallas Tipo B <span className="text-xs text-[var(--muted-foreground)] font-normal">(entre P75-P90)</span>
            </p>
            <ul className="space-y-1">
              {typeBFailures.map((i) => (
                <li key={i.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                  <span className="text-[var(--foreground)]">{i.pauta_name}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">({i.area})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
