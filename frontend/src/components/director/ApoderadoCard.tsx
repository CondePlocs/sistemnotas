'use client';

import { ApoderadoCardProps } from '@/types/apoderado';

export default function ApoderadoCard({ apoderado, onEdit, onView, onToggleStatus }: ApoderadoCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isActive = apoderado.usuarioRol.usuario.estado === 'activo';

  // Obtener nombres de alumnos
  const alumnosNames = apoderado.alumnos
    ?.filter(rel => rel.activo)
    ?.map(rel => `${rel.alumno.nombres} ${rel.alumno.apellidos}`)
    ?.join(', ') || '';

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border-2 border-[#E9E1C9] hover:border-[#8D2C1D] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-3 sm:p-4 lg:p-6 h-full flex flex-col">
      
      {/* Header con estado */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#8D2C1D] to-[#A0522D] rounded-lg sm:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-[#333333] text-sm sm:text-base lg:text-lg leading-tight truncate">
              {apoderado.usuarioRol.usuario.nombres} {apoderado.usuarioRol.usuario.apellidos}
            </h3>
            <p className="text-xs sm:text-sm text-[#666666] truncate">
              {apoderado.ocupacion || 'Apoderado'}
            </p>
          </div>
        </div>
        
        <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
          isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isActive ? 'Activo' : 'Inactivo'}
        </div>
      </div>

      {/* Información principal */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-1">
        <div className="flex items-center gap-1 sm:gap-2">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          <span className="text-xs sm:text-sm text-[#666666] flex-shrink-0">DNI:</span>
          <span className="text-xs sm:text-sm font-medium text-[#333333] truncate">
            {apoderado.usuarioRol.usuario.dni || 'No especificado'}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          <span className="text-xs sm:text-sm text-[#666666] flex-shrink-0">Email:</span>
          <span className="text-xs sm:text-sm font-medium text-[#333333] truncate">
            {apoderado.usuarioRol.usuario.email}
          </span>
        </div>

        {apoderado.usuarioRol.usuario.telefono && (
          <div className="flex items-center gap-1 sm:gap-2">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <span className="text-xs sm:text-sm text-[#666666] flex-shrink-0">Teléfono:</span>
            <span className="text-xs sm:text-sm font-medium text-[#333333] truncate">
              {apoderado.usuarioRol.usuario.telefono}
            </span>
          </div>
        )}

        {alumnosNames && (
          <div className="flex items-start gap-1 sm:gap-2">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <div className="min-w-0 flex-1">
              <span className="text-xs sm:text-sm text-[#666666]">Apoderado de:</span>
              <p className="text-xs sm:text-sm font-medium text-[#333333] line-clamp-2">
                {alumnosNames}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción - Reorganizados para evitar overflow */}
      <div className="space-y-2">
        {/* Primera fila: Ver y Editar */}
        <div className="flex gap-1 sm:gap-2">
          <button
            onClick={() => onView(apoderado)}
            className="flex-1 px-2 sm:px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="hidden sm:inline">Ver</span>
          </button>

          <button
            onClick={() => onEdit(apoderado)}
            className="flex-1 px-2 sm:px-3 py-2 bg-gradient-to-r from-[#8D2C1D] to-[#A0522D] text-white text-xs sm:text-sm font-medium rounded-lg hover:from-[#A0522D] hover:to-[#8D2C1D] transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="hidden sm:inline">Editar</span>
          </button>
        </div>

        {/* Segunda fila: Activar/Desactivar */}
        <button
          onClick={() => onToggleStatus(apoderado)}
          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[#8D2C1D] text-white text-xs sm:text-sm rounded-md sm:rounded-lg hover:bg-[#A0522D] transition-colors flex items-center gap-1 sm:gap-1.5"
        >
          {isActive ? (
            <>
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span>Desactivar</span>
            </>
          ) : (
            <>
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Activar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
