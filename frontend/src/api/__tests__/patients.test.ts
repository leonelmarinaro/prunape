import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listPatients, getPatient, createPatient, updatePatient, deletePatient } from '../patients'
import * as client from '../client'
import { makePatient, makePatientDetail } from '../../test/mocks'

vi.mock('../client')

beforeEach(() => {
  vi.resetAllMocks()
})

describe('listPatients', () => {
  it('llama a get /patients sin search', async () => {
    const patients = [makePatient()]
    vi.mocked(client.get).mockResolvedValue(patients)

    const result = await listPatients()

    expect(client.get).toHaveBeenCalledWith('/patients')
    expect(result).toEqual(patients)
  })

  it('llama a get /patients con query de búsqueda', async () => {
    vi.mocked(client.get).mockResolvedValue([])

    await listPatients('Juan')

    expect(client.get).toHaveBeenCalledWith('/patients?search=Juan')
  })

  it('encodes el search query', async () => {
    vi.mocked(client.get).mockResolvedValue([])

    await listPatients('Juan Pérez')

    expect(client.get).toHaveBeenCalledWith('/patients?search=Juan%20P%C3%A9rez')
  })
})

describe('getPatient', () => {
  it('llama a get /patients/:id', async () => {
    const detail = makePatientDetail()
    vi.mocked(client.get).mockResolvedValue(detail)

    const result = await getPatient(1)

    expect(client.get).toHaveBeenCalledWith('/patients/1')
    expect(result).toEqual(detail)
  })
})

describe('createPatient', () => {
  it('llama a post /patients con los datos correctos', async () => {
    const patient = makePatient()
    vi.mocked(client.post).mockResolvedValue(patient)

    const data = { name: 'Juan', birth_date: '2022-01-01', gestational_age_weeks: null }
    const result = await createPatient(data)

    expect(client.post).toHaveBeenCalledWith('/patients', data)
    expect(result).toEqual(patient)
  })
})

describe('updatePatient', () => {
  it('llama a put /patients/:id con los datos correctos', async () => {
    const patient = makePatient({ name: 'Juan Actualizado' })
    vi.mocked(client.put).mockResolvedValue(patient)

    const result = await updatePatient(1, { name: 'Juan Actualizado' })

    expect(client.put).toHaveBeenCalledWith('/patients/1', { name: 'Juan Actualizado' })
    expect(result).toEqual(patient)
  })
})

describe('deletePatient', () => {
  it('llama a del /patients/:id', async () => {
    vi.mocked(client.del).mockResolvedValue(undefined)

    await deletePatient(1)

    expect(client.del).toHaveBeenCalledWith('/patients/1')
  })
})
