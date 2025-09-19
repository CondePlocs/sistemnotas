"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, User, LoginData } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await authAPI.checkAuth();
      setUser(userData);
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      const response = await authAPI.login(data);
      const userData = response.user;
      const userRole = userData.roles?.[0]?.rol;
      if (userRole === 'OWNER') {
        router.push('/owner/dashboard');
      } else if (userRole === 'DIRECTOR') {
        router.push('/director/dashboard');
      } else if (userRole === 'ADMINISTRATIVO') {
        router.push('/administrativo/dashboard');
      } else if (userRole === 'PROFESOR') {
        router.push('/profesor/dashboard');
      } else if (userRole === 'APODERADO') {
        router.push('/apoderado/dashboard');
      } else {
        // Para otros roles, redirigir a una página por defecto
        router.push('/dashboard');
      }
      setUser(userData);
    } catch (error) {
      throw error; // Re-lanzar para manejar en el componente
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      // Redirigir al login
      window.location.href = '/login';
    } catch (error) {
      console.error('Error en logout:', error);
      // Forzar logout local aunque falle el servidor
      setUser(null);
      window.location.href = '/login';
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.some(r => r.rol === role);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
