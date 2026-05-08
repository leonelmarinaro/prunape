import { lazy, Suspense, useState } from "react"
import { BrowserRouter, Routes, Route, NavLink, useLocation, Link } from "react-router-dom"
import { SignedIn, SignedOut, SignIn, UserButton, useAuth } from "@clerk/clerk-react"
import { setAuthTokenGetter } from "./api/client"
import { cn } from "@/lib/utils"
import { Home, Users } from "lucide-react"

// Lazy imports — cada página se carga solo cuando se necesita
const HomePage = lazy(() => import("@/pages/HomePage"))
const PatientListPage = lazy(() => import("@/pages/PatientListPage"))
const PatientCreatePage = lazy(() => import("@/pages/PatientCreatePage"))
const PatientEditPage = lazy(() => import("@/pages/PatientEditPage"))
const PatientDetailPage = lazy(() => import("@/pages/PatientDetailPage"))
const NewAssessmentPage = lazy(() => import("@/pages/NewAssessmentPage"))
const AssessmentResultPage = lazy(() => import("@/pages/AssessmentResultPage"))

// Skeleton de carga para Suspense
function PageSkeleton() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-pulse space-y-4 w-full max-w-md">
        <div className="h-8 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-32 bg-muted rounded" />
      </div>
    </div>
  )
}

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function AuthSync() {
  const { getToken } = useAuth()
  setAuthTokenGetter(getToken)
  return null
}

const navItems = [
  { to: "/", label: "Inicio", end: true, icon: <Home size={16} /> },
  { to: "/patients", label: "Pacientes", icon: <Users size={16} /> },
]

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-60 bg-white border-r border-[var(--border)] flex flex-col",
          "transition-transform duration-200",
          "lg:static lg:translate-x-0 lg:flex",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Navegación principal"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
          <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 2C8 2 4 5 4 9a4 4 0 008 0c0-4-4-7-4-7z" fill="white" opacity=".9"/>
              <circle cx="8" cy="9" r="1.5" fill="#93c5fd"/>
            </svg>
          </div>
          <div>
            <div className="font-extrabold text-sm text-[var(--primary)] leading-tight">PRUNAPE</div>
            <div className="text-[10px] text-[var(--muted-foreground)] leading-tight">Hospital Garrahan</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "border-l-[3px] border-[var(--primary-accent)] bg-blue-50 font-semibold text-[var(--primary)]"
                    : "border-l-[3px] border-transparent text-[var(--muted-foreground)] hover:bg-slate-50 hover:text-[var(--foreground)]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? "text-[var(--primary-accent)]" : ""}>
                    {item.icon}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--border)]">
          <div className="text-[10px] text-[var(--muted-foreground)] text-center">
            Hospital Garrahan · PRUNAPE
          </div>
        </div>
      </aside>
    </>
  )
}

function usePageLabel(): string {
  const { pathname } = useLocation()
  if (pathname === "/") return "Inicio"
  if (pathname === "/patients/new") return "Nuevo Paciente"
  if (/^\/patients\/\d+\/edit$/.test(pathname)) return "Editar Paciente"
  if (/^\/patients\/\d+\/assess$/.test(pathname)) return "Nueva Evaluación"
  if (/^\/assessments\/\d+$/.test(pathname)) return "Resultado"
  if (/^\/patients\/\d+$/.test(pathname)) return "Ficha de Paciente"
  if (pathname.startsWith("/patients")) return "Pacientes"
  return "PRUNAPE"
}

function useNewAssessmentHref(): string {
  const { pathname } = useLocation()
  const match = pathname.match(/^\/patients\/(\d+)/)
  if (match) return `/patients/${match[1]}/assess`
  return "/patients"
}

function AppShellTopbar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const pageLabel = usePageLabel()
  const newAssessmentHref = useNewAssessmentHref()

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-[var(--border)] px-4 py-2.5 flex items-center gap-3">
      {/* Hamburger mobile */}
      <button
        className="lg:hidden p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        onClick={onMenuOpen}
        aria-label="Abrir menú"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Breadcrumb — solo desktop */}
      <nav aria-label="Ubicación" className="hidden lg:flex items-center gap-1.5 text-sm">
        <span className="text-[var(--muted-foreground)]">PRUNAPE</span>
        <span className="text-[var(--muted-foreground)]">/</span>
        <span className="font-semibold text-[var(--primary)]">{pageLabel}</span>
      </nav>

      {/* Título mobile */}
      <span className="font-semibold text-[var(--foreground)] lg:hidden">PRUNAPE</span>

      <div className="flex-1" />

      {/* Botón Nueva Evaluación — solo desktop */}
      <Link
        to={newAssessmentHref}
        className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary-accent)] text-white text-sm font-semibold rounded-md hover:opacity-90 transition-opacity"
      >
        + Nueva Evaluación
      </Link>

      {CLERK_KEY && <UserButton />}
    </header>
  )
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <BrowserRouter>
      <div className="min-h-screen flex bg-[var(--background)]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          <AppShellTopbar onMenuOpen={() => setSidebarOpen(true)} />

          {/* Page content */}
          <main id="main-content" className="flex-1 p-6 max-w-5xl mx-auto w-full">
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/patients" element={<PatientListPage />} />
                <Route path="/patients/new" element={<PatientCreatePage />} />
                <Route path="/patients/:id/edit" element={<PatientEditPage />} />
                <Route path="/patients/:id" element={<PatientDetailPage />} />
                <Route path="/patients/:id/assess" element={<NewAssessmentPage />} />
                <Route path="/assessments/:id" element={<AssessmentResultPage />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

function App() {
  if (!CLERK_KEY) return <AppShell />

  return (
    <>
      <AuthSync />
      <SignedIn>
        <AppShell />
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]">
          <SignIn routing="hash" />
        </div>
      </SignedOut>
    </>
  )
}

export default App
