import { useParams, Link } from "react-router-dom"
import { usePatient } from "../api/patients"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AvatarInitials } from "@/components/ui/AvatarInitials"
import { EmptyState } from "@/components/ui/EmptyState"
import { cn } from "@/lib/utils"

function calcAge(birthDate: string): string {
  const birth = new Date(birthDate + "T00:00:00")
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()
  const totalMonths = years * 12 + months
  if (totalMonths < 24) {
    return `${totalMonths} meses`
  }
  const y = Math.floor(totalMonths / 12)
  const m = totalMonths % 12
  return m > 0 ? `${y} años ${m} meses` : `${y} años`
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const patientId = id ? parseInt(id) : undefined
  const { data: patient, isLoading: loading } = usePatient(patientId)

  if (loading) return <p>Cargando...</p>
  if (!patient) return <p>Paciente no encontrado.</p>

  const age = calcAge(patient.birth_date)

  return (
    <div className="space-y-6">
      {/* Header con avatar */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-6">
        <div className="flex items-start gap-4">
          <AvatarInitials name={patient.name} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold truncate">{patient.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-[var(--muted-foreground)]">
              <span>
                <strong>Nacimiento:</strong>{" "}
                {new Date(patient.birth_date + "T00:00:00").toLocaleDateString("es-AR")}
              </span>
              <span>
                <strong>Edad:</strong> {age}
              </span>
              <span>
                <strong>Edad Gestacional:</strong>{" "}
                {patient.gestational_age_weeks
                  ? `${patient.gestational_age_weeks} semanas`
                  : "Término"}
              </span>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link to={`/patients/${patient.id}/edit`}>Editar</Link>
          </Button>
        </div>
      </div>

      {/* Evaluaciones */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Evaluaciones</h2>
          <Button asChild size="sm">
            <Link to={`/patients/${patient.id}/assess`}>+ Nueva Evaluación</Link>
          </Button>
        </div>

        {patient.assessments.length === 0 ? (
          <EmptyState
            title="Sin evaluaciones registradas."
            description="Realizá la primera pesquisa para este paciente."
            action={
              <Button asChild>
                <Link to={`/patients/${patient.id}/assess`}>Iniciar pesquisa</Link>
              </Button>
            }
          />
        ) : (
          <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Edad Cronológica</TableHead>
                  <TableHead>Edad Corregida</TableHead>
                  <TableHead>Resultado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.assessments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Link
                        to={`/assessments/${a.id}`}
                        className="text-[var(--primary)] hover:underline"
                      >
                        {new Date(a.assessment_date + "T00:00:00").toLocaleDateString("es-AR")}
                      </Link>
                    </TableCell>
                    <TableCell>{a.chronological_age.toFixed(2)} años</TableCell>
                    <TableCell>
                      {a.corrected_age != null
                        ? `${a.corrected_age.toFixed(2)} años`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          a.result === "PASA"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        )}
                        variant="outline"
                      >
                        {a.result === "PASA" ? "PASA" : "NO PASA"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
