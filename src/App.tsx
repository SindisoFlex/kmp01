
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Membership from "./pages/Membership";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardIndex from "./pages/Dashboard/Index";
import DashboardBookings from "./pages/Dashboard/Bookings";
import DashboardGallery from "./pages/Dashboard/Gallery";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardIndex />} />
              <Route path="bookings" element={<DashboardBookings />} />
              <Route path="gallery" element={<DashboardGallery />} />
              {/* Add more dashboard routes as needed */}
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
