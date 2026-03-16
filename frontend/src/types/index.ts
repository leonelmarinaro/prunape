export interface Patient {
  id: number;
  name: string;
  birth_date: string;
  gestational_age_weeks: number | null;
  created_at: string;
}

export interface PatientDetail extends Patient {
  assessments: Assessment[];
}

export interface Pauta {
  id: number;
  name: string;
  area: string;
  p75: number;
  p90: number;
  tipo_pauta: string;
  rango_aprobacion: string;
}

export interface ApplicablePauta extends Pauta {
  pauta_type: string; // "A" or "B"
}

export interface AgeCalculation {
  chronological_age: number;
  corrected_age: number | null;
  applicable_pautas: ApplicablePauta[];
}

export interface AssessmentItem {
  id: number;
  pauta_id: number;
  pauta_name: string;
  area: string;
  pauta_type: string;
  passed: boolean;
}

export interface Assessment {
  id: number;
  patient_id: number;
  assessment_date: string;
  chronological_age: number;
  corrected_age: number | null;
  result: string;
  created_at: string;
  items: AssessmentItem[];
}

export interface AssessmentItemInput {
  pauta_id: number;
  passed: boolean;
}
