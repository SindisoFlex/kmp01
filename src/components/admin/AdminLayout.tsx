
import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Calendar,
  User,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  ClipboardList,
  MessageSquare,
  Image,
  Bell
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Staff Management", href: "/admin/staff", icon: Users },
    { name: "Client Management", href: "/admin/clients", icon: User },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare, badge: "3" },
    { name: "Gallery", href: "/admin/gallery", icon: Image },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the admin dashboard"
    });
    navigate('/');
  };

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

        {/* Admin header */}
        <div className="px-4 flex items-center justify-center">
          <Link to="/admin" className="flex items-center">
            <span className="text-xl font-bold tracking-tight">
              Studio<span className="text-primary">X</span> <span className="text-sm font-normal text-primary ml-1">Admin</span>
            </span>
          </Link>
        </div>

        {/* User info */}
        <div className="mt-6 px-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Avatar>
                <AvatarImage src={user?.profilePic} alt={user?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
              <Badge variant="secondary" className="mt-1">
                {user?.role.toUpperCase()}
              </Badge>
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
            <button
              onClick={handleLogout}
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
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 shadow">
          <Button
            variant="outline" 
            size="sm"
            className="px-4 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 flex justify-end px-4">
            <div className="ml-4 flex items-center md:ml-6">
              <Button variant="ghost" size="sm" className="rounded-full relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
            </div>
          </div>
        </div>
        
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
