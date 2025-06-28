// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * A wrapper component that protects a route from unauthenticated access.
 * If the user is not logged in, they will be redirected to the /login page.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUserId } = useAuth();

  if (!currentUserId) {
    // If there is no logged-in user, redirect them to the login page
    return <Navigate to="/login" replace />;
  }

  // If the user is logged in, render the child components (the protected page)
  return <>{children}</>;
};

export default ProtectedRoute;
