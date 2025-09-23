'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import FormularioAlumno from '../../../../components/forms/FormularioAlumno';
import { AlumnoFormData } from '@/types/alumno';

function CrearAlumnoAdministrativoContent() {
  const [loading, setLoading] = useState(true);
  const [tienePermiso, setTienePermiso] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    verificarPermisos();
  }, []);

  const verificarPermisos = async () => {
    try {
      setLoading(true);
      
      // Obtener información del usuario autenticado
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
        throw new Error('No se pudo encontrar el ID del administrativo');
      }

      // Verificar permisos específicos para registrar alumnos
      const permisosResponse = await fetch(`http://localhost:3001/api/permisos/verificar/${administrativoId}/alumnos`, {
        credentials: 'include',
      });

      if (permisosResponse.ok) {
        const permisosData = await permisosResponse.json();
        setTienePermiso(permisosData.tienePermiso);
        
        if (!permisosData.tienePermiso) {
          setError('No tienes permisos para registrar alumnos. Contacta con tu director.');
        }
      } else {
        throw new Error('Error al verificar permisos');
      }

    } catch (error) {
      console.error('Error al verificar permisos:', error);
      setError(error instanceof Error ? error.message : 'Error al verificar permisos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: AlumnoFormData) => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:3001/api/alumnos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          dni: formData.dni || null,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          fechaNacimiento: formData.fechaNacimiento || null,
          sexo: formData.sexo || null,
          nacionalidad: formData.nacionalidad || 'Peruana',
          direccion: formData.direccion || null,
          distrito: formData.distrito || null,
          numeroContacto: formData.numeroContacto || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar el alumno');
      }

      const result = await response.json();
      
      setSuccess('¡Alumno registrado exitosamente!');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/administrativo/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error al registrar alumno:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!tienePermiso) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Acceso Denegado</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>No tienes permisos para registrar alumnos.</p>
                  <p className="mt-2">Contacta con tu director para solicitar este permiso.</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/administrativo/dashboard')}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Volver al Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Registrar Nuevo Alumno</h1>
              <p className="mt-2 text-gray-600">
                Complete la información del alumno para registrarlo en el sistema
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">Administrativo:</p>
              <p className="font-medium text-gray-900">
                {user?.nombres} {user?.apellidos}
              </p>
            </div>
          </div>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error al registrar alumno</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">¡Éxito!</h3>
                <p className="mt-1 text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <FormularioAlumno
          onSubmit={handleSubmit}
          loading={submitting}
          title="Registrar Nuevo Alumno"
        />

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Información importante</h3>
              <div className="mt-1 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Los campos marcados con (*) son obligatorios</li>
                  <li>El DNI es opcional pero recomendado para identificación única</li>
                  <li>La información académica (grado, sección) se asignará posteriormente</li>
                  <li>Este permiso fue otorgado por tu director</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CrearAlumnoAdministrativo() {
  return (
    <ProtectedRoute requiredRole="ADMINISTRATIVO">
      <CrearAlumnoAdministrativoContent />
    </ProtectedRoute>
  );
}
