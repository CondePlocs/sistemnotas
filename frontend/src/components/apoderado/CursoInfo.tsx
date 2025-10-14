"use client";

import { CursoDetalle } from '@/types/apoderado';

interface CursoInfoProps {
  curso: CursoDetalle;
  promedioGeneral?: string | null;
}

export default function CursoInfo({ curso, promedioGeneral }: CursoInfoProps) {
  const getInitials = (nombres: string, apellidos: string) => {
    return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
  };

  const getCursoIcon = (nombre: string) => {
    const nombreLower = nombre.toLowerCase();
    
    if (nombreLower.includes('matemática') || nombreLower.includes('matematica')) return '🔢';
    if (nombreLower.includes('comunicación') || nombreLower.includes('comunicacion') || nombreLower.includes('lenguaje')) return '📝';
    if (nombreLower.includes('ciencia') || nombreLower.includes('biología') || nombreLower.includes('biologia')) return '🔬';
    if (nombreLower.includes('historia') || nombreLower.includes('social')) return '📚';
    if (nombreLower.includes('educación física') || nombreLower.includes('educacion fisica') || nombreLower.includes('deporte')) return '⚽';
    if (nombreLower.includes('arte') || nombreLower.includes('música') || nombreLower.includes('musica')) return '🎨';
    if (nombreLower.includes('inglés') || nombreLower.includes('ingles') || nombreLower.includes('idioma')) return '🌍';
    if (nombreLower.includes('religión') || nombreLower.includes('religion')) return '✝️';
    if (nombreLower.includes('tecnología') || nombreLower.includes('tecnologia') || nombreLower.includes('computación')) return '💻';
    
    return '📖';
  };

  const getPromedioColor = (promedio?: string | null) => {
    if (!promedio) return 'text-gray-500 bg-gray-50 border-gray-200';
    
    switch (promedio.toUpperCase()) {
      case 'AD':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'A':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'B':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'C':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getPromedioTexto = (promedio?: string | null) => {
    if (!promedio) return 'Sin calificar';
    
    switch (promedio.toUpperCase()) {
      case 'AD':
        return 'Logro Destacado';
      case 'A':
        return 'Logro Esperado';
      case 'B':
        return 'En Proceso';
      case 'C':
        return 'En Inicio';
      default:
        return promedio;
    }
  };

  const totalEvaluaciones = curso.competencias.reduce((total, comp) => total + comp.evaluaciones.length, 0);
  const evaluacionesConNota = curso.competencias.reduce((total, comp) => 
    total + comp.evaluaciones.filter(evaluacion => evaluacion.nota).length, 0
  );

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9] overflow-hidden mb-8">
      {/* Header con color del curso */}
      <div 
        className="h-4 w-full"
        style={{ 
          backgroundColor: curso.color || '#8D2C1D',
          background: curso.color 
            ? `linear-gradient(90deg, ${curso.color}, ${curso.color}dd)` 
            : 'linear-gradient(90deg, #8D2C1D, #6D1F14)'
        }}
      ></div>
      
      <div className="p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Información principal del curso */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="w-24 h-24 bg-gradient-to-br from-[#8D2C1D] to-[#6D1F14] rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg">
              {getCursoIcon(curso.nombre)}
            </div>
            
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold text-[#8D2C1D] mb-2">
                {curso.nombre}
              </h1>
              
              {curso.descripcion && (
                <p className="text-lg text-[#666666] mb-4 max-w-md">
                  {curso.descripcion}
                </p>
              )}

              {/* Promedio general */}
              <div className="mb-4">
                <label className="text-sm font-semibold text-[#666666] uppercase tracking-wide block mb-2">
                  Promedio General
                </label>
                <div className={`inline-flex items-center px-4 py-3 rounded-lg border-2 font-bold text-lg ${getPromedioColor(promedioGeneral)}`}>
                  {promedioGeneral ? (
                    <>
                      <span className="text-2xl font-bold mr-3">{promedioGeneral}</span>
                      <span>{getPromedioTexto(promedioGeneral)}</span>
                    </>
                  ) : (
                    <span>Sin calificar</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Información detallada */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información del Profesor */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#8D2C1D] border-b-2 border-[#E9E1C9] pb-2">
                👨‍🏫 Profesor
              </h3>
              
              {curso.profesor ? (
                <div className="flex items-center gap-4 p-4 bg-[#F7F3E9] rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#8D2C1D] to-[#6D1F14] rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {getInitials(curso.profesor.nombres, curso.profesor.apellidos)}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#333333]">
                      {curso.profesor.nombres} {curso.profesor.apellidos}
                    </p>
                    <p className="text-sm text-[#666666]">
                      Profesor del curso
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-[#666666]">
                  <div className="text-3xl mb-2">👤</div>
                  <p>Sin profesor asignado</p>
                </div>
              )}
            </div>

            {/* Estadísticas del curso */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#8D2C1D] border-b-2 border-[#E9E1C9] pb-2">
                📊 Estadísticas
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-800">Competencias:</span>
                  <span className="font-bold text-blue-900">{curso.competencias.length}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium text-purple-800">Total Evaluaciones:</span>
                  <span className="font-bold text-purple-900">{totalEvaluaciones}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">Evaluaciones con Nota:</span>
                  <span className="font-bold text-green-900">{evaluacionesConNota}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium text-yellow-800">Pendientes:</span>
                  <span className="font-bold text-yellow-900">{totalEvaluaciones - evaluacionesConNota}</span>
                </div>

                {/* Progreso */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm font-medium text-[#666666] mb-1">
                    <span>Progreso de Evaluaciones</span>
                    <span>{totalEvaluaciones > 0 ? Math.round((evaluacionesConNota / totalEvaluaciones) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${totalEvaluaciones > 0 ? (evaluacionesConNota / totalEvaluaciones) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
