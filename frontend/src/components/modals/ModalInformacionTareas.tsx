import React, { useState, useMemo } from 'react';

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

      return {
        ...alumno,
        tareasRealizadas,
        tareasFaltantes,
        porcentajeCompletado,
        totalTareas: evaluacionesEspecificas.length
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

    return {
      alumnosFiltrados: alumnosFiltrados.sort((a, b) => a.tareasFaltantes - b.tareasFaltantes),
      totalTareas,
      promedioCompletado,
      alumnosCompletos: alumnosFiltrados.filter(a => a.tareasFaltantes === 0).length,
      alumnosIncompletos: alumnosFiltrados.filter(a => a.tareasFaltantes > 0).length
    };
  }, [alumnos, evaluaciones, notas, filtroCompetencia, filtroEvaluacion, busquedaAlumno]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                📚
                Información de Tareas - {cursoNombre}
              </h2>
              <p className="text-blue-100 text-sm">{salonNombre}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Estadísticas Generales */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-2xl font-bold text-blue-600">{estadisticas.totalTareas}</div>
              <div className="text-sm text-gray-600">Total Tareas</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-2xl font-bold text-green-600">{estadisticas.promedioCompletado}%</div>
              <div className="text-sm text-gray-600">Promedio Completado</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-2xl font-bold text-emerald-600">{estadisticas.alumnosCompletos}</div>
              <div className="text-sm text-gray-600">Alumnos al Día</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-2xl font-bold text-red-600">{estadisticas.alumnosIncompletos}</div>
              <div className="text-sm text-gray-600">Con Tareas Pendientes</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda por alumno */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Buscar alumno..."
                value={busquedaAlumno}
                onChange={(e) => setBusquedaAlumno(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por competencia */}
            <div>
              <select
                value={filtroCompetencia || ''}
                onChange={(e) => {
                  setFiltroCompetencia(e.target.value ? Number(e.target.value) : null);
                  setFiltroEvaluacion(null); // Reset evaluación cuando cambia competencia
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las competencias</option>
                {competencias.map(comp => (
                  <option key={comp.id} value={comp.id}>{comp.nombre}</option>
                ))}
              </select>
            </div>

            {/* Filtro por evaluación */}
            <div>
              <select
                value={filtroEvaluacion || ''}
                onChange={(e) => setFiltroEvaluacion(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!filtroCompetencia}
              >
                <option value="">Todas las evaluaciones</option>
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

        {/* Lista de Alumnos */}
        <div className="flex-1 overflow-y-auto max-h-96">
          <div className="p-6">
            <div className="space-y-3">
              {estadisticas.alumnosFiltrados.map(alumno => (
                <div
                  key={alumno.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    alumno.tareasFaltantes === 0
                      ? 'bg-green-50 border-green-200 hover:bg-green-100'
                      : alumno.tareasFaltantes <= 2
                      ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                      : 'bg-red-50 border-red-200 hover:bg-red-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {alumno.tareasFaltantes === 0 ? '✅' : '⚠️'}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {alumno.apellidos}, {alumno.nombres}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {alumno.tareasRealizadas} de {alumno.totalTareas} tareas completadas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        alumno.tareasFaltantes === 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {alumno.tareasFaltantes === 0 ? '✅' : alumno.tareasFaltantes}
                      </div>
                      <div className="text-sm text-gray-600">
                        {alumno.porcentajeCompletado}% completado
                      </div>
                    </div>
                  </div>
                  
                  {/* Barra de progreso */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          alumno.porcentajeCompletado === 100
                            ? 'bg-green-500'
                            : alumno.porcentajeCompletado >= 70
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${alumno.porcentajeCompletado}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              
              {estadisticas.alumnosFiltrados.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">👥</div>
                  <p>No se encontraron alumnos con los filtros aplicados</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
