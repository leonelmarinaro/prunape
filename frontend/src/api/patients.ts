import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put, del } from "./client";
import type { Patient, PatientDetail } from "../types";

// --- Fetcher functions (kept for direct usage and as React Query fetchers) ---

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

// --- React Query hooks ---

export const patientKeys = {
  all: ['patients'] as const,
  list: (search = '') => ['patients', 'list', search] as const,
  detail: (id: number) => ['patients', 'detail', id] as const,
}

export function usePatients(search = "") {
  return useQuery({
    queryKey: patientKeys.list(search),
    queryFn: () => listPatients(search),
  })
}

export function usePatient(id: number | undefined) {
  return useQuery({
    queryKey: patientKeys.detail(id!),
    queryFn: () => getPatient(id!),
    enabled: id !== undefined,
  })
}

export function useCreatePatient() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: patientKeys.all })
    },
  })
}

export function useUpdatePatient() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ name: string; birth_date: string; gestational_age_weeks: number | null }> }) =>
      updatePatient(id, data),
    onSuccess: (_data, variables) => {
      void client.invalidateQueries({ queryKey: patientKeys.all })
      void client.invalidateQueries({ queryKey: patientKeys.detail(variables.id) })
    },
  })
}

export function useDeletePatient() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: deletePatient,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: patientKeys.all })
    },
  })
}
