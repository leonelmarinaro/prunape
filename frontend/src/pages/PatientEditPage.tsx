import { useParams, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { usePatient, useUpdatePatient } from "../api/patients"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

const today = new Date().toISOString().split("T")[0]

const patientSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  birth_date: z
    .string()
    .min(1, "Fecha de nacimiento requerida")
    .refine((d) => d <= today, "No puede ser fecha futura"),
  gestational_age_weeks: z
    .union([
      z.number().min(20, "Mínimo 20 semanas").max(44, "Máximo 44 semanas"),
      z.nan(),
    ])
    .optional(),
})

type PatientFormValues = z.infer<typeof patientSchema>

export default function PatientEditPage() {
  const { id } = useParams<{ id: string }>()
  const patientId = id ? parseInt(id) : undefined
  const navigate = useNavigate()

  const { data: patient, isLoading } = usePatient(patientId)
  const updatePatient = useUpdatePatient()

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      birth_date: "",
      gestational_age_weeks: undefined,
    },
  })

  // Preload form when patient data arrives
  useEffect(() => {
    if (patient) {
      form.reset({
        name: patient.name,
        birth_date: patient.birth_date,
        gestational_age_weeks: patient.gestational_age_weeks ?? undefined,
      })
    }
  }, [patient, form])

  const nameError = form.formState.errors.name
  const dateError = form.formState.errors.birth_date
  const combinedError =
    nameError || dateError ? "Nombre y fecha de nacimiento son obligatorios." : null

  const serverError = updatePatient.isError
    ? (updatePatient.error instanceof Error
        ? updatePatient.error.message
        : "Error al guardar")
    : null

  const onSubmit = async (values: PatientFormValues) => {
    if (!patientId) return
    const gestWeeks =
      values.gestational_age_weeks !== undefined &&
      !isNaN(values.gestational_age_weeks as number)
        ? (values.gestational_age_weeks as number)
        : null

    try {
      await updatePatient.mutateAsync({
        id: patientId,
        data: {
          name: values.name.trim(),
          birth_date: values.birth_date,
          gestational_age_weeks: gestWeeks,
        },
      })
      navigate(`/patients/${patientId}`)
    } catch {
      // error handled via updatePatient.isError
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-lg space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="bg-white rounded-lg border border-[var(--border)] p-6 space-y-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    )
  }

  if (!patient) return <p>Paciente no encontrado.</p>

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">Editar Paciente</h1>

      <div className="bg-white rounded-lg border border-[var(--border)] p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Nacimiento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gestational_age_weeks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Edad Gestacional (semanas) - opcional</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={20}
                      max={44}
                      placeholder="Dejar vacío si término (>=37 sem)"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value
                        field.onChange(val === "" ? undefined : parseFloat(val))
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {combinedError && (
              <p className="text-sm font-medium text-destructive">{combinedError}</p>
            )}

            {serverError && !combinedError && (
              <p className="text-sm font-medium text-destructive">{serverError}</p>
            )}

            <Button type="submit" disabled={updatePatient.isPending} className="w-full">
              {updatePatient.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
