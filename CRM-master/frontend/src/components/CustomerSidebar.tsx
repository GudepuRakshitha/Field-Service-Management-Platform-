import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { NotificationDrawer } from './NotificationDrawer';
import { Site, WorkOrder } from '../api/types';
import { api } from '../api/client';
import {
  Building2,
  Wrench,
  Plus,
  Bell,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
  PhoneCall,
  MapPin,
  ClipboardList,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const CustomerSidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // Live Customer Stats
  const [openRequestsCount, setOpenRequestsCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [sitesCount, setSitesCount] = useState(0);

  useEffect(() => {
    const custId = user?.customerId;
    if (!custId) return;
    const fetchStats = async () => {
      try {
        const woRes = await api.getWorkOrders({ customerId: custId, size: 100 });
        const jobs = woRes.content || [];
        setOpenRequestsCount(jobs.filter((j) => j.status === 'NEW' || j.status === 'ASSIGNED').length);
        setInProgressCount(jobs.filter((j) => j.status === 'IN_PROGRESS' || j.status === 'ON_HOLD').length);
        setCompletedCount(jobs.filter((j) => j.status === 'COMPLETED' || j.status === 'CLOSED').length);

        const siteList = await api.getCustomerSites(custId);
        setSitesCount(siteList.length);
      } catch (err) {
        console.error('Failed to load customer stats for sidebar', err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [user?.customerId, location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      label: 'Service Requests',
      path: '/customer-portal',
      icon: ClipboardList,
      badge: openRequestsCount + inProgressCount > 0 ? `${openRequestsCount + inProgressCount} Active` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      label: 'My Sites & Facilities',
      path: '/customer-sites',
      icon: MapPin,
      badge: sitesCount > 0 ? `${sitesCount} Site${sitesCount > 1 ? 's' : ''}` : null,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    }
  ];

  return (
    <div className="min-h-screen flex bg-[#061121]">
      {/* Top Header Bar (Desktop & Mobile) */}
      <header className="fixed top-0 left-0 lg:left-64 right-0 z-40 bg-[#060e1a]/90 backdrop-blur-xl border-b border-emerald-500/20 px-4 sm:px-6 py-3 flex items-center justify-between transition-all">
        {/* Left Section: Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-emerald-400 hover:text-white bg-emerald-950/40 border border-emerald-500/30"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-black text-sm sm:text-base text-white tracking-wide">
              {user?.customerName || user?.name || 'CUSTOMER PORTAL'}
            </span>
          </div>
        </div>

        {/* Right Section: Theme Toggle, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/60 text-amber-400 transition-all shadow-sm flex items-center gap-2"
            title={`Switch to ${theme === 'dark' ? 'Light' : theme === 'light' ? 'Comic' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : theme === 'light' ? <Sparkles className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-sky-400" />}
            <span className="text-xs font-semibold text-slate-300 hidden md:inline">
              {theme === 'dark' ? 'Light' : theme === 'light' ? 'Comic' : 'Dark'}
            </span>
          </button>

          {/* Notification Drawer Button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 sm:p-2.5 text-slate-300 hover:text-white rounded-xl hover:bg-emerald-900/40 relative border border-emerald-500/30 bg-emerald-950/40 transition-all"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5 text-emerald-300" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          </button>

          {/* Sign Out / Logout Button */}
          <button
            onClick={logout}
            className="p-2 sm:px-3 sm:py-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 border border-emerald-500/30 bg-emerald-950/40 transition-all flex items-center gap-1.5"
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

      {/* Customer Vertical Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#060e1a]/95 backdrop-blur-2xl border-r border-emerald-500/20 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Customer Brand Header */}
          <Link to="/customer-portal" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-lg tracking-tight text-white">KEYSTONE</h1>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                  TENANT
                </span>
              </div>
              <div className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">Self-Service Portal</div>
            </div>
          </Link>

          {/* Customer Account Info Badge */}
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-emerald-950/30 to-slate-900/40 border border-emerald-500/20 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Account Verified
              </span>
              <span className="font-mono text-slate-400">ID #{user?.customerId || '00'}</span>
            </div>
            <div className="text-xs font-black text-white truncate">{user?.customerName || user?.name}</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>24/7 SLA Protection Active</span>
            </div>
          </div>

          {/* Request Quick Stats Panel */}
          <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-xs font-black text-emerald-300">{openRequestsCount}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Open</div>
            </div>
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="text-xs font-black text-amber-300">{inProgressCount}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Active</div>
            </div>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <div className="text-xs font-black text-cyan-300">{completedCount}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Done</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5">
            <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Tenant Management
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
                      ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/15 text-white border border-emerald-500/40 shadow-lg shadow-emerald-500/15'
                      : 'text-slate-300 hover:text-white hover:bg-emerald-950/30'
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-emerald-400 to-teal-500"></span>
                  )}

                  <div className="flex items-center gap-3">
                    <Icon className={`w-4.5 h-4.5 ${active ? 'text-emerald-400' : 'text-emerald-400/70 group-hover:text-emerald-300'}`} />
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

          {/* Support Hotline Widget */}
          <button
            onClick={() => setSupportModalOpen(true)}
            className="w-full p-3 rounded-xl bg-teal-950/30 border border-teal-500/30 hover:border-teal-400/60 hover:bg-teal-900/40 text-teal-200 text-xs font-bold flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
                <PhoneCall className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-xs">Customer Support</div>
                <div className="text-[10px] text-teal-300 font-mono">Dedicated Desk • 24/7</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-teal-400" />
          </button>
        </div>

        {/* Customer Profile Footer */}
        <div className="p-3 m-3 space-y-2 shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-emerald-500/25 bg-emerald-950/30 hover:bg-emerald-900/50 transition-all group"
            title={`Switch to ${theme === 'dark' ? 'Light' : theme === 'light' ? 'Comic' : 'Dark'} Mode`}
          >
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : theme === 'light' ? (
                <Sparkles className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-sky-400" />
              )}
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                {theme === 'dark' ? 'Switch to Light' : theme === 'light' ? 'Switch to Comic' : 'Switch to Dark'}
              </span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${theme === 'dark' ? 'bg-emerald-900/60' : theme === 'light' ? 'bg-sky-400/40' : 'bg-yellow-600/40'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full theme-toggle-knob ${theme === 'dark' ? 'left-0.5 bg-amber-400' : theme === 'light' ? 'left-4 bg-sky-500' : 'left-4 bg-yellow-400'}`} />
            </div>
          </button>

          {/* User Card */}
          <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/25">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-500/20 shrink-0">
                {user?.name?.charAt(0) || 'C'}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">{user?.name}</div>
                <div className="text-[10px] font-extrabold text-emerald-400 tracking-wider uppercase">CUSTOMER TENANT</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Customer Support Modal */}
      {supportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#081324] border border-teal-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
                  <PhoneCall className="w-5 h-5 text-teal-300" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Facility Support Hub</h3>
                  <p className="text-xs text-teal-300 font-medium">Customer Helpdesk & Urgent Dispatch</p>
                </div>
              </div>
              <button
                onClick={() => setSupportModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-teal-900/40 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Emergency Service Line</div>
                <div className="text-sm font-mono font-bold text-teal-400 flex items-center justify-between">
                  <span>+1 (800) 555-KEY-CUST</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">PRIORITY</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-teal-900/40 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Account Manager</div>
                <div className="text-xs font-bold text-white">David Miller &mdash; Senior Account Exec</div>
                <div className="text-[11px] text-slate-400">Email: support@keystonefsm.com</div>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => {
                  alert('Support request logged! Your account executive has been notified.');
                  setSupportModalOpen(false);
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20"
              >
                Contact Representative
              </button>
              <button
                onClick={() => setSupportModalOpen(false)}
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
