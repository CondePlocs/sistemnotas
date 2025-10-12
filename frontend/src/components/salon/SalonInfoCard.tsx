'use client';

import { useState } from 'react';
import { Salon } from '@/types/salon';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  UserGroupIcon,
  ClockIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface SalonInfoCardProps {
  salon: Salon;
  onVer: (salon: Salon) => void;
  onEditar: (salon: Salon) => void;
  onEliminar: (salon: Salon) => void;
}

export default function SalonInfoCard({ salon, onVer, onEditar, onEliminar }: SalonInfoCardProps) {
  const [loading, setLoading] = useState(false);

  const getNivelInfo = (nivel: string) => {
    switch (nivel) {
      case 'INICIAL':
        return { icon: '👶', color: 'pink', bgGradient: 'from-pink-50 to-pink-100', borderColor: 'border-pink-200' };
      case 'PRIMARIA':
        return { icon: '📚', color: 'blue', bgGradient: 'from-blue-50 to-blue-100', borderColor: 'border-blue-200' };
      case 'SECUNDARIA':
        return { icon: '🎓', color: 'green', bgGradient: 'from-green-50 to-green-100', borderColor: 'border-green-200' };
      default:
        return { icon: '🏫', color: 'gray', bgGradient: 'from-gray-50 to-gray-100', borderColor: 'border-gray-200' };
    }
  };

  const nivelInfo = getNivelInfo(salon.colegioNivel?.nivel?.nombre || 'GENERAL');
  
  // Generar avatar con iniciales
  const iniciales = `${salon.grado.charAt(0)}${salon.seccion.charAt(0)}`.toUpperCase();
  const avatarColor = `bg-${nivelInfo.color}-500`;

  return (
    <div className={`bg-gradient-to-br ${nivelInfo.bgGradient} rounded-2xl shadow-lg border-2 ${nivelInfo.borderColor} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-3 lg:p-6`}>
      
      {/* Header con avatar - Más compacto en móvil */}
      <div className="flex items-center gap-2 lg:gap-4 mb-3 lg:mb-4">
        <div className={`w-8 h-8 lg:w-12 lg:h-12 ${avatarColor} rounded-lg lg:rounded-xl flex items-center justify-center text-white font-bold text-sm lg:text-lg shadow-lg`}>
          {iniciales}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm lg:text-xl font-bold text-gray-800 truncate">
            {salon.grado} - {salon.seccion}
          </h3>
          <p className="text-gray-600 text-xs lg:text-sm flex items-center gap-1">
            <span className="text-sm lg:text-lg">{nivelInfo.icon}</span>
            <span className="truncate">{salon.colegioNivel?.nivel?.nombre || 'Sin nivel'}</span>
          </p>
        </div>
      </div>

      {/* Información del salón - Más compacta */}
      <div className="space-y-2 lg:space-y-3 mb-3 lg:mb-6">
        <div className="flex items-center gap-1 lg:gap-2 text-gray-700">
          <ClockIcon className="w-3 h-3 lg:w-4 lg:h-4" />
          <span className="text-xs lg:text-sm font-medium">Turno:</span>
          <span className="text-xs lg:text-sm truncate">{salon.turno}</span>
        </div>
        
        <div className="flex items-center gap-1 lg:gap-2 text-gray-700">
          <UserGroupIcon className="w-3 h-3 lg:w-4 lg:h-4" />
          <span className="text-xs lg:text-sm font-medium">Alumnos:</span>
          <span className="text-xs lg:text-sm">{salon._count?.alumnos || 0}</span>
        </div>

        <div className="flex items-center gap-1 lg:gap-2 text-gray-700">
          <AcademicCapIcon className="w-3 h-3 lg:w-4 lg:h-4" />
          <span className="text-xs lg:text-sm font-medium">Estado:</span>
          <span className={`text-xs lg:text-sm font-semibold ${salon.activo ? 'text-green-600' : 'text-red-600'}`}>
            {salon.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Fecha de creación - Oculta en móvil */}
      <div className="hidden lg:block text-xs text-gray-500 mb-4 bg-white/60 rounded-lg p-2">
        Creado: {new Date(salon.creadoEn).toLocaleDateString('es-PE')}
      </div>

      {/* Botones de acción - Más compactos en móvil */}
      <div className="space-y-1 lg:space-y-2">
        {/* Primera fila - Ver y Editar */}
        <div className="flex gap-1 lg:gap-2">
          <button
            onClick={() => onVer(salon)}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 lg:py-2 px-2 lg:px-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1 text-xs lg:text-sm font-medium"
          >
            <EyeIcon className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden lg:inline">Ver</span>
          </button>
          
          <button
            onClick={() => onEditar(salon)}
            disabled={loading}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-1.5 lg:py-2 px-2 lg:px-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1 text-xs lg:text-sm font-medium"
          >
            <PencilIcon className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden lg:inline">Editar</span>
          </button>
        </div>

        {/* Segunda fila - Eliminar */}
        <button
          onClick={() => onEliminar(salon)}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-1.5 lg:py-2 px-2 lg:px-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1 text-xs lg:text-sm font-medium"
        >
          <TrashIcon className="w-3 h-3 lg:w-4 lg:h-4" />
          <span className="hidden lg:inline">Eliminar</span>
        </button>
      </div>
    </div>
  );
}
