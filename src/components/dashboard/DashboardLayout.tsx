
import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Gallery,
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
} from "lucide-react";

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Bookings", href: "/dashboard/bookings", icon: Calendar },
    { name: "My Gallery", href: "/dashboard/gallery", icon: Gallery },
    { name: "My Points", href: "/dashboard/points", icon: Award, badge: user?.points },
    { name: "My Profile", href: "/dashboard/profile", icon: User },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const quickActions = [
    { name: "New Booking", href: "/services", icon: Calendar },
    { name: "Refer Friend", href: "/dashboard/refer", icon: QrCode },
    { name: "Download Photos", href: "/dashboard/download", icon: Download },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 flex flex-col z-50 w-64 pt-5 pb-4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
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
        <div className="px-4 flex items-center justify-center">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold tracking-tight">
              Studio<span className="text-primary">X</span>
            </span>
          </Link>
        </div>

        {/* User info */}
        <div className="mt-6 px-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.membershipTier || 'Free'} Tier</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex-1 flex flex-col justify-between">
          <nav className="px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {item.name}
                  {item.badge && (
                    <span className={`ml-auto inline-block py-0.5 px-2 text-xs rounded-full ${
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
            <div className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Quick Actions
            </div>
            {quickActions.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                {item.name}
              </Link>
            ))}

            <button
              onClick={logout}
              className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="mr-3 h-5 w-5 text-red-500 dark:text-red-400" />
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 shadow-sm">
          <Button
            variant="outline" 
            size="sm"
            className="-ml-0.5 -mt-0.5"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
