"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import SimpleHeader from '@/components/layout/SimpleHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { PeriodoAcademico, ProfesorAsignacion } from '@/types/evaluaciones';

interface PeriodosAnterioresResponse {
  success: boolean;
  data: {
    periodosAnteriores: PeriodoAcademico[];
    periodosPorAnio: Record<number, PeriodoAcademico[]>;
    totalPeriodos: number;
    aniosAcademicos: number[];
  };
}

interface AsignacionesResponse {
  success: boolean;
  data: {
    asignaciones: ProfesorAsignacion[];
    totalAsignaciones: number;
  };
}

export default function HojasAnterioresPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [periodosAnteriores, setPeriodosAnteriores] = useState<PeriodoAcademico[]>([]);
  const [asignaciones, setAsignaciones] = useState<ProfesorAsignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<PeriodoAcademico | null>(null);

  // Obtener el ID del profesor desde el usuario autenticado
  const getProfesorId = async () => {
    if (!user?.id) return null;
    
    try {
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

  // Cargar períodos anteriores
  const cargarPeriodosAnteriores = async () => {
    try {
      const response = await fetch('/api/periodos-academicos/profesor/anteriores', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar períodos anteriores');
      }

      const data: PeriodosAnterioresResponse = await response.json();
      setPeriodosAnteriores(data.data.periodosAnteriores);
    } catch (error) {
      console.error('Error cargando períodos anteriores:', error);
      setError('Error al cargar períodos anteriores');
    }
  };

  // Cargar asignaciones del profesor
  const cargarAsignaciones = async () => {
    try {
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
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        cargarPeriodosAnteriores(),
        cargarAsignaciones()
      ]);
      
      setLoading(false);
    };

    if (user) {
      cargarDatos();
    }
  }, [user]);

  // Manejar selección de período y asignación
  const handleVerHojaTrabajo = (asignacion: ProfesorAsignacion, periodo: PeriodoAcademico) => {
    // Navegar a la página de evaluaciones en modo solo lectura
    router.push(`/profesor/evaluaciones?asignacionId=${asignacion.id}&periodoId=${periodo.id}&readonly=true`);
  };

  // Agrupar períodos por año académico
  const periodosPorAnio = periodosAnteriores.reduce((acc, periodo) => {
    const anio = periodo.anioAcademico;
    if (!acc[anio]) {
      acc[anio] = [];
    }
    acc[anio].push(periodo);
    return acc;
  }, {} as Record<number, PeriodoAcademico[]>);

  const aniosAcademicos = Object.keys(periodosPorAnio).map(Number).sort((a, b) => b - a);

  return (
    <ProtectedRoute requiredRole="PROFESOR">
      <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9] flex flex-col">
        {/* Header */}
        <SimpleHeader 
          title="Hojas de Trabajo Anteriores"
          showBackButton={true}
          showForwardButton={false}
          dashboardPath="/profesor/dashboard"
        />

        {/* Contenido principal */}
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Información */}
          <div className="bg-blue-50/95 backdrop-blur-sm border-2 border-blue-200 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 p-3 rounded-xl shadow-md">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  📚 Visualización de Hojas de Trabajo Anteriores
                </h3>
                <p className="text-blue-700 text-sm leading-relaxed">
                  Aquí puedes consultar tus hojas de trabajo de períodos académicos anteriores. 
                  <strong className="font-semibold"> Solo podrás visualizar las notas</strong>, no editarlas. 
                  Selecciona un período y una asignación para ver el registro histórico.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9] p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D] mx-auto mb-4"></div>
              <p className="text-[#8D2C1D] font-medium">Cargando períodos anteriores...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50/95 backdrop-blur-sm border-2 border-red-200 rounded-xl p-6 text-center shadow-lg">
              <div className="text-red-600 mb-2">⚠️ Error</div>
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Reintentar
              </button>
            </div>
          ) : periodosAnteriores.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-sm border-2 border-[#E9E1C9] rounded-xl p-12 text-center shadow-lg">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-[#8D2C1D] mb-2">
                No hay períodos anteriores disponibles
              </h3>
              <p className="text-[#666666]">
                Aún no tienes períodos académicos anteriores para consultar. 
                Los períodos aparecerán aquí cuando se desactiven.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {aniosAcademicos.map((anio) => (
                <div key={anio} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9]">
                  <div className="px-6 py-4 border-b border-[#E9E1C9]">
                    <h2 className="text-xl font-bold text-[#8D2C1D] flex items-center">
                      <span className="inline-block w-3 h-3 rounded-full mr-3 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] shadow-sm"></span>
                      Año Académico {anio}
                      <span className="ml-2 text-sm font-normal text-[#666666]">
                        ({periodosPorAnio[anio].length} período{periodosPorAnio[anio].length !== 1 ? 's' : ''})
                      </span>
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {periodosPorAnio[anio].map((periodo) => (
                        <div key={periodo.id} className="bg-gradient-to-br from-white to-[#FCE0C1]/30 rounded-xl p-6 border-2 border-[#E9E1C9] hover:border-[#8D2C1D] transition-all duration-300 hover:shadow-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-[#8D2C1D]">
                              {periodo.nombre}
                            </h3>
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                              {periodo.tipo}
                            </span>
                          </div>
                          
                          <div className="text-sm text-[#666666] mb-4 space-y-1">
                            <p><strong>Orden:</strong> {periodo.orden}</p>
                            <p><strong>Inicio:</strong> {new Date(periodo.fechaInicio).toLocaleDateString('es-PE')}</p>
                            <p><strong>Fin:</strong> {new Date(periodo.fechaFin).toLocaleDateString('es-PE')}</p>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm font-medium text-[#8D2C1D] mb-3">
                              Selecciona una asignación para ver:
                            </p>
                            {asignaciones.map((asignacion) => (
                              <button
                                key={asignacion.id}
                                onClick={() => handleVerHojaTrabajo(asignacion, periodo)}
                                className="w-full text-left bg-white/80 hover:bg-[#FCE0C1]/50 border border-[#E9E1C9] hover:border-[#8D2C1D] rounded-lg p-3 transition-all duration-300 hover:shadow-md"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-[#8D2C1D] text-sm">
                                      {asignacion.curso.nombre}
                                    </p>
                                    <p className="text-xs text-[#666666]">
                                      {asignacion.salon.grado}° {asignacion.salon.seccion} - {asignacion.salon.colegioNivel.nivel.nombre}
                                    </p>
                                  </div>
                                  <div className="text-[#8D2C1D]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <DashboardFooter />
      </div>
    </ProtectedRoute>
  );
}
