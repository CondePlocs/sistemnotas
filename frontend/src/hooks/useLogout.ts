'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook reutilizable para manejar el logout en todos los roles
 * Centraliza la lógica de cierre de sesión para evitar duplicación de código
 */
export function useLogout() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Aún así redirigir al login en caso de error
      router.push('/auth/login');
    }
  };

  return { handleLogout };
}
