import { useState } from "react"
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom"
import { SignedIn, SignedOut, SignIn, UserButton, useAuth } from "@clerk/clerk-react"
import { setAuthTokenGetter } from "./api/client"
import { cn } from "@/lib/utils"
import HomePage from "./pages/HomePage"
import PatientListPage from "./pages/PatientListPage"
import PatientCreatePage from "./pages/PatientCreatePage"
import PatientEditPage from "./pages/PatientEditPage"
import PatientDetailPage from "./pages/PatientDetailPage"
import NewAssessmentPage from "./pages/NewAssessmentPage"
import AssessmentResultPage from "./pages/AssessmentResultPage"

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function AuthSync() {
  const { getToken } = useAuth()
  setAuthTokenGetter(getToken)
  return null
}

const navItems = [
  { to: "/", label: "Inicio", end: true },
  { to: "/patients", label: "Pacientes" },
]

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
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
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[var(--border)]">
          <span className="font-bold text-lg text-[var(--primary)]">PRUNAPE</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer del sidebar */}
        <div className="px-6 py-4 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
          Hospital Garrahan
        </div>
      </aside>
    </>
  )
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <BrowserRouter>
      <div className="min-h-screen flex bg-[#f5f7fa]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <header className="sticky top-0 z-10 bg-white border-b border-[var(--border)] px-4 py-3 flex items-center gap-3">
            {/* Hamburger mobile */}
            <button
              className="lg:hidden p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>

            <span className="font-semibold text-[var(--foreground)] lg:hidden">PRUNAPE</span>

            <div className="flex-1" />

            {CLERK_KEY && <UserButton />}
          </header>

          {/* Page content */}
          <main id="main-content" className="flex-1 p-6 max-w-5xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/patients" element={<PatientListPage />} />
              <Route path="/patients/new" element={<PatientCreatePage />} />
              <Route path="/patients/:id/edit" element={<PatientEditPage />} />
              <Route path="/patients/:id" element={<PatientDetailPage />} />
              <Route path="/patients/:id/assess" element={<NewAssessmentPage />} />
              <Route path="/assessments/:id" element={<AssessmentResultPage />} />
            </Routes>
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
