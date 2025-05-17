
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import AdminLoginForm from "@/components/auth/AdminLoginForm";
import PageLayout from "@/components/layout/PageLayout";

const AdminLogin: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  // If already authenticated as admin, redirect to admin dashboard
  if (isAuthenticated && user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  
  return (
    <PageLayout>
      <div className="container max-w-lg mx-auto py-12">
        <div className="border bg-card rounded-lg p-6 shadow-sm">
          <AdminLoginForm />
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminLogin;
