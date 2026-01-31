import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { Toaster } from "sonner";
import { LeadDashboard } from "./components/LeadDashboard";
import { EngineerDashboard } from "./components/EngineerDashboard";
import { ContractorMobile } from "./components/ContractorMobile";
import React from "react";

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
  // 1. Get the Role from the backend
  const role = useQuery(api.roles.getMyRole);

  // 2. Mobile Detection Service
  const isMobile = useIsMobile();

  // Loading state while role fetch is pending
  if (role === undefined) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  const isEngineer = role === "engineer";

  // 3. Routing Logic
  if (isEngineer) {
    // If engineer is on mobile, show the optimized mobile view
    if (isMobile) {
      return <ContractorMobile />;
    }
    // Otherwise show the desktop dashboard
    return <EngineerDashboard />;
  }

  // Default to Lead Dashboard for non-engineers (Leads/Admins)
  return <LeadDashboard />;
}

// Simple hook for mobile detection
import { useIsMobile } from "./hooks/use-mobile";
