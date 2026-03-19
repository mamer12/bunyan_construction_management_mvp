import { useState } from "react";
import { Toaster } from "sonner";
import { LeadDashboard } from "./components/LeadDashboard";
import { EngineerDashboard } from "./components/EngineerDashboard";
import { ContractorMobile } from "./components/ContractorMobile";
import { FinanceDashboard } from "./components/FinanceDashboard";
import { StockDashboard } from "./components/StockDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { LandingPage } from "./components/LandingPage";
import { SignInForm } from "./SignInForm";

import { LanguageProvider } from "./contexts/LanguageContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useIsMobile } from "./hooks/use-mobile";
import { useMockData } from "./mocks/MockDataContext";

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
  const { isAuthenticated } = useMockData();
  const [showLanding, setShowLanding] = useState(true);

  return (
    <>
      {isAuthenticated ? (
        <MainApp />
      ) : (
        <>
          {showLanding ? (
            <LandingPage onGetStarted={() => setShowLanding(false)} />
          ) : (
            <SignInForm onBack={() => setShowLanding(true)} />
          )}
        </>
      )}
    </>
  );
}

function MainApp() {
  const { user } = useMockData();
  const isMobile = useIsMobile();

  const role = user?.role || "engineer";

  // Route based on role
  switch (role) {
    case "admin":
      return <AdminDashboard />;

    case "acting_manager":
      return <LeadDashboard />;

    case "engineering_lead":
      return <LeadDashboard />;

    case "finance_manager":
      return <FinanceDashboard />;

    case "stock_manager":
      return <StockDashboard />;

    case "engineer":
    default:
      if (isMobile) {
        return <ContractorMobile />;
      }
      return <EngineerDashboard />;
  }
}
