"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProfesorNavbar from '@/components/layout/ProfesorNavbar';
import { PeriodoAcademico, ProfesorAsignacion } from '@/types/evaluaciones';
import {
  CalendarIcon,
  AcademicCapIcon,
  BookOpenIcon,
  BuildingOffice2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface AsignacionConPeriodo {
  asignacionId: number;
  curso: string;
  salon: string;
  nivel: string;
  fechaInicio: string;
  fechaFin: string;
}

interface PeriodoConAsignaciones {
  id: number;
  nombre: string;
  tipo: string;
  orden: number;
  asignaciones: AsignacionConPeriodo[];
}

interface AnioAcademico {
  anioAcademico: number;
  periodos: PeriodoConAsignaciones[];
}

export default function HojasAnterioresPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [aniosAcademicos, setAniosAcademicos] = useState<AnioAcademico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 3; // 3 años académicos por página

  // Filtros
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    anioAcademico: '',
    periodoNombre: '',
    cursoNombre: '',
    salonNombre: '',
    nivelEducativo: ''
  });

  // Obtener el ID del profesor desde el usuario autenticado
  const getProfesorId = async () => {
    if (!user?.id) return null;

    try {
      const response = await fetch(`http://localhost:3001/api/profesores/by-user/${user.id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📍 Respuesta de profesor:', data);

        // El endpoint devuelve { success: true, profesor: {...} }
        if (data.success && data.profesor) {
          return data.profesor.id || null;
        } else if (data.id) {
          return data.id;
        }

        console.error('❌ Estructura de respuesta inesperada:', data);
        return null;
      } else {
        console.error('❌ Error en respuesta:', response.status);
      }
    } catch (error) {
      console.error('❌ Error obteniendo ID del profesor:', error);
    }
    return null;
  };

  // Cargar períodos anteriores con paginación y filtros
  const cargarPeriodosAnteriores = async () => {
    setLoading(true);
    setError(null);

    try {
      const profesorId = await getProfesorId();
      if (!profesorId) {
        setError('No se pudo obtener la información del profesor');
        return;
      }

      // Obtener períodos anteriores
      const periodosResponse = await fetch('http://localhost:3001/api/periodos-academicos/profesor/anteriores', {
        credentials: 'include'
      });

      if (!periodosResponse.ok) {
        throw new Error('Error al cargar períodos anteriores');
      }

      const periodosData = await periodosResponse.json();
      const periodosAnteriores = periodosData.data.periodosAnteriores || [];

      // Obtener asignaciones del profesor
      const asignacionesResponse = await fetch(`http://localhost:3001/api/profesor-asignaciones/profesor/${profesorId}`, {
        credentials: 'include'
      });

      if (!asignacionesResponse.ok) {
        throw new Error('Error al cargar las asignaciones');
      }

      const asignacionesData = await asignacionesResponse.json();
      const asignaciones = asignacionesData.data.asignaciones || [];

      // Agrupar por año académico y período
      const porAnio = new Map<number, Map<number, PeriodoConAsignaciones>>();

      periodosAnteriores.forEach((periodo: PeriodoAcademico) => {
        const anio = periodo.anioAcademico;

        // Aplicar filtro de año
        if (filtros.anioAcademico && anio.toString() !== filtros.anioAcademico) return;

        // Aplicar filtro de período
        if (filtros.periodoNombre && !periodo.nombre.toLowerCase().includes(filtros.periodoNombre.toLowerCase())) return;

        if (!porAnio.has(anio)) {
          porAnio.set(anio, new Map());
        }

        const periodoMap = porAnio.get(anio)!;

        if (!periodoMap.has(periodo.id)) {
          periodoMap.set(periodo.id, {
            id: periodo.id,
            nombre: periodo.nombre,
            tipo: periodo.tipo,
            orden: periodo.orden,
            asignaciones: []
          });
        }

        // Agregar asignaciones a este período
        asignaciones.forEach((asignacion: ProfesorAsignacion) => {
          const cursoNombre = asignacion.curso.nombre;
          const salonNombre = `${asignacion.salon.grado}° ${asignacion.salon.seccion}`;
          const nivelNombre = asignacion.salon.colegioNivel.nivel.nombre;

          // Aplicar filtros
          if (filtros.cursoNombre && !cursoNombre.toLowerCase().includes(filtros.cursoNombre.toLowerCase())) return;
          if (filtros.salonNombre && !salonNombre.toLowerCase().includes(filtros.salonNombre.toLowerCase())) return;
          if (filtros.nivelEducativo && !nivelNombre.toLowerCase().includes(filtros.nivelEducativo.toLowerCase())) return;

          periodoMap.get(periodo.id)!.asignaciones.push({
            asignacionId: asignacion.id,
            curso: cursoNombre,
            salon: salonNombre,
            nivel: nivelNombre,
            fechaInicio: periodo.fechaInicio,
            fechaFin: periodo.fechaFin
          });
        });
      });

      // Convertir a array y ordenar
      const aniosArray: AnioAcademico[] = Array.from(porAnio.entries())
        .map(([anio, periodosMap]) => ({
          anioAcademico: anio,
          periodos: Array.from(periodosMap.values())
            .filter(p => p.asignaciones.length > 0) // Solo períodos con asignaciones
            .sort((a, b) => a.orden - b.orden) // Ordenar por orden del período
        }))
        .filter(a => a.periodos.length > 0) // Solo años con períodos
        .sort((a, b) => b.anioAcademico - a.anioAcademico);

      // Calcular paginación
      const total = aniosArray.length;
      setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));

      // Paginar
      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const paginados = aniosArray.slice(start, end);

      setAniosAcademicos(paginados);
    } catch (error) {
      console.error('Error cargando períodos anteriores:', error);
      setError('Error al cargar períodos anteriores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      cargarPeriodosAnteriores();
    }
  }, [user, page, filtros]);

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      anioAcademico: '',
      periodoNombre: '',
      cursoNombre: '',
      salonNombre: '',
      nivelEducativo: ''
    });
    setPage(1);
  };

  // Manejar selección de período y asignación
  const handleVerHojaTrabajo = (asignacionId: number, periodoId: number) => {
    router.push(`/profesor/evaluaciones?asignacionId=${asignacionId}&periodoId=${periodoId}&readonly=true`);
  };

  return (
    <ProtectedRoute requiredRole="PROFESOR">
      <ProfesorNavbar>
        <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9] p-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] rounded-2xl shadow-2xl p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <CalendarIcon className="h-8 w-8" />
                  Hojas de Trabajo Anteriores
                </h1>
                <p className="text-white/90 mt-2">
                  Consulta tus registros de períodos académicos pasados
                </p>
              </div>
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
              >
                <FunnelIcon className="h-5 w-5" />
                {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>
            </div>
          </div>

          {/* Panel de Filtros */}
          {mostrarFiltros && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-[#E9E1C9]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#8D2C1D] flex items-center gap-2">
                  <FunnelIcon className="h-5 w-5" />
                  Filtros de Búsqueda
                </h3>
                <button
                  onClick={limpiarFiltros}
                  className="text-sm text-gray-600 hover:text-[#8D2C1D] flex items-center gap-1"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Limpiar
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Año Académico */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Año Académico
                  </label>
                  <input
                    type="number"
                    placeholder="2025"
                    value={filtros.anioAcademico}
                    onChange={(e) => {
                      setFiltros({ ...filtros, anioAcademico: e.target.value });
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D]"
                  />
                </div>

                {/* Período */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Período
                  </label>
                  <input
                    type="text"
                    placeholder="BIMESTRE I"
                    value={filtros.periodoNombre}
                    onChange={(e) => {
                      setFiltros({ ...filtros, periodoNombre: e.target.value });
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D]"
                  />
                </div>

                {/* Curso */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Curso
                  </label>
                  <input
                    type="text"
                    placeholder="Matemáticas"
                    value={filtros.cursoNombre}
                    onChange={(e) => {
                      setFiltros({ ...filtros, cursoNombre: e.target.value });
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D]"
                  />
                </div>

                {/* Salón */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salón
                  </label>
                  <input
                    type="text"
                    placeholder="5° A"
                    value={filtros.salonNombre}
                    onChange={(e) => {
                      setFiltros({ ...filtros, salonNombre: e.target.value });
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D]"
                  />
                </div>

                {/* Nivel */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nivel Educativo
                  </label>
                  <select
                    value={filtros.nivelEducativo}
                    onChange={(e) => {
                      setFiltros({ ...filtros, nivelEducativo: e.target.value });
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D]"
                  >
                    <option value="">Todos</option>
                    <option value="Inicial">Inicial</option>
                    <option value="Primaria">Primaria</option>
                    <option value="Secundaria">Secundaria</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Contenido */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D] mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando hojas anteriores...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center shadow-lg">
              <div className="text-red-600 mb-2 text-4xl">⚠️</div>
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Reintentar
              </button>
            </div>
          ) : aniosAcademicos.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-[#E9E1C9]">
              <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                No hay hojas anteriores
              </h3>
              <p className="text-gray-500">
                {Object.values(filtros).some(v => v !== '')
                  ? 'No se encontraron registros con los filtros aplicados'
                  : 'Aún no tienes períodos académicos anteriores para consultar'}
              </p>
            </div>
          ) : (
            <>
              {/* Grid de Años Académicos */}
              <div className="space-y-6">
                {aniosAcademicos.map((anio) => (
                  <div key={anio.anioAcademico} className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-[#E9E1C9]">
                    {/* Header del Año */}
                    <div className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] p-4">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <AcademicCapIcon className="h-6 w-6" />
                        Año Académico {anio.anioAcademico}
                        <span className="text-sm font-normal text-white/80 ml-2">
                          ({anio.periodos.length} período{anio.periodos.length !== 1 ? 's' : ''})
                        </span>
                      </h2>
                    </div>

                    {/* Períodos en Columnas */}
                    <div className="p-6">
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {anio.periodos.map((periodo) => (
                          <div key={periodo.id} className="flex flex-col">
                            {/* Header del Período */}
                            <div className="bg-gradient-to-br from-[#8D2C1D] to-[#D96924] text-white p-3 rounded-t-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <CalendarIcon className="h-4 w-4" />
                                <h3 className="font-bold text-sm">
                                  {periodo.tipo}
                                </h3>
                              </div>
                              <p className="text-xs text-white/90">{periodo.nombre}</p>
                            </div>

                            {/* Asignaciones del Período */}
                            <div className="flex-1 bg-gradient-to-br from-[#FCE0C1] to-[#E9E1C9] p-3 rounded-b-lg border-2 border-[#8D2C1D]/20 space-y-2">
                              {periodo.asignaciones.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">
                                  Sin asignaciones
                                </p>
                              ) : (
                                periodo.asignaciones.map((asignacion, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleVerHojaTrabajo(asignacion.asignacionId, periodo.id)}
                                    className="w-full text-left bg-white/80 hover:bg-white border border-[#8D2C1D]/20 hover:border-[#8D2C1D] rounded-lg p-3 transition-all hover:shadow-md"
                                  >
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-2">
                                        <BookOpenIcon className="h-4 w-4 text-[#8D2C1D]" />
                                        <span className="font-medium text-[#8D2C1D] text-sm">
                                          {asignacion.curso}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <BuildingOffice2Icon className="h-4 w-4 text-gray-600" />
                                        <span className="text-xs text-gray-700">
                                          {asignacion.salon} - {asignacion.nivel}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-3 w-3 text-gray-500" />
                                        <span className="text-xs text-gray-600">
                                          {new Date(asignacion.fechaInicio).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })} - {new Date(asignacion.fechaFin).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                                        </span>
                                      </div>
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 border-2 border-[#E9E1C9] hover:border-[#8D2C1D]"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                    Anterior
                  </button>

                  <span className="text-gray-700 font-medium">
                    Página {page} de {totalPages}
                  </span>

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 border-2 border-[#E9E1C9] hover:border-[#8D2C1D]"
                  >
                    Siguiente
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </ProfesorNavbar>
    </ProtectedRoute>
  );
}
