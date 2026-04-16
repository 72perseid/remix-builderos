import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
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
import UIUXPage from "./pages/UIUXPage";
import AppDetailsPage from "./pages/AppDetailsPage";
import CoachingPage from "./pages/CoachingPage";
import SharedArtifactPage from "./pages/SharedArtifactPage";
import LandingPageGeneratorPage from "./pages/LandingPageGeneratorPage";
import PublicLandingPage from "./pages/PublicLandingPage";
import OneOnOneCoachingPage from "./pages/OneOnOneCoachingPage";
import CalendarPage from "./pages/CalendarPage";
import ProgramsPage from "./pages/ProgramsPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import BookingSuccessPage from "./pages/BookingSuccessPage";
import NotFound from "./pages/NotFound";
import { DebugNav } from "./components/debug/DebugNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProjectProvider>
        <ChatProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <DebugNav />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/project-board" replace />} />
            <Route path="/artifacts" element={
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
                <BusinessModelPage />
              </ProtectedRoute>
            } />
            <Route path="/database-design" element={
              <ProtectedRoute>
                <DashboardLayout><DatabaseDesignPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/validation" element={
              <ProtectedRoute>
                <ValidationPage />
              </ProtectedRoute>
            } />
            <Route path="/product-brief" element={
              <ProtectedRoute>
                <ProductBriefPage />
              </ProtectedRoute>
            } />
            <Route path="/ui-ux" element={
              <ProtectedRoute>
                <UIUXPage />
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
            <Route path="/coaching" element={
              <ProtectedRoute>
                <DashboardLayout><CoachingPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/shared/:token" element={<SharedArtifactPage />} />
            <Route path="/lp/:slug" element={<PublicLandingPage />} />
            <Route path="/landing-page" element={
              <ProtectedRoute>
                <DashboardLayout><LandingPageGeneratorPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <DashboardLayout><CalendarPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/1on1-coaching" element={
              <ProtectedRoute>
                <DashboardLayout><OneOnOneCoachingPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/programs" element={
              <ProtectedRoute>
                <DashboardLayout><ProgramsPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/programs/:courseId" element={
              <ProtectedRoute>
                <DashboardLayout><CourseDetailPage /></DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/booking-success" element={<BookingSuccessPage />} />
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
