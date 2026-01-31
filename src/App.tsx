import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { Toaster } from "sonner";
import { LeadDashboard } from "./components/LeadDashboard";
import { EngineerDashboard } from "./components/EngineerDashboard";
import { ContractorMobile } from "./components/ContractorMobile";
import { FinanceDashboard } from "./components/FinanceDashboard";
import { StockDashboard } from "./components/StockDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import React from "react";

import { LanguageProvider } from "./contexts/LanguageContext";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { useIsMobile } from "./hooks/use-mobile";

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
  // Get the role with permissions from the backend
  const roleData = useQuery(api.roles.getMyRoleWithPermissions);
  const isMobile = useIsMobile();

  // Loading state while role fetch is pending
  if (roleData === undefined) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  const role = roleData?.role || "engineer";

  // Route based on role
  switch (role) {
    case "admin":
      return <AdminDashboard />;

    case "acting_manager":
      // Acting managers see the lead dashboard with full access
      return <LeadDashboard />;

    case "engineering_lead":
      return <LeadDashboard />;

    case "finance_manager":
      return <FinanceDashboard />;

    case "stock_manager":
      return <StockDashboard />;

    case "engineer":
    default:
      // Engineers on mobile get the optimized mobile view
      if (isMobile) {
        return <ContractorMobile />;
      }
      return <EngineerDashboard />;
  }
}
