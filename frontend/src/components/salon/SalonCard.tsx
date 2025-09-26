'use client';

import { useState, useEffect } from 'react';
import { Salon } from '@/types/salon';
import { SalonConAlumnos } from '@/types/salon-alumnos';
import { 
  UserGroupIcon, 
  PlusIcon, 
  EyeIcon,
  UsersIcon 
} from '@heroicons/react/24/outline';

interface SalonCardProps {
  salon: Salon;
  onAsignarAlumnos: (salon: Salon) => void;
  refreshTrigger?: number; // Para forzar actualización
}

export default function SalonCard({ salon, onAsignarAlumnos, refreshTrigger }: SalonCardProps) {
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PRIMARIA':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SECUNDARIA':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Header del salón */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{obtenerIconoNivel(salon.nivel)}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${obtenerColorNivel(salon.nivel)}`}>
              {salon.nivel}
            </span>
          </div>
          
          {datosAlumnos.cargando ? (
            <div className="animate-pulse bg-gray-200 h-4 w-8 rounded"></div>
          ) : (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <UsersIcon className="h-4 w-4" />
              <span>{datosAlumnos.totalAlumnos}</span>
            </div>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 text-lg">
          {salon.grado} - {salon.seccion}
        </h3>
        
        <p className="text-sm text-gray-600 mt-1">
          {datosAlumnos.totalAlumnos === 0 
            ? 'Sin alumnos asignados'
            : `${datosAlumnos.totalAlumnos} alumno${datosAlumnos.totalAlumnos !== 1 ? 's' : ''} asignado${datosAlumnos.totalAlumnos !== 1 ? 's' : ''}`
          }
        </p>
      </div>

      {/* Contenido del salón */}
      <div className="p-4">
        {/* Estadísticas visuales */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Capacidad estimada</span>
            <span>30 alumnos</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                datosAlumnos.totalAlumnos === 0 
                  ? 'bg-gray-300' 
                  : datosAlumnos.totalAlumnos <= 20 
                    ? 'bg-green-500' 
                    : datosAlumnos.totalAlumnos <= 25 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
              }`}
              style={{ 
                width: `${Math.min((datosAlumnos.totalAlumnos / 30) * 100, 100)}%` 
              }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>30</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex space-x-2">
          <button
            onClick={() => onAsignarAlumnos(salon)}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Asignar
          </button>
          
          <button
            onClick={() => {
              // TODO: Implementar vista detallada
              window.location.href = `/director/salones/${salon.id}/alumnos`;
            }}
            className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors duration-200"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Footer con información adicional */}
      <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>ID: {salon.id}</span>
          <span>
            {salon.activo ? (
              <span className="text-green-600 font-medium">● Activo</span>
            ) : (
              <span className="text-red-600 font-medium">● Inactivo</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
