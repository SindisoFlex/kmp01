
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import StaffLoginForm from "@/components/auth/StaffLoginForm";
import PageLayout from "@/components/layout/PageLayout";

const StaffLogin: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  // If already authenticated as staff, redirect to staff dashboard
  if (isAuthenticated && user?.role === "staff") {
    return <Navigate to="/staff" replace />;
  }
  
  return (
    <PageLayout>
      <div className="container max-w-lg mx-auto py-12">
        <div className="border bg-card rounded-lg p-6 shadow-sm">
          <StaffLoginForm />
        </div>
      </div>
    </PageLayout>
  );
};

export default StaffLogin;
