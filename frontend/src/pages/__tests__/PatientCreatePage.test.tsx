import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PatientCreatePage from '../PatientCreatePage'
import * as patientsApi from '../../api/patients'
import { makePatient } from '../../test/mocks'

vi.mock('../../api/patients')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderPage() {
  return render(
    <MemoryRouter>
      <PatientCreatePage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('PatientCreatePage', () => {
  it('muestra el formulario de creación', () => {
    renderPage()

    expect(screen.getByText('Nuevo Paciente')).toBeInTheDocument()
    expect(screen.getByText('Nombre')).toBeInTheDocument()
    expect(screen.getByText('Fecha de Nacimiento')).toBeInTheDocument()
  })

  it('muestra error si se envía sin nombre', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByText('Crear Paciente'))

    expect(screen.getByText('Nombre y fecha de nacimiento son obligatorios.')).toBeInTheDocument()
  })

  it('muestra error si se envía sin fecha', async () => {
    const user = userEvent.setup()
    renderPage()

    const nameInput = screen.getByRole('textbox')
    await user.type(nameInput, 'Juan')
    await user.click(screen.getByText('Crear Paciente'))

    expect(screen.getByText('Nombre y fecha de nacimiento son obligatorios.')).toBeInTheDocument()
  })

  it('llama a createPatient y navega al detalle del paciente', async () => {
    const user = userEvent.setup()
    const patient = makePatient({ id: 7 })
    vi.mocked(patientsApi.createPatient).mockResolvedValue(patient)

    const { fireEvent } = await import('@testing-library/react')
    renderPage()

    await user.type(screen.getByRole('textbox'), 'Juan Pérez')

    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    fireEvent.change(dateInput, { target: { value: '2022-01-15' } })

    await user.click(screen.getByText('Crear Paciente'))

    await waitFor(() => {
      expect(patientsApi.createPatient).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Juan Pérez' })
      )
      expect(mockNavigate).toHaveBeenCalledWith('/patients/7')
    })
  })

  it('muestra error cuando createPatient falla', async () => {
    const user = userEvent.setup()
    vi.mocked(patientsApi.createPatient).mockRejectedValue(new Error('Error del servidor'))

    renderPage()

    const nameInput = screen.getByRole('textbox')
    await user.type(nameInput, 'Juan')

    // Set date via fireEvent since userEvent has issues with date inputs
    const { fireEvent } = await import('@testing-library/react')
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    fireEvent.change(dateInput, { target: { value: '2022-01-15' } })

    await user.click(screen.getByText('Crear Paciente'))

    await waitFor(() => {
      expect(screen.getByText('Error del servidor')).toBeInTheDocument()
    })
  })

  it('muestra "Guardando..." mientras se envía', async () => {
    vi.mocked(patientsApi.createPatient).mockImplementation(
      () => new Promise(() => {}) // never resolves
    )

    const { fireEvent } = await import('@testing-library/react')

    renderPage()

    const nameInput = screen.getByRole('textbox')
    fireEvent.change(nameInput, { target: { value: 'Juan' } })

    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    fireEvent.change(dateInput, { target: { value: '2022-01-15' } })

    const submitBtn = screen.getByText('Crear Paciente')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Guardando...')).toBeInTheDocument()
    })
  })

  it('incluye el campo de edad gestacional opcional', () => {
    renderPage()
    expect(screen.getByText(/Edad Gestacional/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Dejar vacío si término/)).toBeInTheDocument()
  })
})
