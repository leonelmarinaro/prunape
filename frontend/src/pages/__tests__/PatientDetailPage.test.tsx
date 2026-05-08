import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import PatientDetailPage from '../PatientDetailPage'
import * as patientsApi from '../../api/patients'
import { makePatientDetail, makeAssessment } from '../../test/mocks'
import { QueryWrapper } from '../../test/testUtils'

vi.mock('../../api/patients')

function renderPage(id = '1') {
  return render(
    <QueryWrapper>
      <MemoryRouter initialEntries={[`/patients/${id}`]}>
        <Routes>
          <Route path="/patients/:id" element={<PatientDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryWrapper>
  )
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('PatientDetailPage', () => {
  it('muestra cargando inicialmente', () => {
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof patientsApi.usePatient>)
    renderPage()
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('muestra nombre del paciente', async () => {
    const detail = makePatientDetail({ name: 'Carlos López' })
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: detail,
      isLoading: false,
    } as ReturnType<typeof patientsApi.usePatient>)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Carlos López')).toBeInTheDocument()
    })
  })

  it('muestra "Término" cuando no hay edad gestacional', async () => {
    const detail = makePatientDetail({ gestational_age_weeks: null })
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: detail,
      isLoading: false,
    } as ReturnType<typeof patientsApi.usePatient>)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Término')).toBeInTheDocument()
    })
  })

  it('muestra las semanas gestacionales cuando están presentes', async () => {
    const detail = makePatientDetail({ gestational_age_weeks: 32 })
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: detail,
      isLoading: false,
    } as ReturnType<typeof patientsApi.usePatient>)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('32 semanas')).toBeInTheDocument()
    })
  })

  it('muestra mensaje sin evaluaciones cuando la lista está vacía', async () => {
    const detail = makePatientDetail({ assessments: [] })
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: detail,
      isLoading: false,
    } as ReturnType<typeof patientsApi.usePatient>)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Sin evaluaciones registradas.')).toBeInTheDocument()
    })
  })

  it('muestra las evaluaciones del paciente', async () => {
    const assessment = makeAssessment({ id: 10, result: 'PASA', chronological_age: 2.5 })
    const detail = makePatientDetail({ assessments: [assessment] })
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: detail,
      isLoading: false,
    } as ReturnType<typeof patientsApi.usePatient>)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('PASA')).toBeInTheDocument()
    })
  })

  it('muestra "NO PASA" para evaluaciones fallidas', async () => {
    const assessment = makeAssessment({ id: 11, result: 'NO_PASA', chronological_age: 1.5 })
    const detail = makePatientDetail({ assessments: [assessment] })
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: detail,
      isLoading: false,
    } as ReturnType<typeof patientsApi.usePatient>)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('NO PASA')).toBeInTheDocument()
    })
  })

  it('tiene link a nueva evaluación', async () => {
    const detail = makePatientDetail({ id: 5 })
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: detail,
      isLoading: false,
    } as ReturnType<typeof patientsApi.usePatient>)

    renderPage('5')

    await waitFor(() => {
      const link = screen.getByText('+ Nueva Evaluación')
      expect(link.closest('a')).toHaveAttribute('href', '/patients/5/assess')
    })
  })

  it('las filas de evaluaciones son clickeables y navegan al resultado', async () => {
    const assessment = makeAssessment({ id: 20, result: 'PASA', assessment_date: '2024-06-01' })
    const detail = makePatientDetail({ assessments: [assessment] })
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: detail,
      isLoading: false,
    } as ReturnType<typeof patientsApi.usePatient>)

    let capturedLocation = ''
    function LocationCapture() {
      const loc = useLocation()
      capturedLocation = loc.pathname
      return null
    }

    render(
      <QueryWrapper>
        <MemoryRouter initialEntries={['/patients/1']}>
          <Routes>
            <Route path="/patients/:id" element={<PatientDetailPage />} />
            <Route path="/assessments/:id" element={<LocationCapture />} />
          </Routes>
        </MemoryRouter>
      </QueryWrapper>
    )

    await waitFor(() => {
      // toLocaleDateString('es-AR') produces "1/6/2024" format
      expect(screen.getByText(/\/6\/2024/)).toBeInTheDocument()
    })

    const row = screen.getByText(/\/6\/2024/).closest('tr')
    expect(row).toHaveClass('cursor-pointer')
    fireEvent.click(row!)

    await waitFor(() => {
      expect(capturedLocation).toBe('/assessments/20')
    })
  })

  it('llama a usePatient con el id de la ruta', async () => {
    vi.mocked(patientsApi.usePatient).mockReturnValue({
      data: makePatientDetail(),
      isLoading: false,
    } as ReturnType<typeof patientsApi.usePatient>)

    renderPage('42')

    await waitFor(() => {
      expect(patientsApi.usePatient).toHaveBeenCalledWith(42)
    })
  })
})
