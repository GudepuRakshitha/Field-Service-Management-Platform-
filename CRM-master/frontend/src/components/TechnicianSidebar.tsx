import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { NotificationDrawer } from './NotificationDrawer';
import { api } from '../api/client';
import {
  HardHat,
  Wrench,
  Bell,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  PhoneCall,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  ShieldCheck
} from 'lucide-react';

export const TechnicianSidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);

  // Live Technician Stats
  const [assignedCount, setAssignedCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchTechStats = async () => {
      try {
        const woRes = await api.getWorkOrders({ size: 100 });
        const jobs = (woRes.content || []).filter((j) => j.assignedToId === user.id);
        setAssignedCount(jobs.filter((j) => j.status === 'ASSIGNED').length);
        setInProgressCount(jobs.filter((j) => j.status === 'IN_PROGRESS' || j.status === 'ON_HOLD').length);
        setCompletedCount(jobs.filter((j) => j.status === 'COMPLETED' || j.status === 'CLOSED').length);
      } catch (err) {
        console.error('Failed to load technician stats for sidebar', err);
      }
    };

    fetchTechStats();
    const interval = setInterval(fetchTechStats, 15000);
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      label: 'My Field Jobs',
      path: '/field',
      icon: HardHat,
      badge: assignedCount + inProgressCount > 0 ? `${assignedCount + inProgressCount} Active` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    }
  ];

  return (
    <div className="min-h-screen flex bg-[#061121]">
      {/* Top Header Bar (Desktop & Mobile) */}
      <header className="fixed top-0 left-0 lg:left-64 right-0 z-40 bg-[#060e1a]/90 backdrop-blur-xl border-b border-amber-500/20 px-4 sm:px-6 py-3 flex items-center justify-between transition-all">
        {/* Left Section: Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-amber-400 hover:text-white bg-amber-950/40 border border-amber-500/30"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <HardHat className="w-4 h-4" />
            </div>
            <span className="font-black text-sm sm:text-base text-white tracking-wide">
              FIELD TECHNICIAN PORTAL
            </span>
          </div>
        </div>

        {/* Right Section: Theme Toggle, Notifications, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-amber-500/30 bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 transition-all shadow-sm flex items-center gap-2"
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
            className="p-2 sm:p-2.5 text-slate-300 hover:text-white rounded-xl hover:bg-amber-900/40 relative border border-amber-500/30 bg-amber-950/40 transition-all"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5 text-amber-300" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
          </button>

          {/* Sign Out / Logout Button */}
          <button
            onClick={logout}
            className="p-2 sm:px-3 sm:py-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 border border-amber-500/30 bg-amber-950/40 transition-all flex items-center gap-1.5"
            title="Sign out"
          >
            <LogOut className="w-4.5 h-4.5 text-rose-400" />
            <span className="text-xs font-bold text-rose-300 hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Technician Vertical Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#060e1a]/95 backdrop-blur-2xl border-r border-amber-500/20 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Brand Header */}
          <Link to="/field" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-lg tracking-tight text-white">KEYSTONE</h1>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300">
                  FIELD TECH
                </span>
              </div>
              <div className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest">Mobile Dispatch Hub</div>
            </div>
          </Link>

          {/* Technician Duty Badge */}
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-amber-950/30 to-slate-900/40 border border-amber-500/20 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> On Duty Active
              </span>
              <span className="font-mono text-slate-400">ID #{user?.id || '00'}</span>
            </div>
            <div className="text-xs font-black text-white truncate">{user?.name}</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live Location & Dispatch Ready</span>
            </div>
          </div>

          {/* Job Quick Stats Panel */}
          <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
              <div className="text-xs font-black text-sky-300">{assignedCount}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Assigned</div>
            </div>
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="text-xs font-black text-amber-300">{inProgressCount}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Active</div>
            </div>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-xs font-black text-emerald-300">{completedCount}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Done</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5">
            <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Technician Workspace
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all group relative ${
                    active
                      ? 'bg-gradient-to-r from-amber-500/25 to-orange-500/15 text-white border border-amber-500/40 shadow-lg shadow-amber-500/15'
                      : 'text-slate-300 hover:text-white hover:bg-amber-950/30'
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-amber-400 to-orange-500"></span>
                  )}

                  <div className="flex items-center gap-3">
                    <Icon className={`w-4.5 h-4.5 ${active ? 'text-amber-400' : 'text-amber-400/70 group-hover:text-amber-300'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Dispatch Hotline Widget */}
          <button
            onClick={() => setDispatchModalOpen(true)}
            className="w-full p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 hover:border-amber-400/60 hover:bg-amber-900/40 text-amber-200 text-xs font-bold flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <PhoneCall className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-xs">Dispatch Center</div>
                <div className="text-[10px] text-amber-300 font-mono">Emergency Hotline • 24/7</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Sidebar Footer - User Profile */}
        <div className="p-4 m-3 rounded-2xl bg-amber-950/30 border border-amber-500/25 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white shadow-md shadow-amber-500/20 shrink-0">
              {user?.name?.charAt(0) || 'T'}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{user?.name}</div>
              <div className="text-[10px] font-extrabold text-amber-400 tracking-wider uppercase">FIELD TECHNICIAN</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Dispatch Hotline Modal */}
      {dispatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#081324] border border-amber-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                  <PhoneCall className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Central Dispatch Desk</h3>
                  <p className="text-xs text-amber-300 font-medium">Meridian Ops & Urgent Escalation</p>
                </div>
              </div>
              <button
                onClick={() => setDispatchModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Emergency Dispatch Line</div>
                <div className="text-sm font-mono font-bold text-amber-400 flex items-center justify-between">
                  <span>+1 (800) 555-DISPATCH</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">OPERATIONAL</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Lead Dispatch Manager</div>
                <div className="text-xs font-bold text-white">Dan Dispatcher &mdash; Meridian Operations</div>
                <div className="text-[11px] text-slate-400">dispatcher@meridian.com</div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  window.location.href = 'tel:18005553477';
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/20"
              >
                Call Dispatch Desk
              </button>
              <button
                onClick={() => setDispatchModalOpen(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-16 min-h-screen overflow-x-hidden">
        {children}
      </main>

      <NotificationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};
