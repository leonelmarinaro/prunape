import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from '../HomePage'

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  )
}

describe('HomePage', () => {
  it('muestra el título PRUNAPE', () => {
    renderHomePage()
    expect(screen.getByText('PRUNAPE')).toBeInTheDocument()
  })

  it('muestra la descripción del sistema', () => {
    renderHomePage()
    expect(screen.getByText(/Prueba Nacional de Pesquisa/)).toBeInTheDocument()
  })

  it('tiene link a Ver Pacientes', () => {
    renderHomePage()
    const link = screen.getByText('Ver Pacientes')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/patients')
  })

  it('tiene link a Nuevo Paciente', () => {
    renderHomePage()
    const link = screen.getByText('Nuevo Paciente')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/patients/new')
  })
})
