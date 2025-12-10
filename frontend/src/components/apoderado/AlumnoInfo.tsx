"use client";

import { useState } from 'react';
import { AlumnoApoderado } from '@/types/apoderado';
import AlumnoInfoModal from './AlumnoInfoModal';

interface AlumnoInfoProps {
  alumno: AlumnoApoderado;
}

export default function AlumnoInfo({ alumno }: AlumnoInfoProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const getInitials = (nombres: string, apellidos: string) => {
    return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
  };

  const getGenderIcon = (sexo?: string) => {
    if (sexo === 'masculino') return '👦';
    if (sexo === 'femenino') return '👧';
    return '🧑';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateString?: string) => {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
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

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9] overflow-hidden mb-8">
      {/* Header con color de marca */}
      <div className="h-4 w-full bg-gradient-to-r from-[#8D2C1D] to-[#D96924]"></div>

      <div className="p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Avatar y información básica */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="w-32 h-32 bg-gradient-to-br from-[#8D2C1D] to-[#6D1F14] rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg">
              {getInitials(alumno.nombres, alumno.apellidos)}
            </div>

            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold text-[#8D2C1D] mb-2">
                {alumno.nombres} {alumno.apellidos}
              </h1>

              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                {alumno.sexo === 'masculino' ? (
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) : alumno.sexo === 'femenino' ? (
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
                <span className="text-lg text-[#555555] font-medium">
                  {alumno.sexo ? alumno.sexo.charAt(0).toUpperCase() + alumno.sexo.slice(1) : 'No especificado'}
                </span>
              </div>

              {/* Estado del alumno */}
              <div className="flex items-center justify-center lg:justify-start">
                <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${alumno.activo
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                  {alumno.activo ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {alumno.activo ? 'Activo' : 'Inactivo'}
                </div>
              </div>
            </div>
          </div>

          {/* Información detallada - Oculta en móvil */}
          <div className="hidden lg:grid flex-1 grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#8D2C1D] border-b-2 border-[#E9E1C9] pb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Información Personal
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-[#666666] uppercase tracking-wide">DNI</label>
                  <p className="text-lg text-[#333333] font-medium">
                    {alumno.dni || 'No registrado'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#666666] uppercase tracking-wide">Fecha de Nacimiento</label>
                  <p className="text-lg text-[#333333] font-medium">
                    {formatDate(alumno.fechaNacimiento)}
                  </p>
                  {calculateAge(alumno.fechaNacimiento) && (
                    <p className="text-sm text-[#666666]">
                      {calculateAge(alumno.fechaNacimiento)} años
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#666666] uppercase tracking-wide">Colegio</label>
                  <p className="text-lg text-[#333333] font-medium">
                    {alumno.colegio.nombre}
                  </p>
                </div>
              </div>
            </div>

            {/* Información Académica */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#8D2C1D] border-b-2 border-[#E9E1C9] pb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                Información Académica
              </h3>

              {alumno.salon ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-[#666666] uppercase tracking-wide">Grado y Sección</label>
                    <p className="text-lg text-[#333333] font-medium">
                      {alumno.salon.grado} - Sección {alumno.salon.seccion}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#666666] uppercase tracking-wide">Nivel Educativo</label>
                    <p className="text-lg text-[#333333] font-medium">
                      {alumno.salon.colegioNivel?.nivel?.nombre || 'No especificado'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#666666] uppercase tracking-wide">Parentesco</label>
                    <p className="text-lg text-[#333333] font-medium capitalize">
                      {alumno.parentesco}
                      {alumno.esPrincipal && (
                        <span className="ml-2 px-2 py-1 bg-[#8D2C1D] text-white text-xs rounded-full">
                          Principal
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-[#666666]">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p>Sin salón asignado</p>
                </div>
              )}
            </div>
          </div>

          {/* Botón para ver más información */}
          <div className="mt-6 lg:hidden">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-gradient-to-r from-[#8D2C1D] to-[#D96924] hover:from-[#7A2518] hover:to-[#C55A1F] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ver más información
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AlumnoInfoModal
        alumno={alumno}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
