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
    const iconClass = "w-12 h-12";

    if (nombreLower.includes('matemática') || nombreLower.includes('matematica')) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }

    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    );
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
      {/* Franja de color del curso */}
      <div
        className="h-3 w-full"
        style={{
          backgroundColor: curso.color || '#8D2C1D',
          background: curso.color
            ? `linear-gradient(90deg, ${curso.color}, ${curso.color}dd)`
            : 'linear-gradient(90deg, #8D2C1D, #6D1F14)'
        }}
      ></div>

      <div className="p-6">
        {/* Grid principal: Izquierda (Icono+Nombre+Profesor+Promedio) | Derecha (Estadísticas+Consejos) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna Izquierda */}
          <div className="space-y-6">
            {/* Header: Icono + Nombre del Curso */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[#8D2C1D] to-[#6D1F14] rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
                {getCursoIcon(curso.nombre)}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-[#8D2C1D] mb-1">
                  {curso.nombre}
                </h1>
                {curso.descripcion && (
                  <p className="text-sm text-[#666666] line-clamp-2">
                    {curso.descripcion}
                  </p>
                )}
              </div>
            </div>

            {/* Profesor */}
            <div>
              <h3 className="text-sm font-bold text-[#666666] uppercase tracking-wide mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profesor
              </h3>
              {curso.profesor ? (
                <div className="flex items-center gap-3 p-3 bg-[#F7F3E9] rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8D2C1D] to-[#6D1F14] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {getInitials(curso.profesor.nombres, curso.profesor.apellidos)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#333333] truncate">
                      {curso.profesor.nombres} {curso.profesor.apellidos}
                    </p>
                    <p className="text-xs text-[#666666]">Profesor del curso</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#666666] italic">Sin profesor asignado</p>
              )}
            </div>

            {/* Promedio General - MÁS GRANDE */}
            <div>
              <h3 className="text-sm font-bold text-[#666666] uppercase tracking-wide mb-2">Promedio General</h3>
              <div className={`inline-flex flex-col items-center px-6 py-4 rounded-xl border-2 font-bold ${getPromedioColor(promedioGeneral)}`}>
                {promedioGeneral ? (
                  <>
                    <span className="text-5xl font-bold mb-1">{promedioGeneral}</span>
                    <span className="text-sm">{getPromedioTexto(promedioGeneral)}</span>
                  </>
                ) : (
                  <span className="text-lg">Sin calificar</span>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Estadísticas + Consejos */}
          <div className="space-y-6">
            {/* Estadísticas - TEXTO GRANDE SIN CÁPSULAS */}
            <div>
              <h3 className="text-sm font-bold text-[#666666] uppercase tracking-wide mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Estadísticas
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-blue-800">Competencias:</span>
                  <span className="text-xl font-bold text-blue-900">{curso.competencias.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-purple-800">Total Evaluaciones:</span>
                  <span className="text-xl font-bold text-purple-900">{totalEvaluaciones}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-green-800">Con Nota:</span>
                  <span className="text-xl font-bold text-green-900">{evaluacionesConNota}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-yellow-800">Pendientes:</span>
                  <span className="text-xl font-bold text-yellow-900">{totalEvaluaciones - evaluacionesConNota}</span>
                </div>
              </div>

              {/* Progreso */}
              <div className="mt-4">
                <div className="flex justify-between text-sm font-medium text-[#666666] mb-2">
                  <span>Progreso de Evaluaciones</span>
                  <span className="font-bold">{totalEvaluaciones > 0 ? Math.round((evaluacionesConNota / totalEvaluaciones) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${totalEvaluaciones > 0 ? (evaluacionesConNota / totalEvaluaciones) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Consejos */}
            <div className="bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9] rounded-lg p-4 border border-[#E9E1C9]">
              <h3 className="font-bold text-[#8D2C1D] mb-3 text-base flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Consejos para apoyar el aprendizaje
              </h3>
              <ul className="text-[#666666] text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#8D2C1D] font-bold">•</span>
                  <span>Revisa regularmente las evaluaciones</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8D2C1D] font-bold">•</span>
                  <span>Mantén comunicación con el profesor</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8D2C1D] font-bold">•</span>
                  <span>Apoya en áreas de refuerzo</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
