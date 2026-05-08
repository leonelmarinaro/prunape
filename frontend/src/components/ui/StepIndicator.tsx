import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  steps: string[]
  current: number // 1-based
  onBack?: (step: number) => void
}

export function StepIndicator({ steps, current, onBack }: StepIndicatorProps) {
  return (
    <ol role="list" aria-label="Pasos de la evaluación" className="flex items-center w-full mb-6">
      {steps.map((label, idx) => {
        const step = idx + 1
        const isCompleted = step < current
        const isActive = step === current
        const isPending = step > current
        const isClickable = isCompleted && !!onBack

        return (
          <li
            key={label}
            role="listitem"
            aria-current={isActive ? "step" : undefined}
            aria-label={isCompleted ? `${label}: completado` : undefined}
            aria-disabled={isPending ? "true" : undefined}
            onClick={isClickable ? () => onBack!(step) : undefined}
            className="flex items-center flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                disabled={!isClickable}
                onClick={isClickable ? () => onBack!(step) : undefined}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                  isCompleted && "bg-green-600 text-white",
                  isActive && "bg-[var(--primary-accent)] text-white",
                  isPending && "bg-slate-200 text-slate-400 cursor-default",
                  isClickable && "cursor-pointer hover:opacity-80"
                )}
                aria-label={
                  isClickable ? `Volver al paso ${step}: ${label}` : undefined
                }
              >
                {isCompleted ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 7l3.5 3.5L12 3"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  step
                )}
              </button>
              <span
                className={cn(
                  "text-[10px] font-medium whitespace-nowrap",
                  isCompleted && "text-green-600",
                  isActive && "text-[var(--primary-accent)]",
                  isPending && "text-slate-400"
                )}
              >
                {label}
              </span>
            </div>

            {/* Línea conectora */}
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mb-5 mx-1",
                  isCompleted ? "bg-green-500" : "bg-slate-200"
                )}
                aria-hidden="true"
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
