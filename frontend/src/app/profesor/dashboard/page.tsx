"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ProfesorAsignacion } from '@/types/profesor-asignacion';
import AsignacionCard from '@/components/profesor/AsignacionCard';
import LoadingCard from '@/components/profesor/LoadingCard';
import { AcademicCapIcon, BookOpenIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface AsignacionesResponse {
  success: boolean;
  data: {
    asignaciones: ProfesorAsignacion[];
    totalAsignaciones: number;
  };
}

export default function ProfesorDashboard() {
  const { user } = useAuth();
  const [asignaciones, setAsignaciones] = useState<ProfesorAsignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener el ID del profesor desde el usuario autenticado
  const getProfesorId = async () => {
    if (!user?.id) return null;
    
    try {
      // Buscar en la tabla profesor usando el usuario_id
      const response = await fetch(`/api/profesores/by-user/${user.id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.profesor?.id || null;
      }
    } catch (error) {
      console.error('Error obteniendo ID del profesor:', error);
    }
    return null;
  };

  // Cargar asignaciones del profesor
  const cargarAsignaciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const profesorId = await getProfesorId();
      if (!profesorId) {
        setError('No se pudo obtener la información del profesor');
        return;
      }

      const response = await fetch(`/api/profesor-asignaciones/profesor/${profesorId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar las asignaciones');
      }

      const data: AsignacionesResponse = await response.json();
      setAsignaciones(data.data.asignaciones);
    } catch (error) {
      console.error('Error cargando asignaciones:', error);
      setError('Error al cargar las asignaciones del profesor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      cargarAsignaciones();
    }
  }, [user]);

  // Agrupar asignaciones por nivel educativo
  const asignacionesPorNivel = asignaciones.reduce((acc, asignacion) => {
    const nivel = asignacion.salon.colegioNivel.nivel.nombre;
    if (!acc[nivel]) {
      acc[nivel] = [];
    }
    acc[nivel].push(asignacion);
    return acc;
  }, {} as Record<string, ProfesorAsignacion[]>);

  return (
    <ProtectedRoute requiredRole="PROFESOR">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Dashboard del Profesor
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Bienvenido, {user?.nombres} {user?.apellidos}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <AcademicCapIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex items-center">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <BookOpenIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Asignaciones</p>
                  <p className="text-2xl font-bold text-gray-900">{asignaciones.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex items-center">
                <div className="bg-green-50 p-3 rounded-lg">
                  <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Niveles Educativos</p>
                  <p className="text-2xl font-bold text-gray-900">{Object.keys(asignacionesPorNivel).length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex items-center">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <AcademicCapIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Cursos Únicos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(asignaciones.map(a => a.curso.id)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido de asignaciones */}
          {loading ? (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <LoadingCard key={i} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-red-600 mb-2">⚠️ Error</div>
              <p className="text-red-700">{error}</p>
              <button
                onClick={cargarAsignaciones}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : asignaciones.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes asignaciones activas
              </h3>
              <p className="text-gray-500">
                Contacta al director de tu colegio para que te asigne cursos y salones.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(asignacionesPorNivel).map(([nivel, asignacionesNivel]) => (
                <div key={nivel} className="bg-white rounded-lg shadow-sm border">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <span className={`inline-block w-3 h-3 rounded-full mr-3 ${
                        nivel === 'INICIAL' ? 'bg-yellow-500' :
                        nivel === 'PRIMARIA' ? 'bg-blue-500' :
                        nivel === 'SECUNDARIA' ? 'bg-green-500' : 'bg-gray-500'
                      }`}></span>
                      {nivel}
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({asignacionesNivel.length} asignación{asignacionesNivel.length !== 1 ? 'es' : ''})
                      </span>
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {asignacionesNivel.map((asignacion) => (
                        <AsignacionCard
                          key={asignacion.id}
                          asignacion={asignacion}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
