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
    const iconClass = "w-6 h-6";

    // Matemática
    if (nombreLower.includes('matemática') || nombreLower.includes('matematica')) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }

    // Comunicación/Lenguaje
    if (nombreLower.includes('comunicación') || nombreLower.includes('comunicacion') || nombreLower.includes('lenguaje')) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    }

    // Ciencias/Biología
    if (nombreLower.includes('ciencia') || nombreLower.includes('biología') || nombreLower.includes('biologia')) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      );
    }

    // Historia/Social
    if (nombreLower.includes('historia') || nombreLower.includes('social')) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    }

    // Educación Física/Deporte
    if (nombreLower.includes('educación física') || nombreLower.includes('educacion fisica') || nombreLower.includes('deporte')) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }

    // Arte/Música
    if (nombreLower.includes('arte') || nombreLower.includes('música') || nombreLower.includes('musica')) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      );
    }

    // Inglés/Idioma
    if (nombreLower.includes('inglés') || nombreLower.includes('ingles') || nombreLower.includes('idioma')) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      );
    }

    // Religión
    if (nombreLower.includes('religión') || nombreLower.includes('religion')) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    }

    // Tecnología/Computación
    if (nombreLower.includes('tecnología') || nombreLower.includes('tecnologia') || nombreLower.includes('computación')) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    }

    // Default - Libro genérico
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    );
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
            <div className="text-[#8D2C1D]">
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
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Ver Detalle del Curso
        </button>
      </div>
    </div>
  );
}
