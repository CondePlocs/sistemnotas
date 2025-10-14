"use client";

import { AlumnoApoderado } from '@/types/apoderado';

interface AlumnoInfoProps {
  alumno: AlumnoApoderado;
}

export default function AlumnoInfo({ alumno }: AlumnoInfoProps) {
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
      {/* Header con nivel educativo */}
      <div className={`h-4 w-full bg-gradient-to-r ${getNivelColor(alumno.salon?.colegioNivel?.nivel?.nombre)}`}></div>
      
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
                <span className="text-2xl">{getGenderIcon(alumno.sexo)}</span>
                <span className="text-lg text-[#555555] font-medium">
                  {alumno.sexo ? alumno.sexo.charAt(0).toUpperCase() + alumno.sexo.slice(1) : 'No especificado'}
                </span>
              </div>

              {/* Estado del alumno */}
              <div className="flex items-center justify-center lg:justify-start">
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  alumno.activo 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {alumno.activo ? '✅ Activo' : '❌ Inactivo'}
                </div>
              </div>
            </div>
          </div>

          {/* Información detallada */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#8D2C1D] border-b-2 border-[#E9E1C9] pb-2">
                📋 Información Personal
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
              <h3 className="text-xl font-bold text-[#8D2C1D] border-b-2 border-[#E9E1C9] pb-2">
                🎓 Información Académica
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
                  <div className="text-4xl mb-2">📚</div>
                  <p>Sin salón asignado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
