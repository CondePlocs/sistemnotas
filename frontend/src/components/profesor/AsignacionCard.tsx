"use client";

import { ProfesorAsignacion } from '@/types/evaluaciones';
import { 
  BookOpenIcon, 
  BuildingOfficeIcon, 
  AcademicCapIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface AsignacionCardProps {
  asignacion: ProfesorAsignacion;
  onRegistrarNotas?: (asignacion: ProfesorAsignacion) => void;
}

export default function AsignacionCard({ asignacion, onRegistrarNotas }: AsignacionCardProps) {
  const { salon, curso } = asignacion;
  const nivel = salon.colegioNivel.nivel.nombre;
  
  // Determinar color del curso o usar uno por defecto
  const cursoColor = curso.color || '#3B82F6';
  
  // Función para obtener color de fondo basado en el color del curso
  const getBackgroundColor = (color: string) => {
    // Convertir hex a RGB y aplicar opacidad
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, 0.1)`;
  };

  // Función para obtener color del borde
  const getBorderColor = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, 0.3)`;
  };

  return (
    <div 
      className="relative bg-white/95 backdrop-blur-sm rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-105 hover:-translate-y-1 hover:border-[#8D2C1D]"
      style={{ 
        borderColor: getBorderColor(cursoColor),
        backgroundColor: getBackgroundColor(cursoColor)
      }}
    >
      {/* Barra de color superior con animación */}
      <div 
        className="h-2 w-full transition-all duration-300 group-hover:h-3"
        style={{ backgroundColor: cursoColor }}
      ></div>

      <div className="p-4 sm:p-6">
        {/* Header del curso */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-lg font-bold text-[#333333] mb-1 group-hover:text-[#8D2C1D] transition-colors duration-300 truncate">
              {curso.nombre}
            </h3>
            {curso.descripcion && (
              <p className="text-xs sm:text-sm text-[#666666] line-clamp-2 group-hover:text-[#555555] transition-colors duration-300">
                {curso.descripcion}
              </p>
            )}
          </div>
          <div 
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl ml-2 sm:ml-3 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110 flex-shrink-0"
            style={{ backgroundColor: cursoColor, color: 'white' }}
          >
            <BookOpenIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        {/* Información del salón */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center text-[#555555] group-hover:text-[#333333] transition-colors duration-300">
            <BuildingOfficeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-[#8D2C1D] group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold truncate">
              Salón: {salon.grado}° {salon.seccion}
            </span>
          </div>

          <div className="flex items-center text-[#555555] group-hover:text-[#333333] transition-colors duration-300">
            <AcademicCapIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-[#8D2C1D] group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">
              Nivel: {nivel}
            </span>
          </div>

          <div className="flex items-center text-[#555555] group-hover:text-[#333333] transition-colors duration-300">
            <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-[#8D2C1D] group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">
              Asignado: {new Date(asignacion.asignadoEn).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Badge de estado */}
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#E9E1C9]">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-0">
            <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 shadow-sm group-hover:shadow-md transition-all duration-300">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mr-1.5 sm:mr-2 animate-pulse"></span>
              Activo
            </span>
            
            {/* Botón de acción único */}
            <button 
              className="w-full sm:w-auto bg-gradient-to-r from-[#8D2C1D] to-[#D96924] hover:from-[#7A2518] hover:to-[#C55A1F] text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-1.5 sm:gap-2"
              onClick={() => onRegistrarNotas?.(asignacion)}
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="hidden sm:inline">Registrar Notas</span>
              <span className="sm:hidden">Notas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Efecto hover - borde más grueso para mejor visibilidad */}
      <div className="absolute inset-0 border-4 border-[#8D2C1D] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
    </div>
  );
}
