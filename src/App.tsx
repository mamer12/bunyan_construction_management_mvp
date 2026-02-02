import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import React, { useEffect } from "react";
import { Toaster } from "sonner";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { LeadDashboard } from "./components/LeadDashboard";
import { EngineerDashboard } from "./components/EngineerDashboard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LanguageProvider } from "./contexts/LanguageContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { StockDashboard } from "./components/StockDashboard";
import { FinanceDashboard } from "./components/FinanceDashboard";
import { PublicDealViewer } from "./components/Portal/PublicDealViewer";

export default function App() {
  const { user: authUser } = useAuth();
  const ensureUser = useMutation(api.users.ensureUser);

  // Sync user to DB on load
  useEffect(() => {
    if (authUser) {
      ensureUser({
        email: authUser.email || "",
        name: authUser.name || authUser.email || "User"
      }).catch(err => console.error("Failed to sync user:", err));
    }
  }, [authUser, ensureUser]);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <NotificationProvider>
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
          </NotificationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [isPublicView, setIsPublicView] = React.useState(false);

  useEffect(() => {
    // Simple check for public view URL pattern ?view=token or similar
    // The previous implementation suggested /view/token but without react-router we'll use query params
    // Let's support ?view=token or ?token=xyz
    const params = new URLSearchParams(window.location.search);
    if (params.get('token') || window.location.pathname.startsWith('/view')) {
      setIsPublicView(true);
    }
  }, []);

  if (isPublicView) {
    return <PublicDealViewer />;
  }

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
  const role = useQuery(api.roles.getMyRole);

  if (role === undefined) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  // Routing Logic
  if (role === "engineer") {
    return <EngineerDashboard />;
  }

  if (role === "stock") {
    return <StockDashboard />;
  }

  if (role === "finance") {
    return <FinanceDashboard />;
  }

  // Admin, Acting Manager, Lead all see the LeadDashboard for now
  return <LeadDashboard />;
}

function useAuth() {
  const user = useQuery(api.auth.loggedInUser);
  return { user };
}
