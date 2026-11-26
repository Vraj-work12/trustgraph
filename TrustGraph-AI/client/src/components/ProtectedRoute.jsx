import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield } from 'lucide-react';

const PageLoader = () => (
  <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center gap-3 bg-gray-50">
    <div className="relative w-8 h-8">
      <div className="w-8 h-8 border-2 border-gray-200 rounded-full" />
      <div className="w-8 h-8 border-2 border-t-gray-700 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute inset-0" />
    </div>
    <div className="flex items-center gap-1.5 text-xs text-gray-400">
      <Shield size={12} className="text-gray-500" />
      <span>TrustGraph AI</span>
    </div>
  </div>
);

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" replace />;
};

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
};
