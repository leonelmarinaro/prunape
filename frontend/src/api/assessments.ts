import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, del } from "./client";
import type { AgeCalculation, Assessment, AssessmentItemInput, Pauta } from "../types";
import { patientKeys } from "./patients";

// --- Fetcher functions (kept for direct usage and as React Query fetchers) ---

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

// --- React Query hooks ---

export const assessmentKeys = {
  all: ['assessments'] as const,
  detail: (id: number) => ['assessments', 'detail', id] as const,
  pautas: ['pautas'] as const,
}

export function useAssessment(id: number | undefined) {
  return useQuery({
    queryKey: assessmentKeys.detail(id!),
    queryFn: () => getAssessment(id!),
    enabled: id !== undefined,
  })
}

export function usePautas() {
  return useQuery({
    queryKey: assessmentKeys.pautas,
    queryFn: getAllPautas,
    staleTime: Infinity,
  })
}

export function useCreateAssessment() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: createAssessment,
    onSuccess: (_data, variables) => {
      void client.invalidateQueries({ queryKey: assessmentKeys.all })
      void client.invalidateQueries({ queryKey: patientKeys.detail(variables.patient_id) })
    },
  })
}

export function useDeleteAssessment() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: deleteAssessment,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: assessmentKeys.all })
    },
  })
}

export function useCalculateAge() {
  return useMutation({
    mutationFn: calculateAge,
  })
}
