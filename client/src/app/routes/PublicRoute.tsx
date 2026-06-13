import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "@/modules/auth";

interface PublicRouteProps {
  children?: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
};
