import type {
  Patient,
  PatientDetail,
  Pauta,
  ApplicablePauta,
  AgeCalculation,
  AssessmentItem,
  Assessment,
} from '../types'

export function makePatient(overrides: Partial<Patient> = {}): Patient {
  return {
    id: 1,
    name: 'Juan Pérez',
    birth_date: '2022-01-15',
    gestational_age_weeks: null,
    created_at: '2024-01-01T00:00:00',
    ...overrides,
  }
}

export function makePauta(overrides: Partial<Pauta> = {}): Pauta {
  return {
    id: 1,
    name: 'Sostiene cabeza',
    area: 'Motor Grueso',
    p75: 0.17,
    p90: 0.25,
    tipo_pauta: 'Obligatorio',
    rango_aprobacion: '0-0.25',
    ...overrides,
  }
}

export function makeApplicablePauta(overrides: Partial<ApplicablePauta> = {}): ApplicablePauta {
  return {
    ...makePauta(overrides),
    pauta_type: 'A',
    ...overrides,
  }
}

export function makeAssessmentItem(overrides: Partial<AssessmentItem> = {}): AssessmentItem {
  return {
    id: 1,
    pauta_id: 1,
    pauta_name: 'Sostiene cabeza',
    area: 'Motor Grueso',
    pauta_type: 'A',
    passed: true,
    ...overrides,
  }
}

export function makeAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    id: 1,
    patient_id: 1,
    assessment_date: '2024-06-01',
    chronological_age: 2.5,
    corrected_age: null,
    result: 'PASA',
    created_at: '2024-06-01T10:00:00',
    items: [makeAssessmentItem()],
    ...overrides,
  }
}

export function makeAgeCalculation(overrides: Partial<AgeCalculation> = {}): AgeCalculation {
  return {
    chronological_age: 2.5,
    corrected_age: null,
    applicable_pautas: [makeApplicablePauta()],
    ...overrides,
  }
}

export function makePatientDetail(overrides: Partial<PatientDetail> = {}): PatientDetail {
  return {
    ...makePatient(),
    assessments: [],
    ...overrides,
  }
}
