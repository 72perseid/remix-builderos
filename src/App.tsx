import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
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
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/app-idea" element={<ProtectedRoute><AppIdeaPage /></ProtectedRoute>} />
          <Route path="/business-model" element={<ProtectedRoute><BusinessModelPage /></ProtectedRoute>} />
          <Route path="/database-design" element={<ProtectedRoute><DatabaseDesignPage /></ProtectedRoute>} />
          <Route path="/ai-kanban-assistant" element={<ProtectedRoute><AIKanbanAssistantPage /></ProtectedRoute>} />
          <Route path="/validation" element={<ProtectedRoute><ValidationPage /></ProtectedRoute>} />
          <Route path="/product-brief" element={<ProtectedRoute><ProductBriefPage /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
