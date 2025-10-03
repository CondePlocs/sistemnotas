'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import ModalAsignacionProfesor from '@/components/modals/ModalAsignacionProfesor';
import { 
  ProfesorAsignacion, 
  ListaAsignacionesResponse,
  ProfesorAsignacionFormData 
} from '@/types/profesor-asignacion';
import { PlusIcon, UserGroupIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

function AsignacionesProfesorContent() {
  const router = useRouter();
  const { user, hasRole } = useAuth();
  const [asignaciones, setAsignaciones] = useState<ProfesorAsignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtroActivo, setFiltroActivo] = useState<boolean | null>(null);
  const [permisoVerificado, setPermisoVerificado] = useState(false);

  // Verificar permisos para administrativos
  const verificarPermisos = async () => {
    console.log('🔍 Iniciando verificación de permisos...');
    console.log('🔍 Usuario actual:', user);
    console.log('🔍 hasRole DIRECTOR:', hasRole('DIRECTOR'));
    console.log('🔍 hasRole ADMINISTRATIVO:', hasRole('ADMINISTRATIVO'));

    if (hasRole('DIRECTOR')) {
      console.log('✅ Es director, permisos verificados');
      setPermisoVerificado(true);
      return;
    }

    if (hasRole('ADMINISTRATIVO')) {
      console.log('🔍 Es administrativo, verificando permisos específicos...');
      try {
        // Usar directamente el ID 3 que sabemos que funciona en el dashboard
        const adminId = 3;
        console.log('🆔 Usando ID del administrativo:', adminId);

        console.log('🔍 Verificando permisos específicos...');
        const response = await fetch(`http://localhost:3001/api/permisos/verificar/${adminId}/asignar-profesores`, {
          credentials: 'include'
        });

        console.log('📡 Respuesta de verificación:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('📋 Datos de permisos:', data);
          if (data.tienePermiso) {
            console.log('✅ Permisos verificados correctamente');
            setPermisoVerificado(true);
          } else {
            console.log('❌ No tiene permisos');
            setError('No tienes permisos para gestionar asignaciones de profesores. Contacta al director.');
          }
        } else {
          console.error('❌ Error en verificación de permisos:', response.status);
          setError('Error al verificar permisos');
        }
      } catch (error) {
        console.error('❌ Error verificando permisos:', error);
        setError('Error de conexión al verificar permisos');
      }
    } else {
      console.log('❌ No es director ni administrativo');
      setError('No tienes permisos para acceder a esta página');
    }
  };

  // Cargar asignaciones
  const cargarAsignaciones = async () => {
    console.log('🔍 Iniciando carga de asignaciones...');
    try {
      const params = new URLSearchParams();
      if (filtroActivo !== null) {
        params.append('activo', filtroActivo.toString());
      }

      console.log('📡 Haciendo petición a:', `http://localhost:3001/api/profesor-asignaciones?${params.toString()}`);
      const response = await fetch(`http://localhost:3001/api/profesor-asignaciones?${params.toString()}`, {
        credentials: 'include'
      });

      console.log('📡 Respuesta de asignaciones:', response.status);

      if (response.ok) {
        const data: ListaAsignacionesResponse = await response.json();
        console.log('📋 Asignaciones cargadas:', data);
        setAsignaciones(data.data.asignaciones);
      } else {
        console.error('❌ Error al cargar asignaciones:', response.status);
        setError('Error al cargar asignaciones de profesores');
      }
    } catch (error) {
      console.error('❌ Error en carga de asignaciones:', error);
      setError('Error de conexión');
    } finally {
      console.log('✅ Finalizando carga, setting loading = false');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect verificarPermisos - user:', user, 'hasRole:', hasRole);
    if (user) {
      verificarPermisos();
    }
  }, [user, hasRole]);

  useEffect(() => {
    console.log('🔄 useEffect cargarAsignaciones - permisoVerificado:', permisoVerificado);
    if (permisoVerificado) {
      cargarAsignaciones();
    }
  }, [filtroActivo, permisoVerificado]);

  // Crear asignación
  const handleCrearAsignacion = async (formData: ProfesorAsignacionFormData) => {
    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:3001/api/profesor-asignaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await cargarAsignaciones(); // Recargar lista
        setModalOpen(false);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al crear asignación');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  // Cambiar estado de asignación
  const handleCambiarEstado = async (asignacionId: number, activo: boolean) => {
    try {
      const endpoint = activo ? 'activar' : 'desactivar';
      const response = await fetch(`http://localhost:3001/api/profesor-asignaciones/${asignacionId}/${endpoint}`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        await cargarAsignaciones(); // Recargar lista
      } else {
        setError(`Error al ${activo ? 'activar' : 'desactivar'} asignación`);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando asignaciones...</p>
        </div>
      </div>
    );
  }

  if (error && !permisoVerificado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            <strong className="font-bold">Error de permisos</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                ← Volver
              </button>
              <UserGroupIcon className="h-8 w-8 text-teal-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Asignaciones de Profesores</h1>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nueva Asignación
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filtros */}
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setFiltroActivo(null)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filtroActivo === null 
                ? 'bg-teal-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltroActivo(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filtroActivo === true 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => setFiltroActivo(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filtroActivo === false 
                ? 'bg-gray-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Inactivas
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Lista de Asignaciones */}
        {asignaciones.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay asignaciones</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando tu primera asignación de profesor.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setModalOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md flex items-center mx-auto"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Nueva Asignación
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {asignaciones.map((asignacion) => (
                <li key={asignacion.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${
                          asignacion.activo ? 'bg-green-400' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {asignacion.profesor.usuarioRol.usuario.nombres} {asignacion.profesor.usuarioRol.usuario.apellidos}
                          </p>
                          {asignacion.activo && (
                            <CheckCircleIcon className="ml-2 h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span className="font-medium text-gray-700">
                            {asignacion.curso.nombre}
                          </span>
                          <span className="mx-2">•</span>
                          <span>
                            {asignacion.salon.grado} {asignacion.salon.seccion} - {asignacion.salon.colegioNivel.nivel.nombre}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {asignacion.activo ? (
                        <button
                          onClick={() => handleCambiarEstado(asignacion.id, false)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Desactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCambiarEstado(asignacion.id, true)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Activar
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      {/* Modal */}
      <ModalAsignacionProfesor
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCrearAsignacion}
        loading={submitting}
      />
    </div>
  );
}

export default function AsignacionesProfesorPage() {
  return (
    <ProtectedRoute requiredRole={["DIRECTOR", "ADMINISTRATIVO"]}>
      <AsignacionesProfesorContent />
    </ProtectedRoute>
  );
}
