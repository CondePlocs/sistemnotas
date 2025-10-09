'use client';

import { ProfesorCardProps } from '@/types/profesor';

export default function ProfesorCard({ profesor, onEdit, onView, onToggleStatus }: ProfesorCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isActive = profesor.usuarioRol.usuario.estado === 'activo';

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border-2 border-[#E9E1C9] hover:border-[#8D2C1D] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-3 sm:p-4 lg:p-6 h-full flex flex-col">
      
      {/* Header con estado */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#8D2C1D] to-[#D96924] rounded-lg sm:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-[#333333] text-sm sm:text-base lg:text-lg leading-tight truncate">
              {profesor.usuarioRol.usuario.nombres} {profesor.usuarioRol.usuario.apellidos}
            </h3>
            <p className="text-xs sm:text-sm text-[#666666] truncate">
              {profesor.especialidad || 'Profesor'}
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
          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#8D2C1D] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          <span className="text-xs sm:text-sm text-[#666666] flex-shrink-0">DNI:</span>
          <span className="text-xs sm:text-sm font-medium text-[#333333] truncate">
            {profesor.usuarioRol.usuario.dni || 'No especificado'}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#8D2C1D] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span className="text-xs sm:text-sm text-[#666666] flex-shrink-0">Nacimiento:</span>
          <span className="text-xs sm:text-sm font-medium text-[#333333] truncate">
            {formatDate(profesor.fechaNacimiento)}
          </span>
        </div>

        {profesor.gradoAcademico && (
          <div className="flex items-center gap-1 sm:gap-2">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#8D2C1D] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
            </svg>
            <span className="text-xs sm:text-sm text-[#666666] flex-shrink-0">Grado:</span>
            <span className="text-xs sm:text-sm font-medium text-[#333333] truncate">
              {profesor.gradoAcademico.charAt(0).toUpperCase() + profesor.gradoAcademico.slice(1)}
            </span>
          </div>
        )}

        {profesor.condicionLaboral && (
          <div className="flex items-center gap-1 sm:gap-2">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#8D2C1D] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs sm:text-sm text-[#666666] flex-shrink-0">Condición:</span>
            <span className="text-xs sm:text-sm font-medium text-[#333333] truncate">
              {profesor.condicionLaboral.charAt(0).toUpperCase() + profesor.condicionLaboral.slice(1)}
            </span>
          </div>
        )}
      </div>

      {/* Botones de acción - Reorganizados para evitar overflow */}
      <div className="space-y-2">
        {/* Primera fila: Ver y Editar */}
        <div className="flex gap-1 sm:gap-2">
          <button
            onClick={() => onView(profesor)}
            className="flex-1 px-2 sm:px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="hidden sm:inline">Ver</span>
          </button>

          <button
            onClick={() => onEdit(profesor)}
            className="flex-1 px-2 sm:px-3 py-2 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white text-xs sm:text-sm font-medium rounded-lg hover:from-[#84261A] hover:to-[#C85A1F] transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="hidden sm:inline">Editar</span>
          </button>
        </div>

        {/* Segunda fila: Activar/Desactivar */}
        <button
          onClick={() => onToggleStatus(profesor)}
          className={`w-full px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
            isActive
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
          }`}
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
