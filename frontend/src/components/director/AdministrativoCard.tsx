import React from 'react';
import { AdministrativoCardProps } from '@/types/administrativo';

const AdministrativoCard: React.FC<AdministrativoCardProps> = ({
  administrativo,
  onView,
  onEdit,
  onToggleStatus
}) => {
  const isActive = administrativo.usuarioRol.usuario.estado === 'activo';
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCargoLabel = (cargo: string) => {
    const cargoMap: { [key: string]: string } = {
      'secretaria': 'Secretaria',
      'coordinador': 'Coordinador',
      'auxiliar': 'Auxiliar',
      'bibliotecario': 'Bibliotecario',
      'psicologo': 'Psicólogo',
      'enfermero': 'Enfermero',
      'conserje': 'Conserje',
      'vigilante': 'Vigilante',
      'otro': 'Otro'
    };
    return cargoMap[cargo] || cargo;
  };

  const getCondicionLaboralLabel = (condicion?: string) => {
    if (!condicion) return 'No especificado';
    const condicionMap: { [key: string]: string } = {
      'nombrado': 'Nombrado',
      'contratado': 'Contratado',
      'cas': 'CAS',
      'locacion': 'Locación de Servicios'
    };
    return condicionMap[condicion] || condicion;
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-[#E9E1C9] hover:border-[#8D2C1D] hover:-translate-y-1 overflow-hidden">
      {/* Header con avatar y estado */}
      <div className="p-4 sm:p-6 border-b border-[#E9E1C9]/50">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-md ${
            isActive 
              ? 'bg-gradient-to-br from-[#8D2C1D] to-[#D96924]' 
              : 'bg-gradient-to-br from-gray-400 to-gray-500'
          }`}>
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#8D2C1D] text-sm sm:text-base truncate">
              {administrativo.usuarioRol.usuario.nombres && administrativo.usuarioRol.usuario.apellidos
                ? `${administrativo.usuarioRol.usuario.nombres} ${administrativo.usuarioRol.usuario.apellidos}`
                : administrativo.usuarioRol.usuario.email
              }
            </h3>
            <p className="text-[#666666] text-xs sm:text-sm font-medium mt-1">
              {getCargoLabel(administrativo.cargo)}
            </p>
            <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold mt-2 ${
              isActive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-1.5 ${
                isActive ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              {isActive ? 'Activo' : 'Inactivo'}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3">
        {/* Información esencial */}
        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
          <div>
            <span className="text-[#666666] font-medium">Email:</span>
            <p className="text-[#333333] truncate">{administrativo.usuarioRol.usuario.email}</p>
          </div>
          {administrativo.usuarioRol.usuario.dni && (
            <div>
              <span className="text-[#666666] font-medium">DNI:</span>
              <p className="text-[#333333]">{administrativo.usuarioRol.usuario.dni}</p>
            </div>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="p-3 sm:p-4 lg:p-6 pt-0 space-y-1.5 sm:space-y-2">
        {/* Primera fila: Ver y Editar */}
        <div className="flex gap-2">
          <button
            onClick={() => onView(administrativo)}
            className="flex-1 px-2 py-2 sm:px-3 sm:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-1 sm:gap-2"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="hidden sm:inline">Ver</span>
          </button>

          <button
            onClick={() => onEdit(administrativo)}
            className="flex-1 px-2 py-2 sm:px-3 sm:py-2.5 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl hover:from-[#D96924] hover:to-[#8D2C1D] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-1 sm:gap-2"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="hidden sm:inline">Editar</span>
          </button>
        </div>

        {/* Segunda fila: Activar/Desactivar */}
        <button
          onClick={() => onToggleStatus(administrativo)}
          className={`w-full px-2 py-2 sm:px-3 sm:py-2.5 text-white text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-1 sm:gap-2 ${
            isActive 
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Activar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdministrativoCard;
