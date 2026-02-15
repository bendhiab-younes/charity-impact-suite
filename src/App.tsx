import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AuthPage from "./pages/Auth";
import DashboardPage from "./pages/Dashboard";
import DonationsPage from "./pages/Donations";
import BeneficiariesPage from "./pages/Beneficiaries";
import RulesPage from "./pages/Rules";
import AssociationsPage from "./pages/Associations";
import AssociationDetailPage from "./pages/AssociationDetail";
import HowItWorksPage from "./pages/HowItWorks";
import ImpactPage from "./pages/Impact";
import AssociationsManagement from "./pages/dashboard/AssociationsManagement";
import UsersManagement from "./pages/dashboard/UsersManagement";
import FamiliesManagement from "./pages/dashboard/FamiliesManagement";
import Reports from "./pages/dashboard/Reports";
import AuditLog from "./pages/dashboard/AuditLog";
import Settings from "./pages/dashboard/Settings";
import NewDonation from "./pages/dashboard/NewDonation";
import NewDispatch from "./pages/dashboard/NewDispatch";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
          <h1 style={{ color: 'red' }}>Something went wrong</h1>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#333' }}>
            {this.state.error?.message}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#666', fontSize: '0.8rem' }}>
            {this.state.error?.stack}
          </pre>
          <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/dashboard'; }}>
            Go to Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/associations" element={<AssociationsPage />} />
            <Route path="/associations/:id" element={<AssociationDetailPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/impact" element={<ImpactPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/associations" element={<AssociationsManagement />} />
            <Route path="/dashboard/users" element={<UsersManagement />} />
            <Route path="/dashboard/beneficiaries" element={<BeneficiariesPage />} />
            <Route path="/dashboard/families" element={<FamiliesManagement />} />
            <Route path="/dashboard/donations" element={<DonationsPage />} />
            <Route path="/dashboard/donations/new" element={<NewDonation />} />
            <Route path="/dashboard/dispatch/new" element={<NewDispatch />} />
            <Route path="/dashboard/rules" element={<RulesPage />} />
            <Route path="/dashboard/reports" element={<Reports />} />
            <Route path="/dashboard/audit" element={<AuditLog />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
