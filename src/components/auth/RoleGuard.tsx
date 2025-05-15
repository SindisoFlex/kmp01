
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import React from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  redirectTo = "/"
}) => {
  const { isAuthenticated, user, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // User is not logged in
    toast({
      title: "Access denied",
      description: "Please log in to access this page",
      variant: "destructive"
    });
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!hasRole(allowedRoles)) {
    // User doesn't have the required role
    toast({
      title: "Permission denied",
      description: "You don't have permission to access this page",
      variant: "destructive"
    });
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // User is authenticated and has the required role
  return <>{children}</>;
};

export default RoleGuard;
