import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { MemoryRouter } from 'react-router-dom'
import { QueryWrapper } from '../../test/testUtils'
import { makePatient, makePatientDetail } from '../../test/mocks'
import HomePage from '../HomePage'
import PatientListPage from '../PatientListPage'
import PatientDetailPage from '../PatientDetailPage'
import * as patientsApi from '../../api/patients'
import * as assessmentsApi from '../../api/assessments'

// Mock de APIs
vi.mock('../../api/patients')
vi.mock('../../api/assessments')
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ getToken: async () => null, userId: null }),
  SignedIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignedOut: () => null,
  UserButton: () => null,
}))

beforeEach(() => {
  vi.resetAllMocks()
})

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryWrapper>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryWrapper>
  )
}

describe('a11y: páginas sin violaciones axe', () => {
  it('HomePage no tiene violaciones de accesibilidad', async () => {
    vi.mocked(patientsApi.usePatients).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof patientsApi.usePatients>)

    const { container } = renderWithProviders(<HomePage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('PatientListPage (sin datos) no tiene violaciones de accesibilidad', async () => {
    vi.mocked(patientsApi.usePatients).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof patientsApi.usePatients>)

    const { container } = renderWithProviders(<PatientListPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('PatientListPage (con datos) no tiene violaciones de accesibilidad', async () => {
    const patients = [
      makePatient({ id: 1, name: 'Ana García', birth_date: '2022-01-01' }),
      makePatient({ id: 2, name: 'Luis Torres', birth_date: '2021-06-15' }),
    ]
    vi.mocked(patientsApi.usePatients).mockReturnValue({
      data: patients,
      isLoading: false,
    } as unknown as ReturnType<typeof patientsApi.usePatients>)

    const { container } = renderWithProviders(<PatientListPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('PatientDetailPage (cargando) no tiene violaciones de accesibilidad', async () => {
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof patientsApi.usePatient>)
    vi.mocked(assessmentsApi.useAssessment).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof assessmentsApi.useAssessment>)

    const { container } = renderWithProviders(<PatientDetailPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('PatientDetailPage (con datos) no tiene violaciones de accesibilidad', async () => {
    const patient = makePatientDetail({
      id: 1,
      name: 'Ana García',
      birth_date: '2022-01-01',
      assessments: [],
    })
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: patient,
      isLoading: false,
    } as unknown as ReturnType<typeof patientsApi.usePatient>)
    vi.mocked(assessmentsApi.useAssessment).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof assessmentsApi.useAssessment>)

    const { container } = renderWithProviders(<PatientDetailPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
