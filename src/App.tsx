import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import Index from "./pages/Index";
import Story from "./pages/Story";
import Noticias from "./pages/Noticias";
import GaleriaPage from "./pages/GaleriaPage";
import NossaHistoria from "./pages/NossaHistoria";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import Posts from "./pages/admin/Posts";
import PostForm from "./pages/admin/PostForm";
import Gallery from "./pages/admin/Gallery";
import Settings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/noticias" element={<Noticias />} />
              <Route path="/galeria" element={<GaleriaPage />} />
              <Route path="/nossa-historia" element={<NossaHistoria />} />
              <Route path="/historia/:id" element={<Story />} />
              <Route path="/login" element={<Login />} />

              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin/historias" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
              <Route path="/admin/historias/nova" element={<ProtectedRoute><PostForm /></ProtectedRoute>} />
              <Route path="/admin/historias/:id" element={<ProtectedRoute><PostForm /></ProtectedRoute>} />
              <Route path="/admin/galeria" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
              <Route path="/admin/configuracoes" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;