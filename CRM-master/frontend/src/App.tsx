import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ThemeProvider } from './theme/ThemeContext';
import { MarvelSplash } from './theme/MarvelSplash';
import { ComicLoadingScreen } from './components/ComicLoadingScreen';
import { SidebarLayout } from './components/SidebarLayout';
import { GuardedRoute } from './components/GuardedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { KanbanBoard } from './pages/KanbanBoard';
import { WorkOrderList } from './pages/WorkOrderList';
import { WorkOrderDetail } from './pages/WorkOrderDetail';
import { TechnicianView } from './pages/TechnicianView';
import { CustomerPortal } from './pages/CustomerPortal';
import { CustomerSites } from './pages/CustomerSites';
import { CustomersList } from './pages/CustomersList';
import { PartsInventory } from './pages/PartsInventory';
import { UserManagement } from './pages/UserManagement';

const HomeRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <ComicLoadingScreen message="INITIALIZING..." subtitle="Establishing Secure Connection" />;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'TECHNICIAN') return <Navigate to="/field" replace />;
  if (user.role === 'CUSTOMER') return <Navigate to="/customer-portal" replace />;
  return <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MarvelSplash />
      <AuthProvider>
        <BrowserRouter>
          <SidebarLayout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<HomeRedirect />} />

            {/* Manager & Dispatcher Routes */}
            <Route
              path="/dashboard"
              element={
                <GuardedRoute allowedRoles={['MANAGER', 'DISPATCHER']}>
                  <Dashboard />
                </GuardedRoute>
              }
            />
            <Route
              path="/board"
              element={
                <GuardedRoute allowedRoles={['MANAGER', 'DISPATCHER']} requiredPermission="ASSIGN_TECHNICIANS">
                  <KanbanBoard />
                </GuardedRoute>
              }
            />
            <Route
              path="/work-orders"
              element={
                <GuardedRoute allowedRoles={['MANAGER', 'DISPATCHER']} requiredPermission="CREATE_WORK_ORDERS">
                  <WorkOrderList />
                </GuardedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <GuardedRoute allowedRoles={['MANAGER', 'DISPATCHER']} requiredPermission="MANAGE_TENANTS">
                  <CustomersList />
                </GuardedRoute>
              }
            />
            <Route
              path="/parts"
              element={
                <GuardedRoute allowedRoles={['MANAGER', 'DISPATCHER']} requiredPermission="MANAGE_INVENTORY">
                  <PartsInventory />
                </GuardedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <GuardedRoute allowedRoles={['MANAGER', 'DISPATCHER']} requiredPermission="MANAGE_USERS">
                  <UserManagement />
                </GuardedRoute>
              }
            />

            {/* Technician Field View */}
            <Route
              path="/field"
              element={
                <GuardedRoute allowedRoles={['TECHNICIAN']} requiredPermission="EXECUTE_FIELD_JOBS">
                  <TechnicianView />
                </GuardedRoute>
              }
            />

            {/* Customer Self Service Portal */}
            <Route
              path="/customer-portal"
              element={
                <GuardedRoute allowedRoles={['CUSTOMER']}>
                  <CustomerPortal />
                </GuardedRoute>
              }
            />
            <Route
              path="/customer-sites"
              element={
                <GuardedRoute allowedRoles={['CUSTOMER']}>
                  <CustomerSites />
                </GuardedRoute>
              }
            />

            {/* Shared Detail Page */}
            <Route
              path="/work-orders/:id"
              element={
                <GuardedRoute allowedRoles={['MANAGER', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER']}>
                  <WorkOrderDetail />
                </GuardedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SidebarLayout>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);
};
