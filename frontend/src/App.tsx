import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { SignedIn, SignedOut, SignIn, UserButton, useAuth } from "@clerk/clerk-react";
import { setAuthTokenGetter } from "./api/client";
import HomePage from "./pages/HomePage";
import PatientListPage from "./pages/PatientListPage";
import PatientCreatePage from "./pages/PatientCreatePage";
import PatientDetailPage from "./pages/PatientDetailPage";
import NewAssessmentPage from "./pages/NewAssessmentPage";
import AssessmentResultPage from "./pages/AssessmentResultPage";

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function AuthSync() {
  const { getToken } = useAuth();
  setAuthTokenGetter(getToken);
  return null;
}

function AppShell() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", background: "#f5f7fa" }}>
        <nav
          style={{
            background: "#1a56db",
            color: "white",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <Link
            to="/"
            style={{
              color: "white",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "1.2rem",
            }}
          >
            PRUNAPE
          </Link>
          <Link
            to="/patients"
            style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}
          >
            Pacientes
          </Link>
          {CLERK_KEY && (
            <div style={{ marginLeft: "auto" }}>
              <UserButton />
            </div>
          )}
        </nav>
        <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px" }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/patients" element={<PatientListPage />} />
            <Route path="/patients/new" element={<PatientCreatePage />} />
            <Route path="/patients/:id" element={<PatientDetailPage />} />
            <Route path="/patients/:id/assess" element={<NewAssessmentPage />} />
            <Route path="/assessments/:id" element={<AssessmentResultPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function App() {
  if (!CLERK_KEY) return <AppShell />;

  return (
    <>
      <AuthSync />
      <SignedIn>
        <AppShell />
      </SignedIn>
      <SignedOut>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f5f7fa",
          }}
        >
          <SignIn routing="hash" />
        </div>
      </SignedOut>
    </>
  );
}

export default App;
