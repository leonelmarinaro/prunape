import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PatientListPage from '../PatientListPage'
import * as patientsApi from '../../api/patients'
import { makePatient } from '../../test/mocks'

vi.mock('../../api/patients')

function renderPage() {
  return render(
    <MemoryRouter>
      <PatientListPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('PatientListPage', () => {
  it('muestra el estado de carga inicial', () => {
    vi.mocked(patientsApi.listPatients).mockResolvedValue([])
    renderPage()
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('muestra la lista de pacientes después de cargar', async () => {
    const patients = [
      makePatient({ id: 1, name: 'Juan Pérez', birth_date: '2022-01-15' }),
      makePatient({ id: 2, name: 'María García', birth_date: '2021-05-10' }),
    ]
    vi.mocked(patientsApi.listPatients).mockResolvedValue(patients)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
      expect(screen.getByText('María García')).toBeInTheDocument()
    })
  })

  it('muestra mensaje cuando no hay pacientes', async () => {
    vi.mocked(patientsApi.listPatients).mockResolvedValue([])

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('No se encontraron pacientes.')).toBeInTheDocument()
    })
  })

  it('muestra "Término" cuando gestational_age_weeks es null', async () => {
    const patients = [makePatient({ gestational_age_weeks: null })]
    vi.mocked(patientsApi.listPatients).mockResolvedValue(patients)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Término')).toBeInTheDocument()
    })
  })

  it('muestra semanas gestacionales cuando están disponibles', async () => {
    const patients = [makePatient({ gestational_age_weeks: 34 })]
    vi.mocked(patientsApi.listPatients).mockResolvedValue(patients)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('34')).toBeInTheDocument()
    })
  })

  it('tiene un link para crear nuevo paciente', async () => {
    vi.mocked(patientsApi.listPatients).mockResolvedValue([])

    renderPage()

    await waitFor(() => {
      const link = screen.getByText('+ Nuevo Paciente')
      expect(link.closest('a')).toHaveAttribute('href', '/patients/new')
    })
  })

  it('muestra input de búsqueda', () => {
    vi.mocked(patientsApi.listPatients).mockResolvedValue([])
    renderPage()
    expect(screen.getByPlaceholderText('Buscar por nombre...')).toBeInTheDocument()
  })

  it('los pacientes tienen links a su detalle', async () => {
    const patients = [makePatient({ id: 5, name: 'Pedro López' })]
    vi.mocked(patientsApi.listPatients).mockResolvedValue(patients)

    renderPage()

    await waitFor(() => {
      const link = screen.getByText('Pedro López')
      expect(link.closest('a')).toHaveAttribute('href', '/patients/5')
    })
  })

  it('llama a listPatients con el término de búsqueda después del debounce', async () => {
    const user = userEvent.setup({ delay: null })
    vi.mocked(patientsApi.listPatients).mockResolvedValue([])

    renderPage()
    await waitFor(() => expect(patientsApi.listPatients).toHaveBeenCalledWith(''))

    const input = screen.getByPlaceholderText('Buscar por nombre...')
    await user.type(input, 'Juan')

    await waitFor(
      () => expect(patientsApi.listPatients).toHaveBeenCalledWith('Juan'),
      { timeout: 1000 }
    )
  })
})
