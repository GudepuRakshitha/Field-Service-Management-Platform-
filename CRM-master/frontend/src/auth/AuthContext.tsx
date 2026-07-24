import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthResponse, Role, User } from '../api/types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  isManager: boolean;
  isDispatcher: boolean;
  isTechnician: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('keystone_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      api.getCurrentUser()
        .then((userData) => {
          setUser(userData);
        })
        .catch((err) => {
          console.error('Failed to load current user details', err);
          localStorage.removeItem('keystone_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (authData: AuthResponse) => {
    localStorage.setItem('keystone_token', authData.token);
    setUser({
      id: authData.userId,
      name: authData.name,
      email: authData.email,
      role: authData.role,
      customerId: authData.customerId,
    });
    setToken(authData.token);
  };

  const logout = () => {
    localStorage.removeItem('keystone_token');
    setToken(null);
    setUser(null);
  };

  const role = user?.role;
  const isManager = role === 'MANAGER';
  const isDispatcher = role === 'DISPATCHER';
  const isTechnician = role === 'TECHNICIAN';
  const isCustomer = role === 'CUSTOMER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isManager,
        isDispatcher,
        isTechnician,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
