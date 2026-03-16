import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  calculateAge,
  createAssessment,
  getAssessment,
  deleteAssessment,
  getAllPautas,
} from '../assessments'
import * as client from '../client'
import { makeAssessment, makeAgeCalculation, makePauta } from '../../test/mocks'

vi.mock('../client')

beforeEach(() => {
  vi.resetAllMocks()
})

describe('calculateAge', () => {
  it('llama a post /assessments/calculate-age con los datos correctos', async () => {
    const ageCalc = makeAgeCalculation()
    vi.mocked(client.post).mockResolvedValue(ageCalc)

    const data = { patient_id: 1, assessment_date: '2024-06-01' }
    const result = await calculateAge(data)

    expect(client.post).toHaveBeenCalledWith('/assessments/calculate-age', data)
    expect(result).toEqual(ageCalc)
  })
})

describe('createAssessment', () => {
  it('llama a post /assessments con items correctos', async () => {
    const assessment = makeAssessment()
    vi.mocked(client.post).mockResolvedValue(assessment)

    const data = {
      patient_id: 1,
      assessment_date: '2024-06-01',
      items: [{ pauta_id: 1, passed: true }],
    }
    const result = await createAssessment(data)

    expect(client.post).toHaveBeenCalledWith('/assessments', data)
    expect(result).toEqual(assessment)
  })
})

describe('getAssessment', () => {
  it('llama a get /assessments/:id', async () => {
    const assessment = makeAssessment()
    vi.mocked(client.get).mockResolvedValue(assessment)

    const result = await getAssessment(1)

    expect(client.get).toHaveBeenCalledWith('/assessments/1')
    expect(result).toEqual(assessment)
  })
})

describe('deleteAssessment', () => {
  it('llama a del /assessments/:id', async () => {
    vi.mocked(client.del).mockResolvedValue(undefined)

    await deleteAssessment(1)

    expect(client.del).toHaveBeenCalledWith('/assessments/1')
  })
})

describe('getAllPautas', () => {
  it('llama a get /pautas', async () => {
    const pautas = [makePauta()]
    vi.mocked(client.get).mockResolvedValue(pautas)

    const result = await getAllPautas()

    expect(client.get).toHaveBeenCalledWith('/pautas')
    expect(result).toEqual(pautas)
  })
})
