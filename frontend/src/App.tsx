import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PatientListPage from "./pages/PatientListPage";
import PatientCreatePage from "./pages/PatientCreatePage";
import PatientDetailPage from "./pages/PatientDetailPage";
import NewAssessmentPage from "./pages/NewAssessmentPage";
import AssessmentResultPage from "./pages/AssessmentResultPage";

function App() {
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
          <Link to="/" style={{ color: "white", textDecoration: "none", fontWeight: "bold", fontSize: "1.2rem" }}>
            PRUNAPE
          </Link>
          <Link to="/patients" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>
            Pacientes
          </Link>
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

export default App;
