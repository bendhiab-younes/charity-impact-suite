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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/donations" element={<DonationsPage />} />
          <Route path="/dashboard/beneficiaries" element={<BeneficiariesPage />} />
          <Route path="/dashboard/rules" element={<RulesPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
