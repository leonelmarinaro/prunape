import { useParams, Link, useNavigate } from "react-router-dom"
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
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Header con avatar */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-5">
        <div className="flex items-start gap-4">
          <AvatarInitials name={patient.name} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate text-[var(--foreground)]">{patient.name}</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{age}</p>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link to={`/patients/${patient.id}/edit`}>Editar</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-slate-50 rounded-md p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-0.5">Nacimiento</div>
            <div className="text-sm font-semibold text-[var(--primary)]">
              {new Date(patient.birth_date + "T00:00:00").toLocaleDateString("es-AR")}
            </div>
          </div>
          <div className="bg-slate-50 rounded-md p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-0.5">Edad Gestacional</div>
            <div className="text-sm font-semibold text-[var(--primary)]">
              {patient.gestational_age_weeks ? `${patient.gestational_age_weeks} semanas` : "Término"}
            </div>
          </div>
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
                  <TableRow
                    key={a.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => navigate(`/assessments/${a.id}`)}
                  >
                    <TableCell>
                      {new Date(a.assessment_date + "T00:00:00").toLocaleDateString("es-AR")}
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
                          "text-xs font-bold rounded-full border-0",
                          a.result === "PASA"
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-700"
                        )}
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
