'use client';

import { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface FiltrosAsignacionesProps {
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  filtroActivo: boolean | null;
  onFiltroActivoChange: (valor: boolean | null) => void;
  totalAsignaciones: number;
  asignacionesFiltradas: number;
}

export default function FiltrosAsignaciones({
  busqueda,
  onBusquedaChange,
  filtroActivo,
  onFiltroActivoChange,
  totalAsignaciones,
  asignacionesFiltradas
}: FiltrosAsignacionesProps) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const limpiarFiltros = () => {
    onBusquedaChange('');
    onFiltroActivoChange(null);
    setMostrarFiltros(false);
  };

  const hayFiltrosActivos = busqueda !== '' || filtroActivo !== null;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-[#E9E1C9]/30 mb-6">
      
      {/* Filtros optimizados para móvil */}
      <div className="p-4">
        {/* Estadísticas arriba en móvil */}
        <div className="flex items-center justify-between mb-3 sm:hidden">
          <div className="flex items-center space-x-3 text-xs text-[#666666]">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#8D2C1D] rounded-full mr-1"></div>
              <span>Mostrando: {asignacionesFiltradas}</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#666666] rounded-full mr-1"></div>
              <span>Total: {totalAsignaciones}</span>
            </div>
          </div>
          {hayFiltrosActivos && (
            <button
              onClick={limpiarFiltros}
              className="text-[#8D2C1D] hover:text-[#D96924] font-medium transition-colors text-xs"
            >
              Limpiar
            </button>
          )}
        </div>
        
        {/* Filtros de estado */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
          
          {/* Filtros de estado - Compactos para móvil */}
          <div className="flex items-center w-full sm:w-auto">
            <span className="text-sm font-medium text-[#8D2C1D] whitespace-nowrap mr-2">Estado:</span>
            <div className="flex space-x-1 flex-1 sm:flex-initial">
              <button
                onClick={() => onFiltroActivoChange(null)}
                className={`flex-1 sm:flex-initial px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filtroActivo === null 
                    ? 'bg-[#8D2C1D] text-white shadow-sm' 
                    : 'bg-white text-[#666666] border border-[#E9E1C9] hover:bg-[#FCE0C1]'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => onFiltroActivoChange(true)}
                className={`flex-1 sm:flex-initial px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filtroActivo === true 
                    ? 'bg-green-600 text-white shadow-sm' 
                    : 'bg-white text-[#666666] border border-[#E9E1C9] hover:bg-green-50'
                }`}
              >
                Activas
              </button>
              <button
                onClick={() => onFiltroActivoChange(false)}
                className={`flex-1 sm:flex-initial px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filtroActivo === false 
                    ? 'bg-gray-600 text-white shadow-sm' 
                    : 'bg-white text-[#666666] border border-[#E9E1C9] hover:bg-gray-50'
                }`}
              >
                Inactivas
              </button>
            </div>
          </div>

          {/* Estadísticas para desktop */}
          <div className="hidden sm:flex items-center space-x-4 text-xs text-[#666666] ml-auto">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#8D2C1D] rounded-full mr-2"></div>
              <span>Mostrando: {asignacionesFiltradas}</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#666666] rounded-full mr-2"></div>
              <span>Total: {totalAsignaciones}</span>
            </div>
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="text-[#8D2C1D] hover:text-[#D96924] font-medium transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>


      {/* Resumen de resultados */}
      {busqueda && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {asignacionesFiltradas === 0 ? (
              <>No se encontraron resultados para <span className="font-medium">"{busqueda}"</span></>
            ) : (
              <>Mostrando {asignacionesFiltradas} resultado{asignacionesFiltradas !== 1 ? 's' : ''} para <span className="font-medium">"{busqueda}"</span></>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
