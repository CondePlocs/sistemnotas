"use client";

import { Alumno } from '@/types/alumno';

interface ModalVerAlumnoProps {
  isOpen: boolean;
  onClose: () => void;
  alumno: Alumno | null;
}

export default function ModalVerAlumno({ isOpen, onClose, alumno }: ModalVerAlumnoProps) {
  if (!isOpen || !alumno) return null;

  // Debug temporal - verificar datos recibidos
  console.log('Datos del alumno en modal:', alumno);
  console.log('creadorUser:', alumno.creadorUser);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative flex flex-col">
        {/* Botón cerrar fijo */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors p-2 rounded-full shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className={`px-6 py-4 ${alumno.activo ? 'bg-gradient-to-r from-[#8D2C1D] to-[#D96924]' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}>
          <div className="flex items-center space-x-4 pr-12">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getAvatarColor(alumno.id)} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
              {getInitials(alumno.nombres, alumno.apellidos)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">
                {alumno.nombres} {alumno.apellidos}
              </h2>
              <p className="text-white/80">
                {alumno.activo ? 'Alumno Activo' : 'Alumno Inactivo'}
              </p>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              alumno.activo 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {alumno.activo ? 'Activo' : 'Inactivo'}
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información Personal */}
            <div className="bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9] p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-[#8D2C1D] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Información Personal
              </h3>
              
              <div className="space-y-4">
                {alumno.dni && (
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                    <span className="text-[#666666] font-medium">DNI:</span>
                    <span className="font-semibold text-[#333333]">{alumno.dni}</span>
                  </div>
                )}
                
                {alumno.codigoAlumno && (
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                    <span className="text-[#666666] font-medium">Código:</span>
                    <span className="font-semibold text-[#333333]">{alumno.codigoAlumno}</span>
                  </div>
                )}

                {alumno.fechaNacimiento && (
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                    <span className="text-[#666666] font-medium">Fecha de Nacimiento:</span>
                    <span className="font-semibold text-[#333333]">{formatDate(alumno.fechaNacimiento)}</span>
                  </div>
                )}

                {alumno.fechaNacimiento && (
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                    <span className="text-[#666666] font-medium">Edad:</span>
                    <span className="font-semibold text-[#333333]">{calculateAge(alumno.fechaNacimiento)} años</span>
                  </div>
                )}

                {alumno.sexo && (
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                    <span className="text-[#666666] font-medium">Sexo:</span>
                    <span className="font-semibold text-[#333333] capitalize">{alumno.sexo}</span>
                  </div>
                )}

                {alumno.nacionalidad && (
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                    <span className="text-[#666666] font-medium">Nacionalidad:</span>
                    <span className="font-semibold text-[#333333]">{alumno.nacionalidad}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="bg-gradient-to-r from-[#E9E1C9] to-[#D4C5A9] p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-[#8D2C1D] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Información de Contacto
              </h3>
              
              <div className="space-y-4">
                {alumno.direccion ? (
                  <div className="p-3 bg-white/60 rounded-xl">
                    <span className="text-[#666666] font-medium block mb-1">Dirección:</span>
                    <span className="font-semibold text-[#333333]">{alumno.direccion}</span>
                  </div>
                ) : (
                  <div className="p-3 bg-white/30 rounded-xl text-center">
                    <span className="text-[#999999] italic">No registrada</span>
                  </div>
                )}

                {alumno.distrito ? (
                  <div className="p-3 bg-white/60 rounded-xl">
                    <span className="text-[#666666] font-medium block mb-1">Distrito:</span>
                    <span className="font-semibold text-[#333333]">{alumno.distrito}</span>
                  </div>
                ) : (
                  <div className="p-3 bg-white/30 rounded-xl text-center">
                    <span className="text-[#999999] italic">No registrado</span>
                  </div>
                )}

                {alumno.numeroContacto ? (
                  <div className="p-3 bg-white/60 rounded-xl">
                    <span className="text-[#666666] font-medium block mb-1">Número de Contacto:</span>
                    <span className="font-semibold text-[#333333]">{alumno.numeroContacto}</span>
                  </div>
                ) : (
                  <div className="p-3 bg-white/30 rounded-xl text-center">
                    <span className="text-[#999999] italic">No registrado</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información del Colegio */}
          {alumno.colegio && (
            <div className="mt-6 bg-gradient-to-r from-[#2563EB]/10 to-[#1D4ED8]/10 p-6 rounded-2xl border-2 border-[#2563EB]/20">
              <h3 className="text-lg font-semibold text-[#2563EB] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Información Institucional
              </h3>
              
              <div className="bg-white/60 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[#666666] font-medium">Colegio:</span>
                  <span className="font-semibold text-[#333333]">{alumno.colegio.nombre}</span>
                </div>
              </div>
            </div>
          )}

          {/* Información de Auditoría */}
          <div className="mt-6 bg-gradient-to-r from-[#7C3AED]/10 to-[#6D28D9]/10 p-6 rounded-2xl border-2 border-[#7C3AED]/20">
            <h3 className="text-lg font-semibold text-[#7C3AED] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Información de Registro
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/60 p-4 rounded-xl">
                <span className="text-[#666666] font-medium block mb-1">Fecha de Registro:</span>
                <span className="font-semibold text-[#333333]">{formatDate(alumno.creadoEn)}</span>
              </div>
              
              <div className="bg-white/60 p-4 rounded-xl">
                <span className="text-[#666666] font-medium block mb-1">Última Actualización:</span>
                <span className="font-semibold text-[#333333]">{formatDate(alumno.actualizadoEn)}</span>
              </div>

              <div className="bg-white/60 p-4 rounded-xl md:col-span-2">
                <span className="text-[#666666] font-medium block mb-1">Creado Por:</span>
                <span className="font-semibold text-[#333333]">
                  {alumno.creadorUser ? 
                    `${alumno.creadorUser.nombres} ${alumno.creadorUser.apellidos}` : 
                    'Información no disponible'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer fijo */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 mt-auto">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white rounded-xl hover:from-[#D96924] hover:to-[#8D2C1D] focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] transition-all duration-200 flex items-center gap-2 font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
