"use client";

import { useState } from 'react';

interface FiltroCursosProps {
  filtro: string;
  onFiltroChange: (filtro: string) => void;
  totalCursos: number;
  cursosFiltrados: number;
}

export default function FiltroCursos({ 
  filtro, 
  onFiltroChange, 
  totalCursos, 
  cursosFiltrados 
}: FiltroCursosProps) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const limpiarFiltro = () => {
    onFiltroChange('');
  };

  const filtrosRapidos = [
    { label: 'Matemática', valor: 'matemática' },
    { label: 'Comunicación', valor: 'comunicación' },
    { label: 'Ciencias', valor: 'ciencia' },
    { label: 'Historia', valor: 'historia' },
    { label: 'Inglés', valor: 'inglés' },
    { label: 'Educación Física', valor: 'educación física' }
  ];

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9] p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Buscador principal */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-[#8D2C1D] text-lg">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre del curso, descripción o profesor..."
              value={filtro}
              onChange={(e) => onFiltroChange(e.target.value)}
              className="w-full pl-12 pr-12 py-3 border-2 border-[#E9E1C9] rounded-lg focus:border-[#8D2C1D] focus:outline-none transition-colors text-[#333333] placeholder-[#999999]"
            />
            {filtro && (
              <button
                onClick={limpiarFiltro}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8D2C1D] hover:text-[#6D1F14] transition-colors"
                title="Limpiar búsqueda"
              >
                <span className="text-lg">✖️</span>
              </button>
            )}
          </div>
        </div>

        {/* Botón de filtros avanzados */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              mostrarFiltros
                ? 'bg-[#8D2C1D] text-white'
                : 'bg-[#F7F3E9] text-[#8D2C1D] hover:bg-[#E9E1C9]'
            }`}
          >
            <span>🎯</span>
            Filtros
            <span className={`transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {/* Contador de resultados */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-[#666666]">
            <span className="font-medium">
              {cursosFiltrados} de {totalCursos} cursos
            </span>
          </div>
        </div>
      </div>

      {/* Filtros rápidos */}
      {mostrarFiltros && (
        <div className="mt-4 pt-4 border-t border-[#E9E1C9]">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-[#8D2C1D] mb-2">
              🚀 Filtros Rápidos
            </h4>
            <div className="flex flex-wrap gap-2">
              {filtrosRapidos.map((filtroRapido) => (
                <button
                  key={filtroRapido.valor}
                  onClick={() => onFiltroChange(filtroRapido.valor)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filtro.toLowerCase().includes(filtroRapido.valor.toLowerCase())
                      ? 'bg-[#8D2C1D] text-white'
                      : 'bg-[#F7F3E9] text-[#8D2C1D] hover:bg-[#E9E1C9]'
                  }`}
                >
                  {filtroRapido.label}
                </button>
              ))}
            </div>
          </div>

          {/* Consejos de búsqueda */}
          <div className="text-xs text-[#666666] bg-[#F7F3E9] p-3 rounded-lg">
            <p className="font-semibold mb-1">💡 Consejos de búsqueda:</p>
            <ul className="space-y-1">
              <li>• Busca por nombre del curso: "Matemática", "Comunicación"</li>
              <li>• Busca por profesor: "Juan Pérez", "María"</li>
              <li>• Usa palabras clave: "ciencia", "historia", "inglés"</li>
            </ul>
          </div>
        </div>
      )}

      {/* Contador de resultados en móvil */}
      <div className="sm:hidden mt-3 text-center text-sm text-[#666666]">
        Mostrando {cursosFiltrados} de {totalCursos} cursos
      </div>
    </div>
  );
}
