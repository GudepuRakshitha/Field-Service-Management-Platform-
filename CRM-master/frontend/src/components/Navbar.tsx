import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { NotificationDrawer } from './NotificationDrawer';
import { Bell, HardHat, LayoutDashboard, LogOut, Moon, Package, Shield, Sparkles, Sun, User, Users, Wrench } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isManager, isDispatcher, isTechnician, isCustomer } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  const getRoleBadge = () => {
    switch (user.role) {
      case 'MANAGER':
        return <span className="bg-purple-500/20 text-purple-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-purple-500/40 tracking-wider">MANAGER</span>;
      case 'DISPATCHER':
        return <span className="bg-blue-500/20 text-blue-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-500/40 tracking-wider">DISPATCHER</span>;
      case 'TECHNICIAN':
        return <span className="bg-amber-500/20 text-amber-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40 tracking-wider">TECHNICIAN</span>;
      case 'CUSTOMER':
        return <span className="bg-emerald-500/20 text-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/40 tracking-wider">CUSTOMER</span>;
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 glass-panel rounded-none backdrop-blur-xl border-b border-blue-900/40 px-4 lg:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-white group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-600/35 group-hover:scale-105 transition-transform duration-200">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-white via-blue-100 to-sky-300 bg-clip-text text-transparent font-black tracking-tight">
                KEYSTONE
              </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1.5">
              {(isManager || isDispatcher) && (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive('/dashboard')
                        ? 'bg-blue-600/25 text-white border border-blue-500/50 shadow-md shadow-blue-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-blue-950/40'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-400" /> Dashboard
                  </Link>

                  <Link
                    to="/board"
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive('/board')
                        ? 'bg-blue-600/25 text-white border border-blue-500/50 shadow-md shadow-blue-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-blue-950/40'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-blue-400" /> Kanban Board
                  </Link>

                  <Link
                    to="/work-orders"
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive('/work-orders')
                        ? 'bg-blue-600/25 text-white border border-blue-500/50 shadow-md shadow-blue-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-blue-950/40'
                    }`}
                  >
                    <Wrench className="w-4 h-4 text-blue-400" /> Work Orders
                  </Link>

                  <Link
                    to="/customers"
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive('/customers')
                        ? 'bg-blue-600/25 text-white border border-blue-500/50 shadow-md shadow-blue-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-blue-950/40'
                    }`}
                  >
                    <Users className="w-4 h-4 text-blue-400" /> Customers & Sites
                  </Link>

                  <Link
                    to="/parts"
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive('/parts')
                        ? 'bg-blue-600/25 text-white border border-blue-500/50 shadow-md shadow-blue-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-blue-950/40'
                    }`}
                  >
                    <Package className="w-4 h-4 text-blue-400" /> Parts Inventory
                  </Link>
                </>
              )}

              {isTechnician && (
                <Link
                  to="/field"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive('/field')
                      ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50'
                      : 'text-slate-300 hover:text-white hover:bg-blue-950/40'
                  }`}
                >
                  <HardHat className="w-4 h-4 text-amber-400" /> Technician Field Jobs
                </Link>
              )}

              {isCustomer && (
                <Link
                  to="/customer-portal"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive('/customer-portal')
                      ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-500/50'
                      : 'text-slate-300 hover:text-white hover:bg-blue-950/40'
                  }`}
                >
                  <User className="w-4 h-4 text-emerald-400" /> Customer Portal
                </Link>
              )}
            </div>
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-blue-900/40 bg-blue-950/40 hover:bg-blue-900/60 transition-all shadow-sm flex items-center gap-1.5"
              title={`Switch to ${theme === 'dark' ? 'Light' : theme === 'light' ? 'Comic' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : theme === 'light' ? (
                <Sparkles className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-sky-500" />
              )}
              <span className="text-xs font-semibold text-slate-300 hidden lg:inline">
                {theme === 'dark' ? 'Light' : theme === 'light' ? 'Comic' : 'Dark'}
              </span>
            </button>

            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2.5 text-slate-300 hover:text-white rounded-xl hover:bg-blue-900/40 relative transition-colors border border-transparent hover:border-blue-700/40"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-blue-300" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            </button>

            <div className="h-6 w-px bg-blue-900/50"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-white tracking-wide">{user.name}</div>
                <div className="flex justify-end mt-0.5">{getRoleBadge()}</div>
              </div>

              <button
                onClick={logout}
                className="p-2.5 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <NotificationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};
