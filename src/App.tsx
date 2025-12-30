import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
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
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Login route (public) */}
                <Route path="/login" element={<Login />} />

                {/* Protected routes (require login) */}
                <Route path="/" element={<Index />} />
                <Route path="/noticias" element={<Noticias />} />
                <Route path="/galeria" element={<GaleriaPage />} />
                <Route path="/nossa-historia" element={<NossaHistoria />} />
                <Route path="/historia/:id" element={<Story />} />

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
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
