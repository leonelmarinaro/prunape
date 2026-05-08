import { useState } from "react"
import { Link } from "react-router-dom"
import { usePatients } from "../api/patients"
import { useDebounce } from "../hooks/useDebounce"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SkeletonTable } from "@/components/ui/SkeletonTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { AvatarInitials } from "@/components/ui/AvatarInitials"

const PAGE_SIZE = 10

function formatBirthDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-AR")
}

export default function PatientListPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 300)
  const { data: patients = [], isLoading } = usePatients(debouncedSearch)

  const totalPages = Math.max(1, Math.ceil(patients.length / PAGE_SIZE))
  const paginated = patients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Pacientes</h1>
        <Button asChild size="sm" className="bg-[var(--primary-accent)] text-white hover:opacity-90">
          <Link to="/patients/new">+ Nuevo Paciente</Link>
        </Button>
      </div>

      {/* Búsqueda */}
      <Input
        type="text"
        placeholder="Buscar por nombre..."
        value={search}
        onChange={handleSearchChange}
        className="max-w-sm"
      />

      {/* Contenido */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
          <p className="sr-only">Cargando...</p>
          <SkeletonTable columns={3} rows={5} />
        </div>
      ) : patients.length === 0 ? (
        <EmptyState
          title="No se encontraron pacientes."
          description={
            debouncedSearch
              ? `No hay pacientes que coincidan con "${debouncedSearch}".`
              : "Todavía no hay pacientes registrados."
          }
          action={
            !debouncedSearch ? (
              <Button asChild>
                <Link to="/patients/new">Crear primer paciente</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Tabla con scroll horizontal en mobile */}
          <div className="bg-white rounded-lg border border-[var(--border)] overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden sm:table-cell">Fecha de Nacimiento</TableHead>
                  <TableHead className="hidden sm:table-cell">EG (sem)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <AvatarInitials name={p.name} size="sm" />
                        <div>
                          <Link
                            to={`/patients/${p.id}`}
                            className="font-medium text-[var(--primary-accent)] hover:underline block"
                          >
                            {p.name}
                          </Link>
                          <div className="sm:hidden text-xs text-[var(--muted-foreground)] mt-0.5">
                            {formatBirthDate(p.birth_date)}
                            {p.gestational_age_weeks != null && (
                              <> &bull; EG: {p.gestational_age_weeks} sem</>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{formatBirthDate(p.birth_date)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {p.gestational_age_weeks ?? "Término"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-[var(--muted-foreground)]">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
