import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import Dashboard from "./pages/Dashboard";
import AppIdeaPage from "./pages/AppIdeaPage";
import BusinessModelPage from "./pages/BusinessModelPage";
import DatabaseDesignPage from "./pages/DatabaseDesignPage";
import AIKanbanAssistantPage from "./pages/AIKanbanAssistantPage";
import ValidationPage from "./pages/ValidationPage";
import ProductBriefPage from "./pages/ProductBriefPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProjectProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout><Dashboard /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/app-idea" element={
              <ProtectedRoute>
                <DashboardLayout><AppIdeaPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/business-model" element={
              <ProtectedRoute>
                <DashboardLayout><BusinessModelPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/database-design" element={
              <ProtectedRoute>
                <DashboardLayout><DatabaseDesignPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/ai-kanban-assistant" element={
              <ProtectedRoute>
                <DashboardLayout><AIKanbanAssistantPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/validation" element={
              <ProtectedRoute>
                <DashboardLayout><ValidationPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/product-brief" element={
              <ProtectedRoute>
                <DashboardLayout><ProductBriefPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;