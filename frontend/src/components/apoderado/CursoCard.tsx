"use client";

import { useRouter } from 'next/navigation';
import { CursoAlumno } from '@/types/apoderado';

interface CursoCardProps {
  curso: CursoAlumno;
  alumnoId: number;
}

export default function CursoCard({ curso, alumnoId }: CursoCardProps) {
  const router = useRouter();

  const handleVerDetalle = () => {
    router.push(`/apoderado/alumno/${alumnoId}/curso/${curso.id}`);
  };

  const getPromedioColor = (promedio?: string) => {
    if (!promedio) return 'text-gray-500';
    
    switch (promedio.toUpperCase()) {
      case 'AD':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'A':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'B':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'C':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getPromedioTexto = (promedio?: string) => {
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

  const getInitials = (nombres: string, apellidos: string) => {
    return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9] overflow-hidden group hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
      {/* Header del curso con color */}
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
        {/* Título del curso */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {getCursoIcon(curso.nombre)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#8D2C1D] group-hover:text-[#6D1F14] transition-colors line-clamp-2">
                {curso.nombre}
              </h3>
              {curso.descripcion && (
                <p className="text-sm text-[#666666] line-clamp-2 mt-1">
                  {curso.descripcion}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Información del profesor */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-[#F7F3E9] rounded-lg">
          <div className="w-10 h-10 bg-gradient-to-br from-[#8D2C1D] to-[#6D1F14] rounded-full flex items-center justify-center text-white text-sm font-bold">
            {getInitials(curso.profesor.nombres, curso.profesor.apellidos)}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#8D2C1D]">Profesor</p>
            <p className="text-sm text-[#333333] font-medium">
              {curso.profesor.nombres} {curso.profesor.apellidos}
            </p>
          </div>
        </div>

        {/* Promedio del curso */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-[#666666] mb-2">Promedio del Período</p>
          <div className={`inline-flex items-center px-3 py-2 rounded-lg border font-semibold text-sm ${getPromedioColor(curso.promedioFinal)}`}>
            {curso.promedioFinal ? (
              <>
                <span className="text-lg font-bold mr-2">{curso.promedioFinal}</span>
                <span>{getPromedioTexto(curso.promedioFinal)}</span>
              </>
            ) : (
              <span>Sin calificar</span>
            )}
          </div>
        </div>

        {/* Competencias */}
        {curso.competencias && curso.competencias.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-[#666666] mb-2">
              Competencias ({curso.competencias.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {curso.competencias.slice(0, 3).map((competencia, index) => (
                <div
                  key={competencia.id}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                >
                  {competencia.nombre.length > 15 
                    ? `${competencia.nombre.substring(0, 15)}...` 
                    : competencia.nombre
                  }
                </div>
              ))}
              {curso.competencias.length > 3 && (
                <div className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                  +{curso.competencias.length - 3} más
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botón Ver Detalle */}
        <button
          onClick={handleVerDetalle}
          className="w-full bg-[#8D2C1D] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#6D1F14] transition-colors group-hover:shadow-lg flex items-center justify-center gap-2"
        >
          <span>👁️</span>
          Ver Detalle del Curso
        </button>
      </div>
    </div>
  );
}
