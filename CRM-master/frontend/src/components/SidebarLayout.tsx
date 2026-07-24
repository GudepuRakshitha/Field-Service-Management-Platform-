import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { NotificationDrawer } from './NotificationDrawer';
import { CustomerSidebar } from './CustomerSidebar';
import { TechnicianSidebar } from './TechnicianSidebar';
import {
  LayoutDashboard,
  Kanban,
  Wrench,
  Users,
  Package,
  Bell,
  LogOut,
  ChevronRight,
  Menu,
  X,
  UserCheck,
  Sun,
  Moon
} from 'lucide-react';

export const SidebarLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isManager, isDispatcher } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return <>{children}</>;

  if (user.role === 'CUSTOMER') {
    return <CustomerSidebar>{children}</CustomerSidebar>;
  }

  if (user.role === 'TECHNICIAN') {
    return <TechnicianSidebar>{children}</TechnicianSidebar>;
  }

  const isAdmin = isManager || isDispatcher;
  const isActive = (path: string) => location.pathname === path;

  // Non-admin roles (Technicians & Customers) get a top navbar layout
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-[#061121]">
        <header className="bg-[#060e1a]/90 backdrop-blur-xl border-b border-blue-900/40 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-white via-blue-100 to-sky-300 bg-clip-text text-transparent">
              KEYSTONE
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-blue-900/40 bg-blue-950/40 hover:bg-blue-900/60 text-amber-400 transition-all shadow-sm"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-sky-400" />}
            </button>

            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2.5 text-slate-300 hover:text-white rounded-xl hover:bg-blue-900/40 relative border border-blue-900/40"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-blue-300" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping"></span>
            </button>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-white">{user.name}</div>
              <div className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider">{user.role}</div>
            </div>
            <button
              onClick={logout}
              className="p-2 sm:px-3 sm:py-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 border border-blue-900/40 bg-blue-950/40 transition-all flex items-center gap-1.5"
              title="Sign out"
            >
              <LogOut className="w-4.5 h-4.5 text-rose-400" />
              <span className="text-xs font-bold text-rose-300 hidden md:inline">Sign Out</span>
            </button>
          </div>
        </header>

        <main className="flex-1">{children}</main>
        <NotificationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    );
  }

  const userPermissions = user.permissions ? user.permissions.split(',') : [];

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: '' },
    { label: 'Kanban Board', path: '/board', icon: Kanban, permission: 'ASSIGN_TECHNICIANS' },
    { label: 'Work Orders', path: '/work-orders', icon: Wrench, permission: 'CREATE_WORK_ORDERS' },
    { label: 'Customers & Sites', path: '/customers', icon: Users, permission: 'MANAGE_TENANTS' },
    { label: 'Parts Inventory', path: '/parts', icon: Package, permission: 'MANAGE_INVENTORY' },
    { label: 'Users & Access', path: '/users', icon: UserCheck, permission: 'MANAGE_USERS' },
  ].filter((item) => !item.permission || userPermissions.includes(item.permission));

  return (
    <div className="min-h-screen flex bg-[#061121]">
      {/* Top Header Bar (Desktop & Mobile) */}
      <header className="fixed top-0 left-0 lg:left-64 right-0 z-40 bg-[#060e1a]/90 backdrop-blur-xl border-b border-blue-900/40 px-4 sm:px-6 py-3 flex items-center justify-between transition-all">
        {/* Left Section: Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-blue-300 hover:text-white bg-blue-950/60 border border-blue-900/50"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-black text-base text-white tracking-wide">
            KEYSTONE <span className="text-xs font-bold text-sky-400">MANAGEMENT</span>
          </span>
        </div>

        {/* Right Section: Theme Toggle, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-blue-900/40 bg-blue-950/40 hover:bg-blue-900/60 text-amber-400 transition-all shadow-sm flex items-center gap-2"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
            <span className="text-xs font-semibold text-slate-300 hidden md:inline">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>

          {/* Notification Drawer Button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 sm:p-2.5 text-slate-300 hover:text-white rounded-xl hover:bg-blue-900/40 relative border border-blue-900/40 bg-blue-950/40 transition-all"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5 text-blue-300" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping"></span>
          </button>

          {/* Sign Out / Logout Button */}
          <button
            onClick={logout}
            className="p-2 sm:px-3 sm:py-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 border border-blue-900/40 bg-blue-950/40 transition-all flex items-center gap-1.5"
            title="Sign out"
          >
            <LogOut className="w-4.5 h-4.5 text-rose-400" />
            <span className="text-xs font-bold text-rose-300 hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Admin Vertical Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#060e1a]/95 backdrop-blur-2xl border-r border-blue-900/40 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 space-y-6">
          {/* Logo & Brand */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-blue-100 to-sky-300 bg-clip-text text-transparent">
                KEYSTONE
              </h1>
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">FSM Platform</div>
            </div>
          </Link>

          {/* Navigation Menu */}
          <div className="space-y-1.5 pt-2">
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Management Menu
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold text-sm transition-all group relative ${
                    active
                      ? 'bg-gradient-to-r from-blue-600/30 to-sky-500/20 text-white border border-blue-500/50 shadow-lg shadow-blue-600/20'
                      : 'text-slate-300 hover:text-white hover:bg-blue-950/40'
                  }`}
                >
                  {/* Left Active Edge Indicator */}
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-sky-400 to-blue-600"></span>
                  )}

                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${active ? 'text-sky-400' : 'text-blue-400/80 group-hover:text-sky-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      active ? 'text-sky-400 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer - User Profile */}
        <div className="p-4 m-3 rounded-2xl bg-blue-950/40 border border-blue-900/40 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center font-bold text-blue-300 shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{user.name}</div>
              <div className="text-[10px] font-extrabold text-sky-400 tracking-wider uppercase">{user.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-16 min-h-screen overflow-x-hidden">
        {children}
      </main>

      <NotificationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};
