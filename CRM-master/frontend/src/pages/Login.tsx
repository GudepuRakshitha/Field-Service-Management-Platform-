import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { api } from '../api/client';
import { Lock, Mail, Wrench, ArrowRight, Eye, EyeOff, Sun, Moon, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login({ email, password });
      login(response);

      // Route based on role
      if (response.role === 'TECHNICIAN') navigate('/field');
      else if (response.role === 'CUSTOMER') navigate('/customer-portal');
      else navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-dark)' }}>
      {/* Theme Toggle — top right corner */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-xl border border-blue-900/40 bg-blue-950/40 hover:bg-blue-900/60 transition-all shadow-md flex items-center gap-2"
        title={`Switch to ${theme === 'dark' ? 'Light' : theme === 'light' ? 'Comic' : 'Dark'} Mode`}
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : theme === 'light' ? (
          <Sparkles className="w-4 h-4 text-yellow-500" />
        ) : (
          <Moon className="w-4 h-4 text-sky-500" />
        )}
        <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
          {theme === 'dark' ? 'Light Mode' : theme === 'light' ? 'Comic Mode' : 'Dark Mode'}
        </span>
      </button>

      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 glass-panel p-8 sm:p-10 rounded-3xl relative overflow-hidden shadow-2xl">

        {/* Brand Header */}
        <div className="text-center space-y-3 relative z-10">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-xl shadow-blue-500/30 border border-blue-400/30 mb-1">
            <Wrench className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Project KEYSTONE</h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Meridian Field Service Management System of Record
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 p-3.5 rounded-xl text-xs sm:text-sm text-center font-medium shadow-md">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-blue-400 pointer-events-none z-10" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@meridian.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-blue-400 pointer-events-none z-10" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-xl text-sm font-medium focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-blue-400 hover:text-white transition-colors z-10"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full py-3.5 text-base font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-xl shadow-blue-600/30 text-white rounded-xl transition-all"
            icon={<ArrowRight className="w-5 h-5" />}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
};
