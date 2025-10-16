"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ProfesorAsignacion, PeriodoAcademico } from '@/types/evaluaciones';
import AsignacionCard from '@/components/profesor/AsignacionCard';
import LoadingCard from '@/components/profesor/LoadingCard';
import ModalSeleccionPeriodo from '@/components/modals/ModalSeleccionPeriodo';
import SimpleHeader from '@/components/layout/SimpleHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { AcademicCapIcon, BookOpenIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface AsignacionesResponse {
  success: boolean;
  data: {
    asignaciones: ProfesorAsignacion[];
    totalAsignaciones: number;
  };
}

export default function ProfesorDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [asignaciones, setAsignaciones] = useState<ProfesorAsignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el modal de selección de período
  const [modalPeriodoAbierto, setModalPeriodoAbierto] = useState(false);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState<ProfesorAsignacion | null>(null);
  
  // Estados para filtros y paginación
  const [filtroNivel, setFiltroNivel] = useState<string>('TODOS');
  const [paginaActual, setPaginaActual] = useState(1);
  const ELEMENTOS_POR_PAGINA = 20;

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

  // Manejar click en "Registrar Notas"
  const handleRegistrarNotas = (asignacion: ProfesorAsignacion) => {
    // Asegurar que colegioId esté disponible desde salon.colegioId
    const asignacionConColegio = {
      ...asignacion,
      colegioId: asignacion.salon.colegioId
    };
    setAsignacionSeleccionada(asignacionConColegio);
    setModalPeriodoAbierto(true);
  };

  // Manejar selección de período
  const handlePeriodoSeleccionado = (asignacion: ProfesorAsignacion, periodo: PeriodoAcademico) => {
    // Navegar a la página de evaluaciones con los parámetros necesarios
    router.push(`/profesor/evaluaciones?asignacionId=${asignacion.id}&periodoId=${periodo.id}`);
  };

  // Filtrar asignaciones por nivel
  const asignacionesFiltradas = asignaciones.filter(asignacion => {
    if (filtroNivel === 'TODOS') return true;
    return asignacion.salon.colegioNivel.nivel.nombre === filtroNivel;
  });

  // Paginación
  const totalPaginas = Math.ceil(asignacionesFiltradas.length / ELEMENTOS_POR_PAGINA);
  const indiceInicio = (paginaActual - 1) * ELEMENTOS_POR_PAGINA;
  const indiceFin = indiceInicio + ELEMENTOS_POR_PAGINA;
  const asignacionesPaginadas = asignacionesFiltradas.slice(indiceInicio, indiceFin);

  // Obtener niveles únicos para el filtro
  const nivelesUnicos = Array.from(new Set(asignaciones.map(a => a.salon.colegioNivel.nivel.nombre)));

  // Agrupar asignaciones por nivel educativo
  const asignacionesPorNivel = asignacionesPaginadas.reduce((acc, asignacion) => {
    const nivel = asignacion.salon.colegioNivel.nivel.nombre;
    if (!acc[nivel]) {
      acc[nivel] = [];
    }
    acc[nivel].push(asignacion);
    return acc;
  }, {} as Record<string, ProfesorAsignacion[]>);

  return (
    <ProtectedRoute requiredRole="PROFESOR">
      <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9] flex flex-col">
        {/* Header Simple */}
        <SimpleHeader 
          title="Dashboard del Profesor"
          showBackButton={false}
          showForwardButton={true}
          dashboardPath="/profesor/dashboard"
        />

        {/* Contenido principal */}
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filtros */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setFiltroNivel('TODOS');
                    setPaginaActual(1);
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                    filtroNivel === 'TODOS'
                      ? 'bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white shadow-lg'
                      : 'bg-white/80 text-[#8D2C1D] border-2 border-[#E9E1C9] hover:border-[#8D2C1D]'
                  }`}
                >
                  Todos ({asignaciones.length})
                </button>
                {nivelesUnicos.map((nivel) => {
                  const count = asignaciones.filter(a => a.salon.colegioNivel.nivel.nombre === nivel).length;
                  return (
                    <button
                      key={nivel}
                      onClick={() => {
                        setFiltroNivel(nivel);
                        setPaginaActual(1);
                      }}
                      className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                        filtroNivel === nivel
                          ? 'bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white shadow-lg'
                          : 'bg-white/80 text-[#8D2C1D] border-2 border-[#E9E1C9] hover:border-[#8D2C1D]'
                      }`}
                    >
                      {nivel} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas con paleta de marca - SIEMPRE EN UNA FILA */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6 border-2 border-[#E9E1C9] hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left">
                <div className="bg-gradient-to-br from-[#8D2C1D] to-[#D96924] p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-md mb-2 sm:mb-0">
                  <BookOpenIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-[#666666] leading-tight">Total Asignaciones</p>
                  <p className="text-lg sm:text-2xl font-bold text-[#8D2C1D]">{asignacionesFiltradas.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6 border-2 border-[#E9E1C9] hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left">
                <div className="bg-gradient-to-br from-[#8D2C1D] to-[#D96924] p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-md mb-2 sm:mb-0">
                  <BuildingOfficeIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-[#666666] leading-tight">Niveles Educativos</p>
                  <p className="text-lg sm:text-2xl font-bold text-[#8D2C1D]">{nivelesUnicos.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6 border-2 border-[#E9E1C9] hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left">
                <div className="bg-gradient-to-br from-[#8D2C1D] to-[#D96924] p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-md mb-2 sm:mb-0">
                  <AcademicCapIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-[#666666] leading-tight">Cursos Únicos</p>
                  <p className="text-lg sm:text-2xl font-bold text-[#8D2C1D]">
                    {new Set(asignacionesFiltradas.map(a => a.curso.id)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido de asignaciones */}
          {loading ? (
            <div className="space-y-8">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9]">
                <div className="px-6 py-4 border-b border-[#E9E1C9]">
                  <div className="h-6 bg-[#E9E1C9] rounded w-32 animate-pulse"></div>
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
            <div className="bg-red-50/95 backdrop-blur-sm border-2 border-red-200 rounded-xl p-6 text-center shadow-lg">
              <div className="text-red-600 mb-2">⚠️ Error</div>
              <p className="text-red-700">{error}</p>
              <button
                onClick={cargarAsignaciones}
                className="mt-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Reintentar
              </button>
            </div>
          ) : asignacionesFiltradas.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-sm border-2 border-[#E9E1C9] rounded-xl p-12 text-center shadow-lg">
              <AcademicCapIcon className="h-16 w-16 text-[#8D2C1D] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#8D2C1D] mb-2">
                No tienes asignaciones activas
              </h3>
              <p className="text-[#666666]">
                Contacta al director de tu colegio para que te asigne cursos y salones.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(asignacionesPorNivel).map(([nivel, asignacionesNivel]) => (
                <div key={nivel} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9] hover:shadow-xl transition-all duration-300">
                  <div className="px-6 py-4 border-b border-[#E9E1C9]">
                    <h2 className="text-xl font-bold text-[#8D2C1D] flex items-center">
                      <span className={`inline-block w-3 h-3 rounded-full mr-3 shadow-sm ${
                        nivel === 'INICIAL' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                        nivel === 'PRIMARIA' ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                        nivel === 'SECUNDARIA' ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'
                      }`}></span>
                      {nivel}
                      <span className="ml-2 text-sm font-normal text-[#666666]">
                        ({asignacionesNivel.length} asignación{asignacionesNivel.length !== 1 ? 'es' : ''})
                      </span>
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                      {asignacionesNivel.map((asignacion) => (
                        <AsignacionCard
                          key={asignacion.id}
                          asignacion={asignacion}
                          onRegistrarNotas={handleRegistrarNotas}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación - Responsive mejorada */}
          {totalPaginas > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-2">
              <button
                onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-xl bg-white/80 text-[#8D2C1D] border-2 border-[#E9E1C9] hover:border-[#8D2C1D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm font-semibold"
              >
                Anterior
              </button>
              
              <div className="flex gap-1 flex-wrap justify-center">
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                  <button
                    key={pagina}
                    onClick={() => setPaginaActual(pagina)}
                    className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${
                      paginaActual === pagina
                        ? 'bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white shadow-lg'
                        : 'bg-white/80 text-[#8D2C1D] hover:bg-[#FCE0C1]'
                    }`}
                  >
                    {pagina}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                disabled={paginaActual === totalPaginas}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-xl bg-white/80 text-[#8D2C1D] border-2 border-[#E9E1C9] hover:border-[#8D2C1D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm font-semibold"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {/* Footer Reutilizable */}
        <DashboardFooter />

        {/* Modal de selección de período */}
        <ModalSeleccionPeriodo
          isOpen={modalPeriodoAbierto}
          onClose={() => {
            setModalPeriodoAbierto(false);
            setAsignacionSeleccionada(null);
          }}
          asignacion={asignacionSeleccionada}
          onPeriodoSeleccionado={handlePeriodoSeleccionado}
        />
      </div>
    </ProtectedRoute>
  );
}
