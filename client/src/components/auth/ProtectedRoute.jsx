import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  // If the user is authenticated, render the child route content.
  if (isAuthenticated) {
    return <Outlet />;
  }

  // If not authenticated, redirect them to the home page.
  return <Navigate to="/" replace />;
};

// This is the line that was missing
export default ProtectedRoute;
