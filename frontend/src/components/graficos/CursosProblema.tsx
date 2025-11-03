'use client';

import { CursoProblema } from '@/types/estadisticas';

interface CursosProblemaProps {
  cursos: CursoProblema[];
  isLoading?: boolean;
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

export default function CursosProblema({ cursos, isLoading = false }: CursosProblemaProps) {
  if (isLoading) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#E9E1C9]">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D]"></div>
        </div>
      </div>
    );
  }

  if (!cursos || cursos.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#E9E1C9]">
        <h3 className="text-lg font-semibold text-[#8D2C1D] mb-4">
          Top Cursos Problema
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <p className="text-lg mb-2">📈</p>
            <p>No hay datos de cursos disponibles</p>
            <p className="text-sm">Registra evaluaciones para ver estadísticas</p>
          </div>
        </div>
      </div>
    );
  }

  // Preparar datos para la tabla
  const datosTabla = cursos.map(curso => ({
    ...curso,
    porcentaje: Number(curso.porcentajeProblema) || 0,
    estado: obtenerEstadoRiesgo(Number(curso.porcentajeProblema) || 0)
  }));

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#E9E1C9] w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#8D2C1D] mb-2">
          Top Cursos Problema
        </h3>
        <p className="text-sm text-gray-600">
          Cursos con mayor porcentaje de alumnos con notas B y C
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

      {/* Estadísticas resumidas */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gradient-to-r from-[#8D2C1D]/10 to-[#D96924]/10 rounded-lg">
          <div className="text-2xl font-bold text-[#8D2C1D]">
            {cursos.length}
          </div>
          <div className="text-sm text-gray-700">Cursos Analizados</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-r from-[#8D2C1D]/10 to-[#D96924]/10 rounded-lg">
          <div className="text-2xl font-bold text-[#8D2C1D]">
            {cursos.length > 0 ? Math.round(cursos.reduce((sum, c) => sum + Number(c.porcentajeProblema), 0) / cursos.length) : 0}%
          </div>
          <div className="text-sm text-gray-700">Promedio Problemas</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-r from-[#8D2C1D]/10 to-[#D96924]/10 rounded-lg">
          <div className="text-2xl font-bold text-[#8D2C1D]">
            {cursos.reduce((sum, c) => sum + c.totalAlumnos, 0)}
          </div>
          <div className="text-sm text-gray-700">Total Alumnos</div>
        </div>
      </div>

      {/* Lista de cursos más problemáticos */}
      {cursos.length > 0 && (
        <div className="mt-6">
          <h4 className="text-base font-semibold text-[#8D2C1D] mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Cursos que requieren atención inmediata:
          </h4>
          <div className="space-y-2">
            {cursos.slice(0, 3).map((curso, index) => {
              const porcentaje = Number(curso.porcentajeProblema);
              const bgColor = porcentaje >= 70 ? 'bg-red-50' : 
                            porcentaje >= 50 ? 'bg-yellow-50' : 
                            porcentaje >= 30 ? 'bg-blue-50' : 'bg-green-50';
              
              const textColor = porcentaje >= 70 ? 'text-red-800' : 
                              porcentaje >= 50 ? 'text-yellow-800' : 
                              porcentaje >= 30 ? 'text-blue-800' : 'text-green-800';

              return (
                <div key={index} className={`flex items-center justify-between p-3 ${bgColor} rounded-lg border border-gray-200`}>
                  <div>
                    <span className={`font-semibold text-sm ${textColor}`}>{curso.nombre}</span>
                    <span className="text-xs text-gray-600 ml-2">({curso.nivel})</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${textColor}`}>
                      {curso.porcentajeProblema}%
                    </div>
                    <div className="text-xs text-gray-600">
                      {curso.alumnosProblema}/{curso.totalAlumnos} alumnos
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
