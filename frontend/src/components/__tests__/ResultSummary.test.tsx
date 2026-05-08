import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResultSummary from '../ResultSummary'
import { makeAssessment, makeAssessmentItem } from '../../test/mocks'

describe('ResultSummary - PASA', () => {
  it('no renderiza nada cuando el resultado es PASA', () => {
    const assessment = makeAssessment({ result: 'PASA' })
    const { container } = render(<ResultSummary assessment={assessment} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('no muestra fallas cuando PASA', () => {
    const assessment = makeAssessment({ result: 'PASA' })
    render(<ResultSummary assessment={assessment} />)

    expect(screen.queryByText(/Fallas Tipo A/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Fallas Tipo B/)).not.toBeInTheDocument()
  })
})

describe('ResultSummary - NO PASA', () => {
  it('no renderiza nada si NO PASA pero no hay items fallidos', () => {
    const assessment = makeAssessment({ result: 'NO_PASA', items: [] })
    const { container } = render(<ResultSummary assessment={assessment} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('muestra fallas tipo A', () => {
    const failedTypeA = makeAssessmentItem({
      id: 2,
      pauta_id: 2,
      pauta_name: 'Señala objetos',
      area: 'Lenguaje',
      pauta_type: 'A',
      passed: false,
    })
    const assessment = makeAssessment({
      result: 'NO_PASA',
      items: [failedTypeA],
    })
    render(<ResultSummary assessment={assessment} />)

    expect(screen.getByText(/Fallas Tipo A/)).toBeInTheDocument()
    expect(screen.getByText(/Señala objetos/)).toBeInTheDocument()
  })

  it('muestra fallas tipo B', () => {
    const failedTypeB = makeAssessmentItem({
      id: 3,
      pauta_id: 3,
      pauta_name: 'Patea pelota',
      area: 'Motor Grueso',
      pauta_type: 'B',
      passed: false,
    })
    const assessment = makeAssessment({
      result: 'NO_PASA',
      items: [failedTypeB],
    })
    render(<ResultSummary assessment={assessment} />)

    expect(screen.getByText(/Fallas Tipo B/)).toBeInTheDocument()
    expect(screen.getByText(/Patea pelota/)).toBeInTheDocument()
  })

  it('muestra el área junto al nombre de la falla', () => {
    const failedItem = makeAssessmentItem({
      pauta_name: 'Camina solo',
      area: 'Motor Grueso',
      pauta_type: 'A',
      passed: false,
    })
    const assessment = makeAssessment({ result: 'NO_PASA', items: [failedItem] })
    render(<ResultSummary assessment={assessment} />)

    expect(screen.getByText(/Camina solo/)).toBeInTheDocument()
    expect(screen.getByText(/Motor Grueso/)).toBeInTheDocument()
  })

  it('no muestra fallas tipo A si todos pasaron', () => {
    const assessment = makeAssessment({
      result: 'NO_PASA',
      items: [
        makeAssessmentItem({ id: 1, pauta_id: 1, pauta_type: 'B', passed: false }),
      ],
    })
    render(<ResultSummary assessment={assessment} />)

    expect(screen.queryByText(/Fallas Tipo A/)).not.toBeInTheDocument()
  })
})
