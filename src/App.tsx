
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { usePreloadEssentials } from "@/hooks/use-preload";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Membership from "./pages/Membership";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AIChat from "./components/ai/AIChat";

// Client dashboard
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardIndex from "./pages/Dashboard/Index";
import DashboardBookings from "./pages/Dashboard/Bookings";
import BookingWizardPage from "./pages/Dashboard/BookingWizard";
import DashboardGallery from "./pages/Dashboard/Gallery";
import PointsDashboard from "./pages/Dashboard/Points";
import UserProfile from "./pages/Dashboard/Profile";
import UserSettings from "./pages/Dashboard/Settings";
import ReferralPage from "./pages/Dashboard/Refer";
import GallerySettings from "./pages/Dashboard/GallerySettings";
import InvoicesDashboard from "./pages/Dashboard/Invoices";
import InvoiceDetailPage from "./pages/Dashboard/InvoiceDetail";
import ThemeSettings from "./pages/Dashboard/ThemeSettings";

// Admin dashboard
import AdminLayout from "./components/admin/AdminLayout";
import AdminLogin from "./pages/Admin/Login";
import AdminDashboard from "./pages/Admin/Index";
import AdminAnalytics from "./pages/Admin/Analytics";
import AdminStaff from "./pages/Admin/Staff";
import AdminClients from "./pages/Admin/Clients";
import AdminGallery from "./pages/Admin/Gallery";
import AdminMessages from "./pages/Admin/Messages";
import AdminBookings from "./pages/Admin/Bookings";
import RoleGuard from "./components/auth/RoleGuard";

// Staff dashboard
import StaffLayout from "./components/staff/StaffLayout";
import StaffLogin from "./pages/Staff/Login";
import StaffDashboard from "./pages/Staff/Index";
import StaffSchedule from "./pages/Staff/Schedule";
import StaffClients from "./pages/Staff/Clients";
import StaffTasks from "./pages/Staff/Tasks";
import StaffMessages from "./pages/Staff/Messages";
import StaffGallery from "./pages/Staff/Gallery";
import StaffProfile from "./pages/Staff/Profile";
import StaffSettings from "./pages/Staff/Settings";

// Create a new QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  // Preload essential resources
  usePreloadEssentials();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ThemeProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/membership" element={<Membership />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Authentication Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/staff/login" element={<StaffLogin />} />
                
                {/* Client Dashboard Routes */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardIndex />} />
                  <Route path="bookings" element={<DashboardBookings />} />
                  <Route path="booking/new" element={<BookingWizardPage />} />
                  <Route path="gallery" element={<DashboardGallery />} />
                  <Route path="gallery/:galleryId" element={<DashboardGallery />} />
                  <Route path="points" element={<PointsDashboard />} />
                  <Route path="profile" element={<UserProfile />} />
                  <Route path="settings" element={<UserSettings />} />
                  <Route path="refer" element={<ReferralPage />} />
                  <Route path="gallery-settings" element={<GallerySettings />} />
                  <Route path="invoices" element={<InvoicesDashboard />} />
                  <Route path="invoices/:invoiceId" element={<InvoiceDetailPage />} />
                  <Route path="theme" element={<ThemeSettings />} />
                </Route>
                
                {/* Admin Dashboard Routes - Protected */}
                <Route path="/admin" element={
                  <RoleGuard allowedRoles={["admin"]} redirectTo="/admin/login">
                    <AdminLayout />
                  </RoleGuard>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="staff" element={<AdminStaff />} />
                  <Route path="clients" element={<AdminClients />} />
                  <Route path="gallery" element={<AdminGallery />} />
                  <Route path="messages" element={<AdminMessages />} />
                </Route>
                
                {/* Staff Dashboard Routes - Protected */}
                <Route path="/staff" element={
                  <RoleGuard allowedRoles={["staff"]} redirectTo="/staff/login">
                    <StaffLayout />
                  </RoleGuard>
                }>
                  <Route index element={<StaffDashboard />} />
                  <Route path="schedule" element={<StaffSchedule />} />
                  <Route path="clients" element={<StaffClients />} />
                  <Route path="tasks" element={<StaffTasks />} />
                  <Route path="messages" element={<StaffMessages />} />
                  <Route path="gallery" element={<StaffGallery />} />
                  <Route path="profile" element={<StaffProfile />} />
                  <Route path="settings" element={<StaffSettings />} />
                </Route>
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* AI Chat Assistant - Available on all pages */}
              <AIChat />
            </BrowserRouter>
          </ThemeProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
