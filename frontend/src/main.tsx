import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ErrorBoundary } from "react-error-boundary";
import "./index.css";
import App from "./App.tsx";
import { queryClient } from "@/api/queryClient";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert" style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Ocurrió un error inesperado</h2>
      <pre style={{ color: "red", fontSize: "0.875rem" }}>{error.message}</pre>
    </div>
  );
}

async function mount() {
  const root = createRoot(document.getElementById("root")!);

  if (PUBLISHABLE_KEY) {
    const { ClerkProvider } = await import("@clerk/clerk-react");
    root.render(
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <StrictMode>
              <App />
            </StrictMode>
          </ClerkProvider>
          <Toaster richColors closeButton />
        </ErrorBoundary>
      </QueryClientProvider>
    );
  } else {
    root.render(
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <StrictMode>
            <App />
          </StrictMode>
          <Toaster richColors closeButton />
        </ErrorBoundary>
      </QueryClientProvider>
    );
  }
}

mount();
