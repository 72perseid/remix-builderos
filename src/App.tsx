import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import Dashboard from "./pages/Dashboard";
import AppIdeaPage from "./pages/AppIdeaPage";
import BusinessModelPage from "./pages/BusinessModelPage";
import DatabaseDesignPage from "./pages/DatabaseDesignPage";
import AIKanbanAssistantPage from "./pages/AIKanbanAssistantPage";
import ProjectBoardPage from "./pages/ProjectBoardPage";
import ValidationPage from "./pages/ValidationPage";
import ProductBriefPage from "./pages/ProductBriefPage";
import MasterPromptPage from "./pages/MasterPromptPage";
import AppDetailsPage from "./pages/AppDetailsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProjectProvider>
        <ChatProvider>
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
            <Route path="/" element={<Navigate to="/project-board" replace />} />
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
            <Route path="/project-board" element={
              <ProtectedRoute>
                <DashboardLayout><ProjectBoardPage /></DashboardLayout>
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
            <Route path="/master-prompt" element={
              <ProtectedRoute>
                <DashboardLayout><MasterPromptPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/app-details" element={
              <ProtectedRoute>
                <DashboardLayout><AppDetailsPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </ChatProvider>
      </ProjectProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
