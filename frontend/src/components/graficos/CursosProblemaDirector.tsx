'use client';

import React from 'react';
import { CursosProblemaColegioResponse } from '@/lib/api/estadisticas-director';

interface CursosProblemaDirectorProps {
  data: CursosProblemaColegioResponse | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

// Función para obtener el color y estado según el porcentaje de problemas
const obtenerEstadoRiesgo = (porcentaje: number) => {
  if (porcentaje >= 70) return { 
    color: 'bg-red-100 border-red-300 text-red-800', 
    badge: 'bg-red-500 text-white', 
    nivel: 'Crítico',
    icon: '🚨'
  };
  if (porcentaje >= 50) return { 
    color: 'bg-orange-100 border-orange-300 text-orange-800', 
    badge: 'bg-orange-500 text-white', 
    nivel: 'Alto',
    icon: '⚠️'
  };
  if (porcentaje >= 30) return { 
    color: 'bg-yellow-100 border-yellow-300 text-yellow-800', 
    badge: 'bg-yellow-500 text-white', 
    nivel: 'Moderado',
    icon: '⚡'
  };
  return { 
    color: 'bg-green-100 border-green-300 text-green-800', 
    badge: 'bg-green-500 text-white', 
    nivel: 'Bajo',
    icon: '✅'
  };
};

const CursosProblemaDirector: React.FC<CursosProblemaDirectorProps> = ({
  data,
  loading,
  error,
  onRetry
}) => {
  // Estado de loading
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Top Cursos Problema - Mi Colegio
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando cursos problema...</span>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Top Cursos Problema - Mi Colegio
        </h3>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Estado sin datos
  if (!data || data.cursosProblema.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Top Cursos Problema - Mi Colegio
        </h3>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">No hay cursos con problemas identificados</p>
          <p className="text-sm text-gray-500">¡Excelente! Todos los cursos tienen buen rendimiento</p>
        </div>
      </div>
    );
  }

  // Preparar datos para la tabla
  const datosTabla = data.cursosProblema.map(curso => ({
    ...curso,
    porcentaje: Number(curso.porcentajeProblema) || 0,
    estado: obtenerEstadoRiesgo(Number(curso.porcentajeProblema) || 0)
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Top Cursos Problema - Mi Colegio
        </h3>
        <p className="text-sm text-gray-600">
          Cursos con mayor porcentaje de alumnos en riesgo académico (promedio final B o C)
        </p>
      </div>

      {/* Tabla de Cursos Problema */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Curso</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Nivel Riesgo</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">% Problema</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Alumnos</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">En Riesgo</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Detalle B/C</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {datosTabla.map((curso, index) => (
              <tr key={index} className={`hover:bg-gray-50 transition-colors ${curso.estado.color}`}>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">{curso.nombre}</div>
                    <div className="text-sm text-gray-500">({curso.nivel})</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg">{curso.estado.icon}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${curso.estado.badge}`}>
                      {curso.estado.nivel}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="text-lg font-bold text-red-600">{curso.porcentaje}%</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="text-sm font-medium text-gray-900">{curso.totalAlumnos}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="text-sm font-bold text-red-600">{curso.alumnosProblema}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2 text-xs">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      B: {curso.detalleProblemas.B}
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                      C: {curso.detalleProblemas.C}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumen estadístico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{data.cursosAnalizados}</div>
          <div className="text-sm text-gray-600">Cursos Analizados</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{data.promedioProblemasLocal}%</div>
          <div className="text-sm text-gray-600">Promedio Problemas</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{data.totalCursos}</div>
          <div className="text-sm text-gray-600">Total Cursos</div>
        </div>
      </div>

      {/* Lista detallada de cursos problema */}
      {data.cursosProblema.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 text-sm">
            Cursos que requieren atención inmediata:
          </h4>
          {data.cursosProblema.slice(0, 3).map((curso, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{curso.nombre}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">({curso.nivel})</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Alumnos con promedio final: 
                  <span className="ml-1 text-yellow-600">B: {curso.detalleProblemas.B}</span>
                  <span className="ml-2 text-red-600">C: {curso.detalleProblemas.C}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-red-600">{curso.porcentajeProblema}%</div>
                <div className="text-xs text-gray-500">{curso.alumnosProblema}/{curso.totalAlumnos}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensaje de acción */}
      {data.cursosProblema.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <div className="text-blue-500 mr-2 mt-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Recomendaciones:</p>
              <p className="text-sm text-blue-700 mt-1">
                Considera implementar programas de refuerzo académico para estos cursos, 
                revisar metodologías de enseñanza y brindar apoyo adicional a los estudiantes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CursosProblemaDirector;
