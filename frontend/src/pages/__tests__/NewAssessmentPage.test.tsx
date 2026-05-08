import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import NewAssessmentPage from '../NewAssessmentPage'
import * as patientsApi from '../../api/patients'
import * as assessmentsApi from '../../api/assessments'
import { makePatientDetail, makeAgeCalculation, makeAssessment, makeApplicablePauta } from '../../test/mocks'
import { QueryWrapper } from '../../test/testUtils'

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
    <QueryWrapper>
      <MemoryRouter initialEntries={[`/patients/${id}/assess`]}>
        <Routes>
          <Route path="/patients/:id/assess" element={<NewAssessmentPage />} />
        </Routes>
      </MemoryRouter>
    </QueryWrapper>
  )
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('NewAssessmentPage', () => {
  it('muestra cargando mientras se obtiene el paciente', () => {
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof patientsApi.usePatient>)
    vi.mocked(assessmentsApi.useCalculateAge).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCalculateAge>)
    vi.mocked(assessmentsApi.useCreateAssessment).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCreateAssessment>)
    renderPage()
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('muestra el nombre del paciente en el título', async () => {
    const detail = makePatientDetail({ name: 'Ana Sosa' })
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: detail,
      isLoading: false,
    } as ReturnType<typeof patientsApi.usePatient>)
    vi.mocked(assessmentsApi.useCalculateAge).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCalculateAge>)
    vi.mocked(assessmentsApi.useCreateAssessment).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCreateAssessment>)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/Ana Sosa/)).toBeInTheDocument()
    })
  })

  it('muestra el paso inicial con fecha y botón Comenzar', async () => {
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: makePatientDetail(),
      isLoading: false,
    } as ReturnType<typeof patientsApi.usePatient>)
    vi.mocked(assessmentsApi.useCalculateAge).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCalculateAge>)
    vi.mocked(assessmentsApi.useCreateAssessment).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCreateAssessment>)

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

    const mutateAsyncCalcAge = vi.fn().mockResolvedValue(ageCalc)
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: patient,
      isLoading: false,
    } as ReturnType<typeof patientsApi.usePatient>)
    vi.mocked(assessmentsApi.useCalculateAge).mockReturnValue({
      mutateAsync: mutateAsyncCalcAge,
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCalculateAge>)
    vi.mocked(assessmentsApi.useCreateAssessment).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCreateAssessment>)

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

    const mutateAsyncCalcAge = vi.fn().mockResolvedValue(ageCalc)
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: patient,
      isLoading: false,
    } as ReturnType<typeof patientsApi.usePatient>)
    vi.mocked(assessmentsApi.useCalculateAge).mockReturnValue({
      mutateAsync: mutateAsyncCalcAge,
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCalculateAge>)
    vi.mocked(assessmentsApi.useCreateAssessment).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCreateAssessment>)

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

    const mutateAsyncCalcAge = vi.fn().mockResolvedValue(ageCalc)
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: patient,
      isLoading: false,
    } as ReturnType<typeof patientsApi.usePatient>)
    vi.mocked(assessmentsApi.useCalculateAge).mockReturnValue({
      mutateAsync: mutateAsyncCalcAge,
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCalculateAge>)
    vi.mocked(assessmentsApi.useCreateAssessment).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCreateAssessment>)

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

    const mutateAsyncCalcAge = vi.fn().mockResolvedValue(ageCalc)
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: patient,
      isLoading: false,
    } as ReturnType<typeof patientsApi.usePatient>)
    vi.mocked(assessmentsApi.useCalculateAge).mockReturnValue({
      mutateAsync: mutateAsyncCalcAge,
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCalculateAge>)
    vi.mocked(assessmentsApi.useCreateAssessment).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCreateAssessment>)

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

    const mutateAsyncCalcAge = vi.fn().mockResolvedValue(ageCalc)
    const mutateAsyncCreate = vi.fn().mockResolvedValue(assessment)
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: patient,
      isLoading: false,
    } as ReturnType<typeof patientsApi.usePatient>)
    vi.mocked(assessmentsApi.useCalculateAge).mockReturnValue({
      mutateAsync: mutateAsyncCalcAge,
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCalculateAge>)
    vi.mocked(assessmentsApi.useCreateAssessment).mockReturnValue({
      mutateAsync: mutateAsyncCreate,
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCreateAssessment>)

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
    const mutateAsyncCalcAge = vi.fn().mockRejectedValue(new Error('Error de cálculo'))
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: makePatientDetail(),
      isLoading: false,
    } as ReturnType<typeof patientsApi.usePatient>)
    vi.mocked(assessmentsApi.useCalculateAge).mockReturnValue({
      mutateAsync: mutateAsyncCalcAge,
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCalculateAge>)
    vi.mocked(assessmentsApi.useCreateAssessment).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCreateAssessment>)

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

    const mutateAsyncCalcAge = vi.fn().mockResolvedValue(ageCalc)
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: patient,
      isLoading: false,
    } as ReturnType<typeof patientsApi.usePatient>)
    vi.mocked(assessmentsApi.useCalculateAge).mockReturnValue({
      mutateAsync: mutateAsyncCalcAge,
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCalculateAge>)
    vi.mocked(assessmentsApi.useCreateAssessment).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCreateAssessment>)

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

    const mutateAsyncCalcAge = vi.fn().mockResolvedValue(ageCalc)
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: patient,
      isLoading: false,
    } as ReturnType<typeof patientsApi.usePatient>)
    vi.mocked(assessmentsApi.useCalculateAge).mockReturnValue({
      mutateAsync: mutateAsyncCalcAge,
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCalculateAge>)
    vi.mocked(assessmentsApi.useCreateAssessment).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCreateAssessment>)

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

    const mutateAsyncCalcAge = vi.fn().mockResolvedValue(ageCalc)
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: patient,
      isLoading: false,
    } as ReturnType<typeof patientsApi.usePatient>)
    vi.mocked(assessmentsApi.useCalculateAge).mockReturnValue({
      mutateAsync: mutateAsyncCalcAge,
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCalculateAge>)
    vi.mocked(assessmentsApi.useCreateAssessment).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof assessmentsApi.useCreateAssessment>)

    renderPage()
    await waitFor(() => screen.getByText('Comenzar Evaluación'))
    await user.click(screen.getByText('Comenzar Evaluación'))

    await waitFor(() => {
      expect(screen.getByText(/Edad Corregida:/)).toBeInTheDocument()
    })
  })
})
