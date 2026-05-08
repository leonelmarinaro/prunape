import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { StepIndicator } from "../StepIndicator"

describe("StepIndicator", () => {
  const steps = ["Fecha", "Evaluación", "Resultado"]

  it("marca el paso activo con aria-current", () => {
    render(<StepIndicator steps={steps} current={2} />)
    const items = screen.getAllByRole("listitem")
    expect(items[1]).toHaveAttribute("aria-current", "step")
  })

  it("marca pasos completados como aria-label completado", () => {
    render(<StepIndicator steps={steps} current={2} />)
    const items = screen.getAllByRole("listitem")
    expect(items[0]).toHaveAttribute("aria-label", "Fecha: completado")
  })

  it("marca pasos futuros como aria-disabled", () => {
    render(<StepIndicator steps={steps} current={2} />)
    const items = screen.getAllByRole("listitem")
    expect(items[2]).toHaveAttribute("aria-disabled", "true")
  })

  it("llama onBack al clickear un paso anterior", async () => {
    const onBack = vi.fn()
    render(<StepIndicator steps={steps} current={3} onBack={onBack} />)
    const items = screen.getAllByRole("listitem")
    items[0].click()
    expect(onBack).toHaveBeenCalledWith(1)
  })
})
