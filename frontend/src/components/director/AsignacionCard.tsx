'use client';

import { 
  BookOpenIcon, 
  HomeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { ProfesorAsignacion } from '@/types/profesor-asignacion';

interface AsignacionCardProps {
  asignacion: ProfesorAsignacion;
  onCambiarEstado: (id: number, activo: boolean) => void;
  onPasarGrupo: (id: number) => void;
}

export default function AsignacionCard({ 
  asignacion, 
  onCambiarEstado, 
  onPasarGrupo 
}: AsignacionCardProps) {

  const profesor = asignacion.profesor.usuarioRol.usuario;
  const salon = asignacion.salon;
  const curso = asignacion.curso;

  // Generar color de avatar basado en el nombre del profesor
  const getAvatarColor = (nombre: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = nombre.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const avatarColor = getAvatarColor(profesor.nombres);
  const iniciales = `${profesor.nombres.charAt(0)}${profesor.apellidos.charAt(0)}`.toUpperCase();

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
      asignacion.activo 
        ? 'border-green-200 hover:border-green-300' 
        : 'border-gray-200 hover:border-gray-300 opacity-75'
    }`}>
      
      {/* Header con estado */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${
            asignacion.activo 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {asignacion.activo ? (
              <CheckCircleIcon className="h-3 w-3" />
            ) : (
              <XCircleIcon className="h-3 w-3" />
            )}
            <span>{asignacion.activo ? 'Activa' : 'Inactiva'}</span>
          </div>
          
          {/* Menú de opciones */}
          <div className="text-xs text-gray-500">
            ID: #{asignacion.id}
          </div>
        </div>

        {/* Avatar y nombre del profesor */}
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-sm`}>
            {iniciales}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {profesor.nombres} {profesor.apellidos}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {profesor.email}
            </p>
          </div>
        </div>
      </div>

      {/* Información del curso y salón */}
      <div className="px-4 pb-4 space-y-3">
        
        {/* Curso */}
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
          <div className="flex-shrink-0">
            <BookOpenIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-900 truncate">
              {curso.nombre}
            </p>
            <p className="text-xs text-blue-600">
              Curso asignado
            </p>
          </div>
        </div>

        {/* Salón */}
        <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
          <div className="flex-shrink-0">
            <HomeIcon className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-orange-900 truncate">
              {salon.grado} {salon.seccion}
            </p>
            <p className="text-xs text-orange-600">
              {salon.colegioNivel.nivel.nombre}
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
          {/* Botón Activar/Desactivar */}
          <button
            onClick={() => onCambiarEstado(asignacion.id, !asignacion.activo)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              asignacion.activo
                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
            }`}
          >
            {asignacion.activo ? 'Desactivar' : 'Activar'}
          </button>
          
          {/* Botón Pasar Grupo */}
          <button
            onClick={() => onPasarGrupo(asignacion.id)}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white hover:from-[#7A2518] hover:to-[#C55A1F] transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Pasar Grupo
          </button>
        </div>
        
        {/* ID de la asignación */}
        <div className="text-xs text-gray-400 text-center mt-2">
          ID: #{asignacion.id}
        </div>
      </div>

    </div>
  );
}
