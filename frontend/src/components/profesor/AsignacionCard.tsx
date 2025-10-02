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
      className="relative bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group hover:scale-105"
      style={{ 
        borderColor: getBorderColor(cursoColor),
        backgroundColor: getBackgroundColor(cursoColor)
      }}
    >
      {/* Barra de color superior */}
      <div 
        className="h-2 w-full"
        style={{ backgroundColor: cursoColor }}
      ></div>

      <div className="p-6">
        {/* Header del curso */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
              {curso.nombre}
            </h3>
            {curso.descripcion && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {curso.descripcion}
              </p>
            )}
          </div>
          <div 
            className="p-2 rounded-lg ml-3"
            style={{ backgroundColor: cursoColor, color: 'white' }}
          >
            <BookOpenIcon className="h-5 w-5" />
          </div>
        </div>

        {/* Información del salón */}
        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            <BuildingOfficeIcon className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium">
              Salón: {salon.grado}° {salon.seccion}
            </span>
          </div>

          <div className="flex items-center text-gray-700">
            <AcademicCapIcon className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm">
              Nivel: {nivel}
            </span>
          </div>

          <div className="flex items-center text-gray-700">
            <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm">
              Asignado: {new Date(asignacion.asignadoEn).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Badge de estado */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
              Activo
            </span>
            
            {/* Botones de acción */}
            <div className="flex items-center gap-2">
              <button 
                className="text-sm font-medium hover:underline transition-colors"
                style={{ color: cursoColor }}
                onClick={() => {
                  // TODO: Navegar a vista detallada del curso/salón
                  console.log('Ver detalles de asignación:', asignacion.id);
                }}
              >
                Ver detalles
              </button>
              <span className="text-gray-300">|</span>
              <button 
                className="bg-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => onRegistrarNotas?.(asignacion)}
              >
                Registrar Notas
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Efecto hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-10 transition-opacity duration-200 pointer-events-none"></div>
    </div>
  );
}
