import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PautaCard from '../PautaCard'
import { makeApplicablePauta } from '../../test/mocks'

describe('PautaCard', () => {
  it('muestra el nombre de la pauta', () => {
    const pauta = makeApplicablePauta({ name: 'Sostiene cabeza' })
    render(<PautaCard pauta={pauta} answer={undefined} onAnswer={vi.fn()} />)

    expect(screen.getByText('Sostiene cabeza')).toBeInTheDocument()
  })

  it('muestra el tipo de pauta', () => {
    const pauta = makeApplicablePauta({ pauta_type: 'A' })
    render(<PautaCard pauta={pauta} answer={undefined} onAnswer={vi.fn()} />)

    expect(screen.getByText('Tipo A')).toBeInTheDocument()
  })

  it('muestra el tipo B correctamente', () => {
    const pauta = makeApplicablePauta({ pauta_type: 'B' })
    render(<PautaCard pauta={pauta} answer={undefined} onAnswer={vi.fn()} />)

    expect(screen.getByText('Tipo B')).toBeInTheDocument()
  })

  it('muestra P75 y P90', () => {
    const pauta = makeApplicablePauta({ p75: 1.5, p90: 2.0 })
    render(<PautaCard pauta={pauta} answer={undefined} onAnswer={vi.fn()} />)

    expect(screen.getByText(/P75: 1\.50/)).toBeInTheDocument()
    expect(screen.getByText(/P90: 2\.00/)).toBeInTheDocument()
  })

  it('muestra botones Cumple y No cumple', () => {
    const pauta = makeApplicablePauta()
    render(<PautaCard pauta={pauta} answer={undefined} onAnswer={vi.fn()} />)

    expect(screen.getByText('Cumple')).toBeInTheDocument()
    expect(screen.getByText('No cumple')).toBeInTheDocument()
  })

  it('llama onAnswer con true al hacer click en Cumple', async () => {
    const user = userEvent.setup()
    const onAnswer = vi.fn()
    const pauta = makeApplicablePauta()
    render(<PautaCard pauta={pauta} answer={undefined} onAnswer={onAnswer} />)

    await user.click(screen.getByText('Cumple'))

    expect(onAnswer).toHaveBeenCalledWith(true)
  })

  it('llama onAnswer con false al hacer click en No cumple', async () => {
    const user = userEvent.setup()
    const onAnswer = vi.fn()
    const pauta = makeApplicablePauta()
    render(<PautaCard pauta={pauta} answer={undefined} onAnswer={onAnswer} />)

    await user.click(screen.getByText('No cumple'))

    expect(onAnswer).toHaveBeenCalledWith(false)
  })

  it('aplica estilo activo al botón Cumple cuando answer es true', () => {
    const pauta = makeApplicablePauta()
    render(<PautaCard pauta={pauta} answer={true} onAnswer={vi.fn()} />)

    const cumpleBtn = screen.getByText('Cumple')
    expect(cumpleBtn).toHaveStyle({ background: '#059669' })
  })

  it('aplica estilo activo al botón No cumple cuando answer es false', () => {
    const pauta = makeApplicablePauta()
    render(<PautaCard pauta={pauta} answer={false} onAnswer={vi.fn()} />)

    const noCumpleBtn = screen.getByText('No cumple')
    expect(noCumpleBtn).toHaveStyle({ background: '#dc2626' })
  })

  it('aplica borde rojo para pauta tipo A', () => {
    const pauta = makeApplicablePauta({ pauta_type: 'A' })
    const { container } = render(<PautaCard pauta={pauta} answer={undefined} onAnswer={vi.fn()} />)

    const card = container.firstChild as HTMLElement
    expect(card).toHaveStyle({ borderLeft: '4px solid #ef4444' })
  })

  it('aplica borde amarillo para pauta tipo B', () => {
    const pauta = makeApplicablePauta({ pauta_type: 'B' })
    const { container } = render(<PautaCard pauta={pauta} answer={undefined} onAnswer={vi.fn()} />)

    const card = container.firstChild as HTMLElement
    expect(card).toHaveStyle({ borderLeft: '4px solid #f59e0b' })
  })
})
