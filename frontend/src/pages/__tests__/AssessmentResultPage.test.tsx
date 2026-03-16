import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AssessmentResultPage from '../AssessmentResultPage'
import * as assessmentsApi from '../../api/assessments'
import { makeAssessment, makePauta, makeAssessmentItem } from '../../test/mocks'

vi.mock('../../api/assessments')

function renderPage(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/assessments/${id}`]}>
      <Routes>
        <Route path="/assessments/:id" element={<AssessmentResultPage />} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('AssessmentResultPage', () => {
  it('muestra cargando inicialmente', () => {
    vi.mocked(assessmentsApi.getAssessment).mockResolvedValue(makeAssessment())
    vi.mocked(assessmentsApi.getAllPautas).mockResolvedValue([])
    renderPage()
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('muestra el resultado de la evaluación', async () => {
    const assessment = makeAssessment({ result: 'PASA' })
    vi.mocked(assessmentsApi.getAssessment).mockResolvedValue(assessment)
    vi.mocked(assessmentsApi.getAllPautas).mockResolvedValue([])

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Resultado de Evaluación')).toBeInTheDocument()
    })
  })

  it('muestra PASA cuando el resultado es PASA', async () => {
    const assessment = makeAssessment({ result: 'PASA' })
    vi.mocked(assessmentsApi.getAssessment).mockResolvedValue(assessment)
    vi.mocked(assessmentsApi.getAllPautas).mockResolvedValue([])

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('PASA')).toBeInTheDocument()
    })
  })

  it('muestra NO PASA cuando el resultado es NO_PASA', async () => {
    const failedItem = makeAssessmentItem({ passed: false, pauta_type: 'A' })
    const assessment = makeAssessment({ result: 'NO_PASA', items: [failedItem] })
    vi.mocked(assessmentsApi.getAssessment).mockResolvedValue(assessment)
    vi.mocked(assessmentsApi.getAllPautas).mockResolvedValue([])

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('NO PASA')).toBeInTheDocument()
    })
  })

  it('muestra la edad cronológica', async () => {
    const assessment = makeAssessment({ chronological_age: 3.25, corrected_age: null })
    vi.mocked(assessmentsApi.getAssessment).mockResolvedValue(assessment)
    vi.mocked(assessmentsApi.getAllPautas).mockResolvedValue([])

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/3\.25/)).toBeInTheDocument()
    })
  })

  it('muestra la edad corregida cuando existe', async () => {
    const assessment = makeAssessment({ chronological_age: 3.0, corrected_age: 2.5 })
    vi.mocked(assessmentsApi.getAssessment).mockResolvedValue(assessment)
    vi.mocked(assessmentsApi.getAllPautas).mockResolvedValue([])

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/2\.50/)).toBeInTheDocument()
    })
  })

  it('muestra el gráfico de percentiles cuando hay pautas', async () => {
    const assessment = makeAssessment()
    const pautas = [makePauta({ area: 'Motor Grueso' })]
    vi.mocked(assessmentsApi.getAssessment).mockResolvedValue(assessment)
    vi.mocked(assessmentsApi.getAllPautas).mockResolvedValue(pautas)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Gráfico de Percentiles')).toBeInTheDocument()
    })
  })

  it('no muestra el gráfico cuando no hay pautas', async () => {
    const assessment = makeAssessment()
    vi.mocked(assessmentsApi.getAssessment).mockResolvedValue(assessment)
    vi.mocked(assessmentsApi.getAllPautas).mockResolvedValue([])

    renderPage()

    await waitFor(() => {
      expect(screen.queryByText('Gráfico de Percentiles')).not.toBeInTheDocument()
    })
  })

  it('tiene link de vuelta al paciente', async () => {
    const assessment = makeAssessment({ patient_id: 5 })
    vi.mocked(assessmentsApi.getAssessment).mockResolvedValue(assessment)
    vi.mocked(assessmentsApi.getAllPautas).mockResolvedValue([])

    renderPage()

    await waitFor(() => {
      const link = screen.getByText(/Volver al paciente/)
      expect(link.closest('a')).toHaveAttribute('href', '/patients/5')
    })
  })

  it('tiene botón de imprimir', async () => {
    const assessment = makeAssessment()
    vi.mocked(assessmentsApi.getAssessment).mockResolvedValue(assessment)
    vi.mocked(assessmentsApi.getAllPautas).mockResolvedValue([])

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Imprimir')).toBeInTheDocument()
    })
  })

  it('llama a getAssessment con el id de la ruta', async () => {
    vi.mocked(assessmentsApi.getAssessment).mockResolvedValue(makeAssessment())
    vi.mocked(assessmentsApi.getAllPautas).mockResolvedValue([])

    renderPage('42')

    await waitFor(() => {
      expect(assessmentsApi.getAssessment).toHaveBeenCalledWith(42)
    })
  })

  it('llama a window.print al hacer click en Imprimir', async () => {
    const user = userEvent.setup()
    const printMock = vi.fn()
    window.print = printMock

    const assessment = makeAssessment()
    vi.mocked(assessmentsApi.getAssessment).mockResolvedValue(assessment)
    vi.mocked(assessmentsApi.getAllPautas).mockResolvedValue([])

    renderPage()

    await waitFor(() => screen.getByText('Imprimir'))
    await user.click(screen.getByText('Imprimir'))

    expect(printMock).toHaveBeenCalled()
  })
})
