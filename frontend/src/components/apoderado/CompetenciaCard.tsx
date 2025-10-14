"use client";

import { CompetenciaDetalle } from '@/types/apoderado';

interface CompetenciaCardProps {
  competencia: CompetenciaDetalle;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function CompetenciaCard({ competencia, index, isExpanded, onToggle }: CompetenciaCardProps) {
  const getNotaColor = (nota?: string | null) => {
    if (!nota) return 'bg-gray-100 text-gray-600 border-gray-300';
    
    switch (nota.toUpperCase()) {
      case 'AD':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'A':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'B':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'C':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getNotaTexto = (nota?: string | null) => {
    if (!nota) return 'Sin calificar';
    
    switch (nota.toUpperCase()) {
      case 'AD':
        return 'Logro Destacado';
      case 'A':
        return 'Logro Esperado';
      case 'B':
        return 'En Proceso';
      case 'C':
        return 'En Inicio';
      default:
        return nota;
    }
  };

  const formatFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const evaluacionesConNota = competencia.evaluaciones.filter(evaluacion => evaluacion.nota).length;
  const totalEvaluaciones = competencia.evaluaciones.length;
  const progreso = totalEvaluaciones > 0 ? (evaluacionesConNota / totalEvaluaciones) * 100 : 0;

  // Calcular promedio de la competencia
  const calcularPromedio = () => {
    const notasValidas = competencia.evaluaciones
      .map(evaluacion => evaluacion.nota)
      .filter(nota => nota !== null && nota !== undefined);

    if (notasValidas.length === 0) return null;

    const valores = notasValidas.map(nota => {
      switch (nota) {
        case 'AD': return 4;
        case 'A': return 3;
        case 'B': return 2;
        case 'C': return 1;
        default: return 0;
      }
    });

    const promedio = valores.reduce((sum: number, val: number) => sum + val, 0) / valores.length;
    
    if (promedio >= 3.5) return 'AD';
    if (promedio >= 2.5) return 'A';
    if (promedio >= 1.5) return 'B';
    return 'C';
  };

  const promedioCompetencia = calcularPromedio();

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9] overflow-hidden">
      {/* Header de la competencia */}
      <div 
        className="p-6 cursor-pointer hover:bg-[#F7F3E9] transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#8D2C1D] to-[#6D1F14] rounded-full flex items-center justify-center text-white font-bold text-lg">
              {index}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#8D2C1D] mb-1">
                {competencia.nombre}
              </h3>
              <div className="flex items-center gap-4 text-sm text-[#666666]">
                <span>
                  {evaluacionesConNota} de {totalEvaluaciones} evaluaciones
                </span>
                {promedioCompetencia && (
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold border ${getNotaColor(promedioCompetencia)}`}>
                    Promedio: {promedioCompetencia}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Progreso circular */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#8D2C1D]"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={`${progreso}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-[#8D2C1D]">
                  {Math.round(progreso)}%
                </span>
              </div>
            </div>

            {/* Flecha de expansión */}
            <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <svg className="w-6 h-6 text-[#8D2C1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido expandible - Evaluaciones */}
      {isExpanded && (
        <div className="border-t border-[#E9E1C9] bg-[#FAFAFA]">
          <div className="p-6">
            <h4 className="text-lg font-semibold text-[#8D2C1D] mb-4 flex items-center gap-2">
              <span>📝</span>
              Evaluaciones ({competencia.evaluaciones.length})
            </h4>

            {competencia.evaluaciones.length === 0 ? (
              <div className="text-center py-8 text-[#666666]">
                <div className="text-3xl mb-2">📋</div>
                <p>No hay evaluaciones registradas para esta competencia</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {competencia.evaluaciones.map((evaluacion) => (
                  <div
                    key={evaluacion.id}
                    className="bg-white rounded-lg border-2 border-[#E9E1C9] p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="font-semibold text-[#333333] text-sm line-clamp-2">
                        {evaluacion.nombre}
                      </h5>
                      <div className={`px-2 py-1 rounded-full text-xs font-bold border-2 ${getNotaColor(evaluacion.nota)}`}>
                        {evaluacion.nota || 'S/N'}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-[#666666]">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{formatFecha(evaluacion.fechaEvaluacion)}</span>
                      </div>
                      
                      {evaluacion.nota && (
                        <div className="flex items-center gap-2">
                          <span>🎯</span>
                          <span className="font-medium">
                            {getNotaTexto(evaluacion.nota)}
                          </span>
                        </div>
                      )}
                    </div>

                    {!evaluacion.nota && (
                      <div className="mt-3 text-center">
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                          <span>⏳</span>
                          Pendiente de calificar
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Resumen de la competencia */}
            {competencia.evaluaciones.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-blue-800 mb-1">Resumen de la Competencia</h5>
                    <p className="text-sm text-blue-600">
                      {evaluacionesConNota} evaluaciones calificadas de {totalEvaluaciones} total
                    </p>
                  </div>
                  {promedioCompetencia && (
                    <div className={`px-4 py-2 rounded-lg font-bold text-lg border-2 ${getNotaColor(promedioCompetencia)}`}>
                      {promedioCompetencia}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
