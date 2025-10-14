"use client";

import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FiltroAlumnosProps {
  filtro: string;
  onFiltroChange: (filtro: string) => void;
  totalAlumnos: number;
  alumnosFiltrados: number;
}

export default function FiltroAlumnos({
  filtro,
  onFiltroChange,
  totalAlumnos,
  alumnosFiltrados
}: FiltroAlumnosProps) {
  const handleClearFiltro = () => {
    onFiltroChange('');
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9] p-6 mb-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Campo de búsqueda */}
        <div className="flex-1 max-w-md">
          <label htmlFor="filtro" className="block text-sm font-semibold text-[#333333] mb-2">
            🔍 Buscar estudiante
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-[#8D2C1D]" />
            </div>
            <input
              type="text"
              id="filtro"
              value={filtro}
              onChange={(e) => onFiltroChange(e.target.value)}
              placeholder="Buscar por nombre, apellido, grado, sección o nivel..."
              className="w-full pl-10 pr-10 py-3 border-2 border-[#E9E1C9] rounded-xl focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-300 font-medium placeholder-[#999999]"
            />
            {filtro && (
              <button
                onClick={handleClearFiltro}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#666666] hover:text-[#8D2C1D] transition-colors duration-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Estadísticas de filtrado */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9] rounded-lg px-4 py-2 border border-[#E9E1C9]">
            <div className="text-center">
              <p className="text-xs font-medium text-[#666666]">Mostrando</p>
              <p className="text-lg font-bold text-[#8D2C1D]">
                {alumnosFiltrados} de {totalAlumnos}
              </p>
            </div>
          </div>

          {filtro && (
            <div className="flex items-center gap-2 text-sm text-[#666666]">
              <span>Filtrado por:</span>
              <span className="bg-[#8D2C1D] text-white px-3 py-1 rounded-full font-semibold">
                "{filtro}"
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mensaje cuando no hay resultados */}
      {filtro && alumnosFiltrados === 0 && (
        <div className="mt-4 p-4 bg-yellow-50/95 backdrop-blur-sm border-2 border-yellow-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-yellow-800 font-semibold">No se encontraron estudiantes</p>
              <p className="text-yellow-700 text-sm">
                Intenta con otros términos de búsqueda o 
                <button 
                  onClick={handleClearFiltro}
                  className="ml-1 underline hover:text-yellow-900 font-medium"
                >
                  limpia el filtro
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
