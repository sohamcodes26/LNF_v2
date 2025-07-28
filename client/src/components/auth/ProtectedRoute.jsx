import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Outlet />;
  }
  return <Navigate to="/" replace />;
};
export default ProtectedRoute;
