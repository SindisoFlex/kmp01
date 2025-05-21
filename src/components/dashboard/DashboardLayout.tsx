import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import DashboardBackground from "@/components/dashboard/theme/DashboardBackground";
import {
  GalleryHorizontal,
  Calendar,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Award,
  QrCode,
  Download,
  Palette,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STORAGE_KEY = "dashboard-sidebar-collapsed";

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    // Initialize from local storage if available
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    // Save to local storage when collapsed state changes
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
  }, [collapsed]);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Bookings", href: "/dashboard/bookings", icon: Calendar },
    { name: "My Gallery", href: "/dashboard/gallery", icon: GalleryHorizontal },
    { name: "My Points", href: "/dashboard/points", icon: Award, badge: user?.points },
    { name: "My Profile", href: "/dashboard/profile", icon: User },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
    { name: "Theme", href: "/dashboard/theme", icon: Palette },
  ];

  const quickActions = [
    { name: "New Booking", href: "/dashboard/booking/new", icon: Calendar },
    { name: "Refer Friend", href: "/dashboard/refer", icon: QrCode },
    { name: "Download Photos", href: "/dashboard/download", icon: Download },
  ];

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <DashboardBackground>
      <div className="flex h-screen overflow-hidden bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`fixed md:static inset-y-0 left-0 flex flex-col z-50 
                    bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
                    transition-all duration-300 ease-in-out
                    ${collapsed ? 'w-16' : 'w-64'}
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        >
          {/* Mobile close button */}
          <div className="absolute right-0 mr-4 md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Sidebar header */}
          <div className={`px-4 py-5 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed && (
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold tracking-tight">
                  Studio<span className="text-primary">X</span>
                </span>
              </Link>
            )}
            {collapsed && (
              <Link to="/" className="flex items-center justify-center">
                <span className="text-xl font-bold text-primary">S</span>
              </Link>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex"
              onClick={toggleCollapsed}
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>

          {/* User info */}
          <div className="mt-2 px-4">
            <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </div>
              </div>
              {!collapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.membershipTier || 'Free'} Tier</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex-1 flex flex-col justify-between overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center ${collapsed ? 'justify-center' : ''} px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5 ${
                        isActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                    {!collapsed && (
                      <span className="flex-1">{item.name}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className={`inline-block py-0.5 px-2 text-xs rounded-full ${
                        isActive ? "bg-white/20 text-white" : "bg-primary/20 text-primary"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="px-2 space-y-1 mb-6">
              {!collapsed && (
                <div className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Quick Actions
                </div>
              )}
              {quickActions.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center ${collapsed ? 'justify-center' : ''} px-2 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5 text-gray-500 dark:text-gray-400`} />
                  {!collapsed && item.name}
                </Link>
              ))}

              <button
                onClick={logout}
                className={`w-full group flex items-center ${collapsed ? 'justify-center' : ''} px-2 py-2 text-sm font-medium rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20`}
              >
                <LogOut className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5 text-red-500 dark:text-red-400`} />
                {!collapsed && "Log Out"}
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="md:hidden sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow items-center">
            <Button
              variant="outline" 
              size="sm"
              className="ml-4"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </header>
          
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
            <div className="py-6 px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </DashboardBackground>
  );
};

export default DashboardLayout;
