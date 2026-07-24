import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Role } from '../api/types';

interface GuardedRouteProps {
  allowedRoles: Role[];
  requiredPermission?: string;
  children: React.ReactElement;
}

export const GuardedRoute: React.FC<GuardedRouteProps> = ({ allowedRoles, requiredPermission, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-indigo-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const getRoleDefaultPath = (role: Role) => {
    if (role === 'TECHNICIAN') return '/field';
    if (role === 'CUSTOMER') return '/customer-portal';
    return '/dashboard';
  };

  if (!allowedRoles.includes(user.role)) {
    const defaultPath = getRoleDefaultPath(user.role);
    if (location.pathname !== defaultPath) {
      return <Navigate to={defaultPath} replace />;
    }
  }

  if (requiredPermission && user.permissions) {
    const userPermissions = user.permissions.split(',');
    if (!userPermissions.includes(requiredPermission)) {
      const defaultPath = getRoleDefaultPath(user.role);
      if (location.pathname !== defaultPath) {
        return <Navigate to={defaultPath} replace />;
      }
    }
  }

  return children;
};
