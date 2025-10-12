'use client';

import { useState, useEffect } from 'react';
import { SalonConNivel, Turno } from '@/types/salon';
import { 
  UserGroupIcon, 
  PlusIcon, 
  EyeIcon,
  UsersIcon,
  ClockIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface SalonCardMejoradoProps {
  salon: SalonConNivel;
  onAsignarAlumnos: (salon: SalonConNivel) => void;
  refreshTrigger?: number;
}

export default function SalonCardMejorado({ salon, onAsignarAlumnos, refreshTrigger }: SalonCardMejoradoProps) {
  const [datosAlumnos, setDatosAlumnos] = useState<{
    totalAlumnos: number;
    cargando: boolean;
  }>({
    totalAlumnos: 0,
    cargando: true
  });

  // Cargar cantidad de alumnos del salón
  useEffect(() => {
    cargarDatosAlumnos();
  }, [salon.id, refreshTrigger]);

  const cargarDatosAlumnos = async () => {
    try {
      const response = await fetch(`/api/salones/${salon.id}/alumnos`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setDatosAlumnos({
          totalAlumnos: data.data?.estadisticas?.totalAlumnos || 0,
          cargando: false
        });
      } else {
        setDatosAlumnos({ totalAlumnos: 0, cargando: false });
      }
    } catch (error) {
      console.error('Error al cargar datos del salón:', error);
      setDatosAlumnos({ totalAlumnos: 0, cargando: false });
    }
  };

  const obtenerColorNivel = (nivel: string) => {
    switch (nivel) {
      case 'INICIAL':
        return 'from-green-400 to-green-600';
      case 'PRIMARIA':
        return 'from-blue-400 to-blue-600';
      case 'SECUNDARIA':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const obtenerIconoNivel = (nivel: string) => {
    switch (nivel) {
      case 'INICIAL':
        return '🎨';
      case 'PRIMARIA':
        return '📚';
      case 'SECUNDARIA':
        return '🎓';
      default:
        return '🏫';
    }
  };

  const obtenerInfoTurno = (turno: Turno) => {
    switch (turno) {
      case Turno.MAÑANA:
        return { icono: '🌅', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
      case Turno.TARDE:
        return { icono: '🌇', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
      case Turno.NOCHE:
        return { icono: '🌙', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' };
      default:
        return { icono: '🕐', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  const obtenerColorCapacidad = () => {
    if (datosAlumnos.totalAlumnos === 0) return 'bg-gray-300';
    if (datosAlumnos.totalAlumnos <= 20) return 'bg-green-500';
    if (datosAlumnos.totalAlumnos <= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const porcentajeCapacidad = Math.min((datosAlumnos.totalAlumnos / 30) * 100, 100);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#E9E1C9] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Header con gradiente del nivel */}
      <div className={`bg-gradient-to-r ${obtenerColorNivel(salon.nivel)} p-4 text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{obtenerIconoNivel(salon.nivel)}</span>
              <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                {salon.nivel}
              </span>
            </div>
            
            {datosAlumnos.cargando ? (
              <div className="animate-pulse bg-white/20 h-6 w-12 rounded-full"></div>
            ) : (
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                <UsersIcon className="h-4 w-4" />
                <span className="text-sm font-semibold">{datosAlumnos.totalAlumnos}</span>
              </div>
            )}
          </div>

          <h3 className="font-bold text-xl mb-1">
            {salon.grado} - {salon.seccion}
          </h3>
          
          {/* Turno */}
          {salon.turno && (
            <div className="flex items-center gap-1 text-white/90">
              <ClockIcon className="h-4 w-4" />
              <span className="text-sm">{obtenerInfoTurno(salon.turno).icono} {salon.turno}</span>
            </div>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Información de alumnos */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium">Alumnos asignados</span>
            <span className="font-semibold text-[#8D2C1D]">
              {datosAlumnos.totalAlumnos === 0 
                ? 'Sin alumnos'
                : `${datosAlumnos.totalAlumnos}/30`
              }
            </span>
          </div>
          
          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${obtenerColorCapacidad()}`}
              style={{ width: `${porcentajeCapacidad}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span className="font-medium">{Math.round(porcentajeCapacidad)}%</span>
            <span>30</span>
          </div>
        </div>

        {/* Estado del salón */}
        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AcademicCapIcon className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Estado</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              salon.activo 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {salon.activo ? '● Activo' : '● Inactivo'}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-2">
          <button
            onClick={() => onAsignarAlumnos(salon)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white font-semibold rounded-xl hover:from-[#D96924] hover:to-[#8D2C1D] focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="h-4 w-4" />
            Asignar Alumnos
          </button>
          
          <button
            onClick={() => {
              window.location.href = `/director/salones/${salon.id}/alumnos`;
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-[#E9E1C9] text-[#8D2C1D] font-semibold rounded-xl hover:bg-[#8D2C1D] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] transition-all duration-300"
          >
            <EyeIcon className="h-4 w-4" />
            Ver Detalles
          </button>
        </div>
      </div>

      {/* Footer con ID */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9] border-t border-[#E9E1C9]">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#8D2C1D] font-medium">ID: {salon.id}</span>
          <span className="text-[#666666]">
            Creado: {new Date(salon.creadoEn).toLocaleDateString('es-PE')}
          </span>
        </div>
      </div>
    </div>
  );
}
