import { useMemo } from "react"
import { Link } from "react-router-dom"
import { usePatients } from "../api/patients"
import { Button } from "@/components/ui/button"
import { AvatarInitials } from "@/components/ui/AvatarInitials"
import { SkeletonTable } from "@/components/ui/SkeletonTable"

export default function HomePage() {
  const { data: patients = [], isLoading, isError } = usePatients()

  const recentPatients = useMemo(
    () => [...patients].sort((a, b) => b.id - a.id).slice(0, 5),
    [patients]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Inicio</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
          Prueba Nacional de Pesquisa — Sistema de Evaluación del Desarrollo Infantil
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-[var(--border)] p-4">
          <div className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
            Total Pacientes
          </div>
          {isLoading ? (
            <div className="h-8 w-12 bg-slate-200 animate-pulse rounded" />
          ) : (
            <div className="text-3xl font-extrabold text-[var(--primary)]">{patients.length}</div>
          )}
          <div className="text-xs text-[var(--muted-foreground)] mt-1">registrados</div>
        </div>

        <div className="bg-white rounded-lg border border-[var(--border)] p-4 sm:col-span-2 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-[var(--muted-foreground)]">
              Para ver estadísticas de evaluaciones por mes y tasa de aprobación, accedé al historial de cada paciente.
            </p>
          </div>
          <Button asChild size="sm" className="bg-[var(--primary-accent)] text-white shrink-0">
            <Link to="/patients">Ver Pacientes</Link>
          </Button>
        </div>
      </div>

      {/* Últimos pacientes registrados */}
      <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <span className="text-sm font-bold text-[var(--primary)]">Últimos pacientes registrados</span>
          <Link to="/patients" className="text-xs text-[var(--primary-accent)] font-medium hover:underline">
            Ver todos →
          </Link>
        </div>

        {isLoading && <SkeletonTable columns={2} rows={4} />}

        {isError && (
          <p className="text-sm text-[var(--muted-foreground)] px-4 py-6 text-center">
            No se pudieron cargar los pacientes.
          </p>
        )}

        {!isLoading && !isError && patients.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-[var(--muted-foreground)] mb-3">Todavía no hay pacientes registrados.</p>
            <Button asChild size="sm" className="bg-[var(--primary-accent)] text-white">
              <Link to="/patients/new">Registrar primer paciente</Link>
            </Button>
          </div>
        )}

        {!isLoading && !isError && recentPatients.length > 0 && (
          <ul>
            {recentPatients.map((p) => (
              <li key={p.id} className="border-b border-[var(--border)] last:border-0">
                <Link
                  to={`/patients/${p.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                >
                  <AvatarInitials name={p.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--foreground)] truncate">{p.name}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {new Date(p.birth_date + "T00:00:00").toLocaleDateString("es-AR")}
                      {p.gestational_age_weeks != null && ` · EG: ${p.gestational_age_weeks} sem`}
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300" aria-hidden="true">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round"/>
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
