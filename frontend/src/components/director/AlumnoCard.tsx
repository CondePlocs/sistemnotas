"use client";

import { Alumno } from '@/types/alumno';

interface AlumnoCardProps {
  alumno: Alumno;
  onView: (alumno: Alumno) => void;
  onEdit: (alumno: Alumno) => void;
  onStatusChange: (alumno: Alumno, newStatus: 'activo' | 'inactivo') => void;
}

export default function AlumnoCard({ alumno, onView, onEdit, onStatusChange }: AlumnoCardProps) {
  const getInitials = (nombres: string, apellidos: string) => {
    const firstInitial = nombres?.charAt(0)?.toUpperCase() || '';
    const lastInitial = apellidos?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

  const getAvatarColor = (id: number) => {
    const colors = [
      'from-[#8D2C1D] to-[#D96924]',
      'from-[#2563EB] to-[#1D4ED8]',
      'from-[#16A34A] to-[#15803D]',
      'from-[#7C3AED] to-[#6D28D9]',
      'from-[#EA580C] to-[#DC2626]',
      'from-[#0891B2] to-[#0E7490]',
    ];
    return colors[id % colors.length];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAge = (fechaNacimiento?: string) => {
    if (!fechaNacimiento) return null;
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden ${
      alumno.activo 
        ? 'border-[#E9E1C9] hover:border-[#8D2C1D]' 
        : 'border-red-200 hover:border-red-400 opacity-75'
    }`}>
      {/* Header con estado */}
      <div className={`px-4 py-3 ${alumno.activo ? 'bg-gradient-to-r from-[#8D2C1D] to-[#D96924]' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getAvatarColor(alumno.id)} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
              {getInitials(alumno.nombres, alumno.apellidos)}
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm truncate max-w-[120px]">
                {alumno.nombres} {alumno.apellidos}
              </h3>
              <p className="text-white/80 text-xs">
                {alumno.activo ? 'Activo' : 'Inactivo'}
              </p>
            </div>
          </div>
          
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            alumno.activo 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {alumno.activo ? '●' : '○'}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3">
        {/* Información básica */}
        <div className="space-y-2">
          {alumno.dni && (
            <div className="flex items-center text-sm">
              <span className="text-[#666666] w-16">DNI:</span>
              <span className="font-medium text-[#333333]">{alumno.dni}</span>
            </div>
          )}
          
          {alumno.codigoAlumno && (
            <div className="flex items-center text-sm">
              <span className="text-[#666666] w-16">Código:</span>
              <span className="font-medium text-[#333333] truncate">{alumno.codigoAlumno}</span>
            </div>
          )}

          {alumno.fechaNacimiento && (
            <div className="flex items-center text-sm">
              <span className="text-[#666666] w-16">Edad:</span>
              <span className="font-medium text-[#333333]">{calculateAge(alumno.fechaNacimiento)} años</span>
            </div>
          )}

          {alumno.sexo && (
            <div className="flex items-center text-sm">
              <span className="text-[#666666] w-16">Sexo:</span>
              <span className="font-medium text-[#333333] capitalize">{alumno.sexo}</span>
            </div>
          )}

          {alumno.numeroContacto && (
            <div className="flex items-center text-sm">
              <span className="text-[#666666] w-16">Tel:</span>
              <span className="font-medium text-[#333333]">{alumno.numeroContacto}</span>
            </div>
          )}
        </div>

        {/* Información de registro */}
        <div className="pt-2 border-t border-[#E9E1C9]">
          <div className="text-xs text-[#666666]">
            <p>Registrado: {formatDate(alumno.creadoEn)}</p>
            {alumno.creadorUser && (
              <p>Por: {alumno.creadorUser.nombres} {alumno.creadorUser.apellidos}</p>
            )}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="px-4 pb-4">
        <div className="mt-4 space-y-2">
          {/* Primera fila - Ver y Editar */}
          <div className="flex gap-2">
            <button
              onClick={() => onView(alumno)}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver
            </button>
            
            <button
              onClick={() => onEdit(alumno)}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
          </div>
          
          {/* Segunda fila - Activar/Desactivar */}
          <button
            onClick={() => onStatusChange(alumno, alumno.activo ? 'inactivo' : 'activo')}
            className={`w-full px-3 py-2 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1 ${
              alumno.activo 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {alumno.activo ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
                Desactivar
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Activar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
