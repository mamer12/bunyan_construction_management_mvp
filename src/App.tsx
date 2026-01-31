import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { Toaster } from "sonner";
import { LeadDashboard } from "./components/LeadDashboard";
import { EngineerDashboard } from "./components/EngineerDashboard";

import { LanguageProvider } from "./contexts/LanguageContext";

import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }
          }}
        />
        <Content />
      </LanguageProvider>
    </ErrorBoundary>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <>
      <Authenticated>
        <MainApp />
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </>
  );
}

function MainApp() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  // Role determination: "lead" in email = Lead Dashboard, otherwise Engineer
  const isLead = loggedInUser?.email?.toLowerCase().includes("lead") ||
    loggedInUser?.email?.toLowerCase().includes("admin") ||
    loggedInUser?.email?.toLowerCase().includes("manager");

  if (isLead) {
    return <LeadDashboard />;
  } else {
    return <EngineerDashboard />;
  }
}
