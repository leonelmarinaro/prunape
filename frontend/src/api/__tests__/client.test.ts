import { describe, it, expect, vi, beforeEach } from 'vitest'
import { get, post, put, del } from '../client'

const API_BASE = 'http://localhost:8000/api'

function makeFetchResponse(body: unknown, status = 200, statusText = 'OK') {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: () => Promise.resolve(body),
  } as Response)
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('get', () => {
  it('hace GET al path correcto con Content-Type header', async () => {
    global.fetch = vi.fn().mockReturnValue(makeFetchResponse({ id: 1 }))

    const result = await get<{ id: number }>('/patients')

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE}/patients`,
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      })
    )
    expect(result).toEqual({ id: 1 })
  })
})

describe('post', () => {
  it('hace POST con body serializado', async () => {
    global.fetch = vi.fn().mockReturnValue(makeFetchResponse({ id: 2 }))

    const body = { name: 'Ana' }
    const result = await post<{ id: number }>('/patients', body)

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE}/patients`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      })
    )
    expect(result).toEqual({ id: 2 })
  })
})

describe('put', () => {
  it('hace PUT con body serializado', async () => {
    global.fetch = vi.fn().mockReturnValue(makeFetchResponse({ id: 1, name: 'Ana' }))

    const result = await put<{ id: number; name: string }>('/patients/1', { name: 'Ana' })

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE}/patients/1`,
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ name: 'Ana' }),
      })
    )
    expect(result).toEqual({ id: 1, name: 'Ana' })
  })
})

describe('del', () => {
  it('hace DELETE y retorna undefined en 204', async () => {
    global.fetch = vi.fn().mockReturnValue(
      Promise.resolve({
        ok: true,
        status: 204,
        statusText: 'No Content',
        json: () => Promise.reject(new Error('no body')),
      } as Response)
    )

    const result = await del('/patients/1')

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE}/patients/1`,
      expect.objectContaining({ method: 'DELETE' })
    )
    expect(result).toBeUndefined()
  })
})

describe('manejo de errores', () => {
  it('lanza error con detail cuando la respuesta no es ok', async () => {
    global.fetch = vi.fn().mockReturnValue(
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ detail: 'Paciente no encontrado' }),
      } as Response)
    )

    await expect(get('/patients/999')).rejects.toThrow('Paciente no encontrado')
  })

  it('lanza error genérico cuando no hay detail en el body', async () => {
    global.fetch = vi.fn().mockReturnValue(
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({}),
      } as Response)
    )

    // El cliente usa error.detail || "Error en la solicitud", así que sin detail usa el fallback
    await expect(get('/patients')).rejects.toThrow('Error en la solicitud')
  })

  it('lanza error con statusText cuando el JSON no parsea', async () => {
    global.fetch = vi.fn().mockReturnValue(
      Promise.resolve({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: () => Promise.reject(new Error('invalid json')),
      } as Response)
    )

    await expect(get('/patients')).rejects.toThrow('Service Unavailable')
  })
})
