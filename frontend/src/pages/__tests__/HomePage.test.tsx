import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryWrapper } from '../../test/testUtils'
import { makePatient } from '../../test/mocks'
import HomePage from '../HomePage'
import * as patientsApi from '../../api/patients'

vi.mock('../../api/patients')

beforeEach(() => {
  vi.resetAllMocks()
})

function renderHomePage() {
  return render(
    <QueryWrapper>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </QueryWrapper>
  )
}

describe('HomePage', () => {
  it('muestra el título Inicio', () => {
    vi.mocked(patientsApi.usePatients).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof patientsApi.usePatients>)

    renderHomePage()
    expect(screen.getByRole('heading', { name: 'Inicio' })).toBeInTheDocument()
  })

  it('muestra la descripción del sistema', () => {
    vi.mocked(patientsApi.usePatients).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof patientsApi.usePatients>)

    renderHomePage()
    expect(screen.getByText(/Prueba Nacional de Pesquisa/)).toBeInTheDocument()
  })

  it('tiene link a Ver Pacientes', () => {
    vi.mocked(patientsApi.usePatients).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof patientsApi.usePatients>)

    renderHomePage()
    const links = screen.getAllByRole('link', { name: /Ver Pacientes|Ver todos/i })
    expect(links.length).toBeGreaterThan(0)
    expect(links[0].closest('a')).toHaveAttribute('href', '/patients')
  })

  it('muestra link a registrar primer paciente cuando no hay pacientes', () => {
    vi.mocked(patientsApi.usePatients).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof patientsApi.usePatients>)

    renderHomePage()
    const link = screen.getByText('Registrar primer paciente')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/patients/new')
  })

  it('muestra lista de pacientes recientes cuando hay datos', () => {
    const patients = [
      makePatient({ id: 1, name: 'Ana García', birth_date: '2022-01-01' }),
      makePatient({ id: 2, name: 'Luis Torres', birth_date: '2021-06-15' }),
    ]
    vi.mocked(patientsApi.usePatients).mockReturnValue({
      data: patients,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof patientsApi.usePatients>)

    renderHomePage()
    expect(screen.getByText('Ana García')).toBeInTheDocument()
    expect(screen.getByText('Luis Torres')).toBeInTheDocument()
  })

  it('muestra mensaje de error cuando falla la carga', () => {
    vi.mocked(patientsApi.usePatients).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof patientsApi.usePatients>)

    renderHomePage()
    expect(screen.getByText(/No se pudieron cargar los pacientes/)).toBeInTheDocument()
  })
})
