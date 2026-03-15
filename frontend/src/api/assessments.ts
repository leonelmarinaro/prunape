import { get, post, del } from "./client";
import type { AgeCalculation, Assessment, AssessmentItemInput, Pauta } from "../types";

export function calculateAge(data: {
  patient_id?: number;
  birth_date?: string;
  gestational_age_weeks?: number | null;
  assessment_date: string;
}) {
  return post<AgeCalculation>("/assessments/calculate-age", data);
}

export function createAssessment(data: {
  patient_id: number;
  assessment_date: string;
  items: AssessmentItemInput[];
}) {
  return post<Assessment>("/assessments", data);
}

export function getAssessment(id: number) {
  return get<Assessment>(`/assessments/${id}`);
}

export function deleteAssessment(id: number) {
  return del(`/assessments/${id}`);
}

export function getAllPautas() {
  return get<Pauta[]>("/pautas");
}
