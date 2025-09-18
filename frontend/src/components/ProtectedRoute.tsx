"use client";

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, loading, hasRole, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Esperar a que termine de cargar

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Si requiere un rol específico y no lo tiene
    if (requiredRole && !hasRole(requiredRole)) {
      // Redirigir según el rol que tenga
      if (hasRole('OWNER')) {
        router.push('/owner/dashboard');
      } else if (hasRole('DIRECTOR')) {
        router.push('/director/dashboard');
      } else if (hasRole('PROFESOR')) {
        router.push('/profesor/dashboard');
      } else if (hasRole('ADMINISTRATIVO')) {
        router.push('/administrativo/dashboard');
      } else if (hasRole('APODERADO')) {
        router.push('/apoderado/dashboard');
      } else {
        router.push('/login');
      }
      return;
    }
  }, [user, loading, isAuthenticated, hasRole, requiredRole, router, redirectTo]);

  // Mostrar loading mientras verifica
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se está redirigiendo)
  if (!isAuthenticated) {
    return null;
  }

  // Si requiere rol y no lo tiene, no mostrar nada (se está redirigiendo)
  if (requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  // Todo bien, mostrar el contenido
  return <>{children}</>;
}
