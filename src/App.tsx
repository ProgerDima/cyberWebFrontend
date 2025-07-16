import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Index from "./pages/Index";
import Tournaments from "./pages/Tournaments";
import Teams from "./pages/Teams";
import NotFound from "./pages/NotFound";
import LoginForm from "./pages/login";
import AdminPanel from "./pages/AdminPanel";
import SteamCallback from "@/pages/SteamCallback";
import Profile from "@/pages/Profile";
import TeamProfile from "@/pages/TeamProfile";
import TournamentAdminPanel from "@/pages/tournament/TournamentAdminPanel";
import UserProfile from "./pages/UserProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/login" element={<LoginForm />} />
              <Route
                path="/admin"
                element={
                  localStorage.getItem("role") === "2" ? (
                    <AdminPanel />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route path="/steam-callback" element={<SteamCallback />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/teams/:teamId" element={<TeamProfile />} />
              <Route path="/tournaments/:id" element={<TournamentAdminPanel />} />
              <Route path="/profile/:id" element={<Profile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
