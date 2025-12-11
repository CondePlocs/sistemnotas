import React, { useState, useMemo } from 'react';
import {
  BookOpenIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface Alumno {
  id: number;
  nombres: string;
  apellidos: string;
}

interface Competencia {
  id: number;
  nombre: string;
}

interface Evaluacion {
  id: number;
  nombre: string;
  competenciaId: number;
}

interface Nota {
  alumnoId: number;
  evaluacionId: number;
  nota: string | null;
}

interface TareaFaltante {
  evaluacionNombre: string;
  competenciaNombre: string;
}

interface AlumnoConTareasPendientes {
  id: number;
  nombres: string;
  apellidos: string;
  tareasFaltantes: TareaFaltante[];
}

interface ModalInformacionTareasProps {
  isOpen: boolean;
  onClose: () => void;
  alumnos: Alumno[];
  competencias: Competencia[];
  evaluaciones: Evaluacion[];
  notas: Nota[];
  cursoNombre: string;
  salonNombre: string;
}

export default function ModalInformacionTareas({
  isOpen,
  onClose,
  alumnos,
  competencias,
  evaluaciones,
  notas,
  cursoNombre,
  salonNombre
}: ModalInformacionTareasProps) {
  const [filtroCompetencia, setFiltroCompetencia] = useState<number | null>(null);
  const [filtroEvaluacion, setFiltroEvaluacion] = useState<number | null>(null);
  const [busquedaAlumno, setBusquedaAlumno] = useState('');
  const [mostrarModalPendientes, setMostrarModalPendientes] = useState(false);

  // Estados para el modal de pendientes
  const [busquedaPendientes, setBusquedaPendientes] = useState('');
  const [paginaPendientes, setPaginaPendientes] = useState(1);
  const ITEMS_POR_PAGINA = 5;

  // Calcular estadísticas de tareas faltantes
  const estadisticas = useMemo(() => {
    const evaluacionesFiltradas = filtroCompetencia
      ? evaluaciones.filter(e => e.competenciaId === filtroCompetencia)
      : evaluaciones;

    const evaluacionesEspecificas = filtroEvaluacion
      ? evaluacionesFiltradas.filter(e => e.id === filtroEvaluacion)
      : evaluacionesFiltradas;

    const alumnosFaltantes = alumnos.map(alumno => {
      const tareasRealizadas = evaluacionesEspecificas.filter(evaluacion =>
        notas.some(nota => nota.alumnoId === alumno.id && nota.evaluacionId === evaluacion.id && nota.nota !== null)
      ).length;

      const tareasFaltantes = evaluacionesEspecificas.length - tareasRealizadas;
      const porcentajeCompletado = evaluacionesEspecificas.length > 0
        ? Math.round((tareasRealizadas / evaluacionesEspecificas.length) * 100)
        : 0;

      // Obtener detalles de tareas faltantes
      const tareasFaltantesDetalle: TareaFaltante[] = evaluacionesEspecificas
        .filter(evaluacion =>
          !notas.some(nota => nota.alumnoId === alumno.id && nota.evaluacionId === evaluacion.id && nota.nota !== null)
        )
        .map(evaluacion => {
          const competencia = competencias.find(c => c.id === evaluacion.competenciaId);
          return {
            evaluacionNombre: evaluacion.nombre,
            competenciaNombre: competencia?.nombre || 'Sin competencia'
          };
        });

      return {
        ...alumno,
        tareasRealizadas,
        tareasFaltantes,
        porcentajeCompletado,
        totalTareas: evaluacionesEspecificas.length,
        tareasFaltantesDetalle
      };
    });

    // Filtrar por búsqueda
    const alumnosFiltrados = alumnosFaltantes.filter(alumno =>
      `${alumno.nombres} ${alumno.apellidos}`.toLowerCase().includes(busquedaAlumno.toLowerCase())
    );

    const totalTareas = evaluacionesEspecificas.length;
    const promedioCompletado = alumnosFiltrados.length > 0
      ? Math.round(alumnosFiltrados.reduce((sum, a) => sum + a.porcentajeCompletado, 0) / alumnosFiltrados.length)
      : 0;

    const alumnosConPendientes: AlumnoConTareasPendientes[] = alumnosFaltantes
      .filter(a => a.tareasFaltantes > 0)
      .map(a => ({
        id: a.id,
        nombres: a.nombres,
        apellidos: a.apellidos,
        tareasFaltantes: a.tareasFaltantesDetalle
      }));

    return {
      alumnosFiltrados: alumnosFiltrados.sort((a, b) => a.tareasFaltantes - b.tareasFaltantes),
      totalTareas,
      promedioCompletado,
      alumnosCompletos: alumnosFiltrados.filter(a => a.tareasFaltantes === 0).length,
      alumnosIncompletos: alumnosFiltrados.filter(a => a.tareasFaltantes > 0).length,
      alumnosConPendientes
    };
  }, [alumnos, evaluaciones, notas, competencias, filtroCompetencia, filtroEvaluacion, busquedaAlumno]);

  // Filtrar y paginar alumnos con pendientes
  const alumnosPendientesFiltrados = useMemo(() => {
    const filtrados = estadisticas.alumnosConPendientes.filter(alumno =>
      `${alumno.nombres} ${alumno.apellidos}`.toLowerCase().includes(busquedaPendientes.toLowerCase())
    );

    const totalPaginas = Math.ceil(filtrados.length / ITEMS_POR_PAGINA);
    const inicio = (paginaPendientes - 1) * ITEMS_POR_PAGINA;
    const fin = inicio + ITEMS_POR_PAGINA;
    const paginados = filtrados.slice(inicio, fin);

    return {
      alumnos: paginados,
      total: filtrados.length,
      totalPaginas
    };
  }, [estadisticas.alumnosConPendientes, busquedaPendientes, paginaPendientes]);

  // Reset página cuando cambia búsqueda
  const handleBusquedaPendientes = (valor: string) => {
    setBusquedaPendientes(valor);
    setPaginaPendientes(1);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Principal */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpenIcon className="h-6 w-6" />
                  Información de Tareas - {cursoNombre}
                </h2>
                <p className="text-white/90 text-sm">{salonNombre}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Estadísticas Generales */}
          <div className="p-6 bg-gradient-to-br from-[#FCE0C1] to-[#E9E1C9] border-b-2 border-[#8D2C1D]/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm text-center border-2 border-[#E9E1C9]">
                <div className="text-2xl font-bold text-[#8D2C1D]">{estadisticas.totalTareas}</div>
                <div className="text-sm text-gray-600">Total Tareas</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center border-2 border-[#E9E1C9]">
                <div className="text-2xl font-bold text-[#D96924]">{estadisticas.promedioCompletado}%</div>
                <div className="text-sm text-gray-600">Promedio Completado</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center border-2 border-[#E9E1C9]">
                <div className="text-2xl font-bold text-green-600">{estadisticas.alumnosCompletos}</div>
                <div className="text-sm text-gray-600">Alumnos al Día</div>
              </div>
              <button
                onClick={() => {
                  setMostrarModalPendientes(true);
                  setBusquedaPendientes('');
                  setPaginaPendientes(1);
                }}
                className="bg-white p-4 rounded-lg shadow-sm text-center border-2 border-[#8D2C1D]/20 hover:border-[#8D2C1D] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="text-2xl font-bold text-red-600">{estadisticas.alumnosIncompletos}</div>
                <div className="text-sm text-gray-600">Con Tareas Pendientes</div>
                <div className="text-xs text-[#8D2C1D] mt-1">Click para ver detalle</div>
              </button>
            </div>
          </div>

          {/* Filtros en una sola fila */}
          <div className="p-4 md:p-6 border-b bg-white">
            <div className="flex flex-col gap-3">
              {/* Búsqueda por alumno */}
              <div className="relative md:hidden">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar alumno..."
                  value={busquedaAlumno}
                  onChange={(e) => setBusquedaAlumno(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] text-sm"
                />
              </div>

              {/* Filtros de competencia y evaluación en una fila en móvil, todo en una fila en desktop */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Búsqueda en desktop */}
                <div className="relative hidden md:block">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar alumno..."
                    value={busquedaAlumno}
                    onChange={(e) => setBusquedaAlumno(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] text-sm"
                  />
                </div>

                {/* Filtro por competencia */}
                <select
                  value={filtroCompetencia || ''}
                  onChange={(e) => {
                    setFiltroCompetencia(e.target.value ? Number(e.target.value) : null);
                    setFiltroEvaluacion(null);
                  }}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] text-sm"
                >
                  <option value="">Todas competencias</option>
                  {competencias.map(comp => (
                    <option key={comp.id} value={comp.id}>{comp.nombre}</option>
                  ))}
                </select>

                {/* Filtro por evaluación */}
                <select
                  value={filtroEvaluacion || ''}
                  onChange={(e) => setFiltroEvaluacion(e.target.value ? Number(e.target.value) : null)}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] text-sm"
                  disabled={!filtroCompetencia}
                >
                  <option value="">Todas evaluaciones</option>
                  {evaluaciones
                    .filter(evaluacion => !filtroCompetencia || evaluacion.competenciaId === filtroCompetencia)
                    .map(evaluacion => (
                      <option key={evaluacion.id} value={evaluacion.id}>{evaluacion.nombre}</option>
                    ))
                  }
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Alumnos en Grid: 2 columnas en móvil, 3 en desktop */}
          <div className="flex-1 overflow-y-auto max-h-96">
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {estadisticas.alumnosFiltrados.map(alumno => (
                  <div
                    key={alumno.id}
                    className={`p-4 rounded-lg border-2 transition-all ${alumno.tareasFaltantes === 0
                      ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
                      : 'bg-gradient-to-br from-[#FCE0C1] to-[#E9E1C9] border-[#8D2C1D]/30'
                      }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {alumno.tareasFaltantes === 0 ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <ExclamationTriangleIcon className="h-6 w-6 text-[#D96924] flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {alumno.apellidos}, {alumno.nombres}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">{alumno.tareasRealizadas}</span> de <span className="font-medium">{alumno.totalTareas}</span> tareas
                      </p>

                      {alumno.tareasFaltantes > 0 && (
                        <p className="text-sm font-medium text-red-600">
                          Faltan: {alumno.tareasFaltantes}
                        </p>
                      )}

                      {alumno.tareasFaltantes === 0 && (
                        <p className="text-sm font-medium text-green-600 flex items-center gap-1">
                          <CheckCircleIcon className="h-4 w-4" />
                          Completo
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {estadisticas.alumnosFiltrados.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <UserGroupIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p>No se encontraron alumnos con los filtros aplicados</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gradient-to-br from-[#FCE0C1] to-[#E9E1C9] border-t-2 border-[#8D2C1D]/20 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white rounded-lg hover:shadow-lg transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Tareas Pendientes (se superpone) */}
      {mostrarModalPendientes && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ClipboardDocumentCheckIcon className="h-6 w-6" />
                    Detalle de Tareas Pendientes
                  </h2>
                  <p className="text-white/90 text-sm">{estadisticas.alumnosConPendientes.length} alumno(s) con tareas pendientes</p>
                </div>
                <button
                  onClick={() => setMostrarModalPendientes(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Filtro de búsqueda */}
            <div className="p-4 border-b bg-gray-50 flex-shrink-0">
              <div className="relative max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar alumno..."
                  value={busquedaPendientes}
                  onChange={(e) => handleBusquedaPendientes(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Lista de alumnos con sus tareas en grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {alumnosPendientesFiltrados.alumnos.map(alumno => (
                  <div
                    key={alumno.id}
                    className="bg-gradient-to-br from-[#FCE0C1] to-[#E9E1C9] border-2 border-[#8D2C1D]/30 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <ExclamationTriangleIcon className="h-5 w-5 text-[#D96924] flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-bold text-[#8D2C1D] text-base">
                          {alumno.apellidos}, {alumno.nombres}
                        </h3>
                      </div>
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium flex-shrink-0">
                        {alumno.tareasFaltantes.length} pendiente(s)
                      </span>
                    </div>

                    {/* Grid de tareas: 3 columnas en desktop, 2 en móvil */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                      {alumno.tareasFaltantes.map((tarea, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded-lg border border-[#8D2C1D]/20"
                        >
                          <p className="font-medium text-gray-900 text-sm mb-1">{tarea.evaluacionNombre}</p>
                          <p className="text-xs text-gray-600">Comp: {tarea.competenciaNombre}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {alumnosPendientesFiltrados.alumnos.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    {busquedaPendientes ? (
                      <>
                        <MagnifyingGlassIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium text-gray-700">No se encontraron alumnos</p>
                        <p className="text-sm">Intenta con otro término de búsqueda</p>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-16 w-16 mx-auto mb-4 text-green-500" />
                        <p className="text-lg font-medium text-gray-700">¡Todos los alumnos están al día!</p>
                        <p className="text-sm">No hay tareas pendientes</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Paginación */}
            {alumnosPendientesFiltrados.totalPaginas > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between flex-shrink-0">
                <div className="text-sm text-gray-600">
                  Mostrando {((paginaPendientes - 1) * ITEMS_POR_PAGINA) + 1} - {Math.min(paginaPendientes * ITEMS_POR_PAGINA, alumnosPendientesFiltrados.total)} de {alumnosPendientesFiltrados.total}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPaginaPendientes(p => Math.max(1, p - 1))}
                    disabled={paginaPendientes === 1}
                    className="px-3 py-1 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Anterior
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {paginaPendientes} / {alumnosPendientesFiltrados.totalPaginas}
                  </span>
                  <button
                    onClick={() => setPaginaPendientes(p => Math.min(alumnosPendientesFiltrados.totalPaginas, p + 1))}
                    disabled={paginaPendientes === alumnosPendientesFiltrados.totalPaginas}
                    className="px-3 py-1 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                  >
                    Siguiente
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end flex-shrink-0">
              <button
                onClick={() => setMostrarModalPendientes(false)}
                className="px-6 py-2 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white rounded-lg hover:shadow-lg transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
