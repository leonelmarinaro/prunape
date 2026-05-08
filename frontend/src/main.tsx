import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

async function mount() {
  const root = createRoot(document.getElementById("root")!);

  if (PUBLISHABLE_KEY) {
    const { ClerkProvider } = await import("@clerk/clerk-react");
    root.render(
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <StrictMode>
          <App />
        </StrictMode>
      </ClerkProvider>
    );
  } else {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
}

mount();
