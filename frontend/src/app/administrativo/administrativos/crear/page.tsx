'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import ProtectedRoute from '../../../../components/ProtectedRoute';

// Reutilizar el formulario como componente
import FormularioAdministrativo from '../../../../components/forms/FormularioAdministrativo';

function CrearAdministrativoAdministrativoContent() {
  const [loading, setLoading] = useState(true);
  const [tienePermiso, setTienePermiso] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    verificarPermisos();
  }, []);

  const verificarPermisos = async () => {
    try {
      // Obtener información del administrativo actual
      const response = await fetch('http://localhost:3001/auth/me', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener información del usuario');
      }

      const responseData = await response.json();
      const userData = responseData.user;
      
      // Buscar el rol de administrativo
      const rolAdministrativo = userData.roles?.find((rol: any) => 
        rol.rol === 'ADMINISTRATIVO'
      );

      if (!rolAdministrativo) {
        throw new Error('Usuario no es administrativo');
      }

      // Buscar el ID del administrativo
      const adminListResponse = await fetch('http://localhost:3001/api/administrativos', {
        credentials: 'include',
      });
      
      let administrativoId = null;
      if (adminListResponse.ok) {
        const adminList = await adminListResponse.json();
        const adminMatch = adminList.find((admin: any) => admin.usuarioRol.usuario.id === userData.id);
        if (adminMatch) {
          administrativoId = adminMatch.id;
        }
      }

      if (!administrativoId) {
        throw new Error('No se encontró el perfil de administrativo');
      }

      // Verificar permiso específico
      const permisoResponse = await fetch(`http://localhost:3001/api/permisos/verificar/${administrativoId}/administrativos`, {
        credentials: 'include',
      });

      if (permisoResponse.ok) {
        const permisoData = await permisoResponse.json();
        setTienePermiso(permisoData.tienePermiso);
      } else {
        setTienePermiso(false);
      }

    } catch (error) {
      console.error('Error al verificar permisos:', error);
      setTienePermiso(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!tienePermiso) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-100 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sin Permisos</h2>
          <p className="text-gray-600 mb-6">
            No tienes permisos para registrar personal administrativo. Contacta al director para obtener los permisos necesarios.
          </p>
          <button
            onClick={() => router.push('/administrativo/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/administrativo/dashboard')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Registrar Administrativo</h1>
                <p className="text-sm text-gray-600">Agregar nuevo personal administrativo al sistema</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.nombres} {user?.apellidos}</p>
                <p className="text-xs text-gray-500">Administrativo</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FormularioAdministrativo 
          redirectPath="/administrativo/dashboard"
          onSuccess={() => router.push('/administrativo/dashboard')}
        />
      </main>
    </div>
  );
}

export default function CrearAdministrativoAdministrativo() {
  return (
    <ProtectedRoute requiredRole="ADMINISTRATIVO">
      <CrearAdministrativoAdministrativoContent />
    </ProtectedRoute>
  );
}
