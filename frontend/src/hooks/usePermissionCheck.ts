import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface UsePermissionCheckProps {
  permissionType: 'profesores' | 'apoderados' | 'alumnos' | 'administrativos';
  redirectPath?: string;
}

export function usePermissionCheck({ permissionType, redirectPath = '/administrativo/dashboard' }: UsePermissionCheckProps) {
  const [permisoVerificado, setPermisoVerificado] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, hasRole } = useAuth();

  useEffect(() => {
    if (user && !permisoVerificado && loading) {
      verificarPermisos();
    }
  }, [user, hasRole]);

  const verificarPermisos = async () => {
    console.log(`🔍 [${permissionType}] Verificando permisos para usuario:`, user?.id);
    
    try {
      if (hasRole('DIRECTOR')) {
        setPermisoVerificado(true);
        setLoading(false);
        return;
      }

      if (hasRole('ADMINISTRATIVO')) {
        // Obtener el ID del administrativo dinámicamente
        const adminListResponse = await fetch('http://localhost:3001/api/administrativos', {
          credentials: 'include',
        });
        
        if (!adminListResponse.ok) {
          throw new Error('Error al obtener información del administrativo');
        }
        
        const adminList = await adminListResponse.json();
        const adminMatch = adminList.find((admin: any) => admin.usuarioRol.usuario.id === user?.id);
        
        if (!adminMatch) {
          alert('No se encontró información del administrativo');
          router.push(redirectPath);
          return;
        }
        
        const response = await fetch(`http://localhost:3001/api/permisos/verificar/${adminMatch.id}/${permissionType}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.tienePermiso) {
            setPermisoVerificado(true);
          } else {
            alert(`No tienes permisos para gestionar ${permissionType}. Contacta al director.`);
            router.push(redirectPath);
          }
        } else {
          alert('Error al verificar permisos');
          router.push(redirectPath);
        }
      } else {
        alert('No tienes permisos para acceder a esta página');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error verificando permisos:', error);
      alert('Error de conexión al verificar permisos');
      router.push(redirectPath);
    } finally {
      setLoading(false);
    }
  };

  return { permisoVerificado, loading };
}
