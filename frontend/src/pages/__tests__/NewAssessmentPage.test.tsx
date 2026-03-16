import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import NewAssessmentPage from '../NewAssessmentPage'
import * as patientsApi from '../../api/patients'
import * as assessmentsApi from '../../api/assessments'
import { makePatientDetail, makeAgeCalculation, makeAssessment, makeApplicablePauta } from '../../test/mocks'

vi.mock('../../api/patients')
vi.mock('../../api/assessments')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderPage(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/patients/${id}/assess`]}>
      <Routes>
        <Route path="/patients/:id/assess" element={<NewAssessmentPage />} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('NewAssessmentPage', () => {
  it('muestra cargando mientras se obtiene el paciente', () => {
    vi.mocked(patientsApi.getPatient).mockResolvedValue(makePatientDetail())
    renderPage()
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('muestra el nombre del paciente en el título', async () => {
    const detail = makePatientDetail({ name: 'Ana Sosa' })
    vi.mocked(patientsApi.getPatient).mockResolvedValue(detail)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/Ana Sosa/)).toBeInTheDocument()
    })
  })

  it('muestra el paso inicial con fecha y botón Comenzar', async () => {
    vi.mocked(patientsApi.getPatient).mockResolvedValue(makePatientDetail())

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Comenzar Evaluación')).toBeInTheDocument()
      expect(screen.getByText('Fecha de Evaluación')).toBeInTheDocument()
    })
  })

  it('avanza al paso evaluate al hacer click en Comenzar Evaluación', async () => {
    const user = userEvent.setup()
    const patient = makePatientDetail()
    const ageCalc = makeAgeCalculation({
      applicable_pautas: [makeApplicablePauta({ id: 1, name: 'Sostiene cabeza', area: 'Motor Grueso' })],
    })

    vi.mocked(patientsApi.getPatient).mockResolvedValue(patient)
    vi.mocked(assessmentsApi.calculateAge).mockResolvedValue(ageCalc)

    renderPage()

    await waitFor(() => screen.getByText('Comenzar Evaluación'))

    await user.click(screen.getByText('Comenzar Evaluación'))

    await waitFor(() => {
      expect(screen.getByText('Edad Cronológica:')).toBeInTheDocument()
    })
  })

  it('muestra las pautas de evaluación en el paso evaluate', async () => {
    const user = userEvent.setup()
    const patient = makePatientDetail()
    const ageCalc = makeAgeCalculation({
      applicable_pautas: [
        makeApplicablePauta({ id: 1, name: 'Sostiene cabeza', area: 'Motor Grueso' }),
      ],
    })

    vi.mocked(patientsApi.getPatient).mockResolvedValue(patient)
    vi.mocked(assessmentsApi.calculateAge).mockResolvedValue(ageCalc)

    renderPage()
    await waitFor(() => screen.getByText('Comenzar Evaluación'))
    await user.click(screen.getByText('Comenzar Evaluación'))

    await waitFor(() => {
      expect(screen.getByText('Sostiene cabeza')).toBeInTheDocument()
    })
  })

  it('el botón Revisar está deshabilitado hasta que se responden todas las pautas', async () => {
    const user = userEvent.setup()
    const patient = makePatientDetail()
    const ageCalc = makeAgeCalculation({
      applicable_pautas: [makeApplicablePauta({ id: 1, area: 'Motor Grueso' })],
    })

    vi.mocked(patientsApi.getPatient).mockResolvedValue(patient)
    vi.mocked(assessmentsApi.calculateAge).mockResolvedValue(ageCalc)

    renderPage()
    await waitFor(() => screen.getByText('Comenzar Evaluación'))
    await user.click(screen.getByText('Comenzar Evaluación'))

    await waitFor(() => {
      const btn = screen.getByText('Revisar y Enviar')
      expect(btn).toBeDisabled()
    })
  })

  it('permite avanzar al paso de revisión cuando todas las pautas están respondidas', async () => {
    const user = userEvent.setup()
    const patient = makePatientDetail()
    const ageCalc = makeAgeCalculation({
      applicable_pautas: [makeApplicablePauta({ id: 1, area: 'Motor Grueso', name: 'Sostiene cabeza' })],
    })

    vi.mocked(patientsApi.getPatient).mockResolvedValue(patient)
    vi.mocked(assessmentsApi.calculateAge).mockResolvedValue(ageCalc)

    renderPage()
    await waitFor(() => screen.getByText('Comenzar Evaluación'))
    await user.click(screen.getByText('Comenzar Evaluación'))

    await waitFor(() => screen.getByText('Cumple'))
    await user.click(screen.getByText('Cumple'))

    const reviewBtn = screen.getByText('Revisar y Enviar')
    expect(reviewBtn).not.toBeDisabled()
    await user.click(reviewBtn)

    await waitFor(() => {
      expect(screen.getByText('Resumen de Respuestas')).toBeInTheDocument()
    })
  })

  it('envía la evaluación y navega al resultado', async () => {
    const user = userEvent.setup()
    const patient = makePatientDetail()
    const ageCalc = makeAgeCalculation({
      applicable_pautas: [makeApplicablePauta({ id: 1, area: 'Motor Grueso', name: 'Sostiene cabeza' })],
    })
    const assessment = makeAssessment({ id: 99 })

    vi.mocked(patientsApi.getPatient).mockResolvedValue(patient)
    vi.mocked(assessmentsApi.calculateAge).mockResolvedValue(ageCalc)
    vi.mocked(assessmentsApi.createAssessment).mockResolvedValue(assessment)

    renderPage('1')
    await waitFor(() => screen.getByText('Comenzar Evaluación'))
    await user.click(screen.getByText('Comenzar Evaluación'))

    await waitFor(() => screen.getByText('Cumple'))
    await user.click(screen.getByText('Cumple'))
    await user.click(screen.getByText('Revisar y Enviar'))

    await waitFor(() => screen.getByText('Confirmar Evaluación'))
    await user.click(screen.getByText('Confirmar Evaluación'))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/assessments/99')
    })
  })

  it('muestra error cuando calculateAge falla', async () => {
    const user = userEvent.setup()
    vi.mocked(patientsApi.getPatient).mockResolvedValue(makePatientDetail())
    vi.mocked(assessmentsApi.calculateAge).mockRejectedValue(new Error('Error de cálculo'))

    renderPage()
    await waitFor(() => screen.getByText('Comenzar Evaluación'))
    await user.click(screen.getByText('Comenzar Evaluación'))

    await waitFor(() => {
      expect(screen.getByText('Error de cálculo')).toBeInTheDocument()
    })
  })

  it('permite volver a editar desde el paso de revisión', async () => {
    const user = userEvent.setup()
    const patient = makePatientDetail()
    const ageCalc = makeAgeCalculation({
      applicable_pautas: [makeApplicablePauta({ id: 1, area: 'Motor Grueso', name: 'Sostiene cabeza' })],
    })

    vi.mocked(patientsApi.getPatient).mockResolvedValue(patient)
    vi.mocked(assessmentsApi.calculateAge).mockResolvedValue(ageCalc)

    renderPage()
    await waitFor(() => screen.getByText('Comenzar Evaluación'))
    await user.click(screen.getByText('Comenzar Evaluación'))
    await waitFor(() => screen.getByText('Cumple'))
    await user.click(screen.getByText('Cumple'))
    await user.click(screen.getByText('Revisar y Enviar'))
    await waitFor(() => screen.getByText('Volver a Editar'))
    await user.click(screen.getByText('Volver a Editar'))

    await waitFor(() => {
      expect(screen.getByText('Revisar y Enviar')).toBeInTheDocument()
    })
  })

  it('muestra la edad cronológica en el paso evaluate', async () => {
    const user = userEvent.setup()
    const patient = makePatientDetail()
    const ageCalc = makeAgeCalculation({
      chronological_age: 2.5,
      applicable_pautas: [makeApplicablePauta({ id: 1, area: 'Motor Grueso' })],
    })

    vi.mocked(patientsApi.getPatient).mockResolvedValue(patient)
    vi.mocked(assessmentsApi.calculateAge).mockResolvedValue(ageCalc)

    renderPage()
    await waitFor(() => screen.getByText('Comenzar Evaluación'))
    await user.click(screen.getByText('Comenzar Evaluación'))

    await waitFor(() => {
      expect(screen.getByText(/2\.50/)).toBeInTheDocument()
    })
  })

  it('muestra la edad corregida cuando existe', async () => {
    const user = userEvent.setup()
    const patient = makePatientDetail()
    const ageCalc = makeAgeCalculation({
      chronological_age: 2.5,
      corrected_age: 2.0,
      applicable_pautas: [makeApplicablePauta({ id: 1, area: 'Motor Grueso' })],
    })

    vi.mocked(patientsApi.getPatient).mockResolvedValue(patient)
    vi.mocked(assessmentsApi.calculateAge).mockResolvedValue(ageCalc)

    renderPage()
    await waitFor(() => screen.getByText('Comenzar Evaluación'))
    await user.click(screen.getByText('Comenzar Evaluación'))

    await waitFor(() => {
      expect(screen.getByText(/Edad Corregida:/)).toBeInTheDocument()
    })
  })
})
