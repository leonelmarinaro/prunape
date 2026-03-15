import { get, post, put, del } from "./client";
import type { Patient, PatientDetail } from "../types";

export function listPatients(search = "") {
  const q = search ? `?search=${encodeURIComponent(search)}` : "";
  return get<Patient[]>(`/patients${q}`);
}

export function getPatient(id: number) {
  return get<PatientDetail>(`/patients/${id}`);
}

export function createPatient(data: {
  name: string;
  birth_date: string;
  gestational_age_weeks?: number | null;
}) {
  return post<Patient>("/patients", data);
}

export function updatePatient(
  id: number,
  data: Partial<{ name: string; birth_date: string; gestational_age_weeks: number | null }>
) {
  return put<Patient>(`/patients/${id}`, data);
}

export function deletePatient(id: number) {
  return del(`/patients/${id}`);
}
