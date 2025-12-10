"use client";

import { AlumnoApoderado } from '@/types/apoderado';
import { useRouter } from 'next/navigation';

interface AlumnoCardProps {
  alumno: AlumnoApoderado;
}

export default function AlumnoCard({ alumno }: AlumnoCardProps) {
  const router = useRouter();

  const handleVerAlumno = () => {
    router.push(`/apoderado/alumno/${alumno.id}`);
  };

  const getInitials = (nombres: string, apellidos: string) => {
    return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
  };

  const getGenderIcon = (sexo?: string) => {
    if (sexo === 'masculino') {
      return '👦';
    } else if (sexo === 'femenino') {
      return '👧';
    }
    return '🧑';
  };

  const getNivelColor = (nivel?: string) => {
    switch (nivel?.toLowerCase()) {
      case 'inicial':
        return 'from-pink-400 to-pink-500';
      case 'primaria':
        return 'from-blue-400 to-blue-500';
      case 'secundaria':
        return 'from-green-400 to-green-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getParentescoIcon = (parentesco: string) => {
    switch (parentesco.toLowerCase()) {
      case 'padre':
        return '👨';
      case 'madre':
        return '👩';
      case 'tutor':
      case 'tutor legal':
        return '👤';
      case 'abuelo':
        return '👴';
      case 'abuela':
        return '👵';
      default:
        return '👥';
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9] overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
      {/* Línea superior con degradado de marca */}
      <div className="h-2 w-full bg-gradient-to-r from-[#8D2C1D] to-[#D96924]"></div>

      <div className="p-6">
        {/* Avatar y información básica */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-[#8D2C1D] to-[#D96924] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
              {getInitials(alumno.nombres, alumno.apellidos)}
            </div>
            <div className="absolute -bottom-1 -right-1 text-2xl">
              {getGenderIcon(alumno.sexo)}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[#333333] mb-1 group-hover:text-[#8D2C1D] transition-colors duration-300 truncate">
              {alumno.nombres} {alumno.apellidos}
            </h3>
            {alumno.dni && (
              <p className="text-sm text-[#666666] font-medium">
                🆔 DNI: {alumno.dni}
              </p>
            )}
          </div>
        </div>

        {/* Información académica */}
        <div className="space-y-3 mb-4">
          {alumno.salon && (
            <>
              <div className="flex items-center text-[#555555] group-hover:text-[#333333] transition-colors duration-300">
                <div className="w-5 h-5 mr-3 text-[#8D2C1D] group-hover:scale-110 transition-transform duration-300">
                  🏫
                </div>
                <span className="text-sm font-semibold">
                  {alumno.salon.grado}° {alumno.salon.seccion}
                </span>
              </div>

              <div className="flex items-center text-[#555555] group-hover:text-[#333333] transition-colors duration-300">
                <div className="w-5 h-5 mr-3 text-[#8D2C1D] group-hover:scale-110 transition-transform duration-300">
                  📚
                </div>
                <span className="text-sm font-medium">
                  {alumno.salon.colegioNivel?.nivel?.nombre || 'Sin nivel'}
                </span>
              </div>
            </>
          )}

          <div className="flex items-center text-[#555555] group-hover:text-[#333333] transition-colors duration-300">
            <div className="w-5 h-5 mr-3 text-[#8D2C1D] group-hover:scale-110 transition-transform duration-300">
              {getParentescoIcon(alumno.parentesco)}
            </div>
            <span className="text-sm font-medium capitalize">
              {alumno.parentesco}
              {alumno.esPrincipal && (
                <span className="ml-2 bg-[#8D2C1D] text-white text-xs px-2 py-1 rounded-full">
                  Principal
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Estado del alumno */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm group-hover:shadow-md transition-all duration-300 ${alumno.activo
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
            }`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${alumno.activo ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`}></span>
            {alumno.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Botón de acción */}
        <button
          onClick={handleVerAlumno}
          className="w-full bg-gradient-to-r from-[#8D2C1D] to-[#D96924] hover:from-[#7A2518] hover:to-[#C55A1F] text-white text-sm font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Ver Alumno
        </button>
      </div>

      {/* Efecto hover - solo borde */}
      <div className="absolute inset-0 border-4 border-[#8D2C1D] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
    </div>
  );
}
