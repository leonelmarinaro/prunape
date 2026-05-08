import { useEffect, useRef } from "react"

export interface WizardState {
  currentStep: number
  responses: Record<number, boolean>
}

export function useWizardAutosave(
  key: string,
  state: WizardState,
  onHydrate: (state: WizardState) => void
) {
  const isFirstRender = useRef(true)

  // Hidratar al montar
  useEffect(() => {
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as WizardState
        onHydrate({
          currentStep: parsed.currentStep ?? 1,
          responses: parsed.responses ?? {},
        })
      } catch {
        // ignorar estado corrupto
      }
    }
    // Solo se ejecuta al montar (key como dep)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Guardar en cada cambio (no en mount)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  const clear = () => {
    localStorage.removeItem(key)
  }

  return { clear }
}
