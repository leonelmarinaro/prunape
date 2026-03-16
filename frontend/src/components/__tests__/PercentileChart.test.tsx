import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PercentileChart from '../PercentileChart'
import { makePauta, makeAssessmentItem } from '../../test/mocks'

const motorGrueso = makePauta({ id: 1, area: 'Motor Grueso', name: 'Sostiene cabeza', p75: 0.17, p90: 0.25 })
const lenguaje = makePauta({ id: 2, area: 'Lenguaje', name: 'Primeras palabras', p75: 0.75, p90: 1.0 })

describe('PercentileChart', () => {
  it('renderiza el componente sin errores', () => {
    const { container } = render(
      <PercentileChart pautas={[motorGrueso]} childAgeYears={2} />
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('muestra el SVG', () => {
    const { container } = render(
      <PercentileChart pautas={[motorGrueso]} childAgeYears={2} />
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('muestra la edad del niño en el eje', () => {
    render(<PercentileChart pautas={[motorGrueso]} childAgeYears={2.5} />)

    expect(screen.getByText(/2\.50 años/)).toBeInTheDocument()
  })

  it('muestra el nombre de la pauta', () => {
    render(<PercentileChart pautas={[motorGrueso]} childAgeYears={2} />)

    expect(screen.getByText('Sostiene cabeza')).toBeInTheDocument()
  })

  it('muestra los headers de área con pautas disponibles', () => {
    const pautas = [motorGrueso, lenguaje]
    render(<PercentileChart pautas={pautas} childAgeYears={1} />)

    expect(screen.getByText('Motor Grueso')).toBeInTheDocument()
    expect(screen.getByText('Lenguaje')).toBeInTheDocument()
  })

  it('no muestra áreas sin pautas', () => {
    render(<PercentileChart pautas={[motorGrueso]} childAgeYears={1} />)

    expect(screen.queryByText('Personal Social')).not.toBeInTheDocument()
    expect(screen.queryByText('Motor Fino')).not.toBeInTheDocument()
  })

  it('muestra leyenda con categorías', () => {
    render(<PercentileChart pautas={[motorGrueso]} childAgeYears={1} />)

    expect(screen.getByText('Cumple')).toBeInTheDocument()
    expect(screen.getByText('No cumple (Tipo A)')).toBeInTheDocument()
    expect(screen.getByText('No cumple (Tipo B)')).toBeInTheDocument()
    expect(screen.getByText('No evaluada')).toBeInTheDocument()
  })

  it('renderiza correctamente con assessmentItems', () => {
    const item = makeAssessmentItem({ pauta_id: 1, passed: true })
    render(
      <PercentileChart
        pautas={[motorGrueso]}
        childAgeYears={2}
        assessmentItems={[item]}
      />
    )
    expect(screen.getByText('Sostiene cabeza')).toBeInTheDocument()
  })

  it('trunca nombres de pauta largos', () => {
    const longName = makePauta({
      name: 'Esta es una pauta con nombre muy muy largo que debería ser truncado',
      area: 'Motor Grueso',
    })
    render(<PercentileChart pautas={[longName]} childAgeYears={1} />)

    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renderiza con pautas vacías', () => {
    const { container } = render(<PercentileChart pautas={[]} childAgeYears={2} />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
