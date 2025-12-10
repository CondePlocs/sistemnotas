"use client";

import { useState, useMemo } from 'react';
import { CursoAlumno } from '@/types/apoderado';
import CursoCard from './CursoCard';

interface CursosListProps {
  cursos: CursoAlumno[];
  alumnoId: number;
  onRefresh: () => void;
  alumnoNombre: string;
  onDescargarExcel: () => void;
  onDescargarPDF: () => void;
  descargandoReporte: 'excel' | 'pdf' | null;
}

export default function CursosList({
  cursos,
  alumnoId,
  onRefresh,
  alumnoNombre,
  onDescargarExcel,
  onDescargarPDF,
  descargandoReporte
}: CursosListProps) {
  const [filtro, setFiltro] = useState('');

  // Filtrar cursos basado en el texto de búsqueda
  const cursosFiltrados = useMemo(() => {
    if (!filtro.trim()) {
      return cursos;
    }

    const filtroLower = filtro.toLowerCase();
    return cursos.filter(curso =>
      curso.nombre.toLowerCase().includes(filtroLower) ||
      curso.descripcion?.toLowerCase().includes(filtroLower) ||
      `${curso.profesor.nombres} ${curso.profesor.apellidos}`.toLowerCase().includes(filtroLower)
    );
  }, [cursos, filtro]);

  // Estadísticas de los cursos
  const estadisticas = useMemo(() => {
    const total = cursos.length;
    return { total };
  }, [cursos]);

  if (cursos.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9] p-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-bold text-[#8D2C1D] mb-2">
            Sin Cursos Asignados
          </h3>
          <p className="text-[#666666] mb-6">
            Este alumno aún no tiene cursos asignados para el período académico actual.
          </p>
          <button
            onClick={onRefresh}
            className="bg-[#8D2C1D] text-white px-6 py-2 rounded-lg hover:bg-[#6D1F14] transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header consolidado con estadísticas, búsqueda, filtros y botones de reporte */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9] p-6">
        <div className="flex flex-col gap-4">
          {/* Título con Total */}
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-[#8D2C1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h2 className="text-2xl font-bold text-[#8D2C1D]">
              Cursos del Alumno
            </h2>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium text-sm">
              Total: {estadisticas.total}
            </span>
          </div>

          {/* Barra de búsqueda y botones */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Buscador */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-[#8D2C1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre del curso o profesor..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border-2 border-[#E9E1C9] rounded-lg focus:border-[#8D2C1D] focus:outline-none transition-colors text-[#333333] placeholder-[#999999] text-sm"
              />
              {filtro && (
                <button
                  onClick={() => setFiltro('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8D2C1D] hover:text-[#6D1F14] transition-colors"
                  title="Limpiar búsqueda"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-2">
              {/* Botón Excel */}
              <button
                onClick={onDescargarExcel}
                disabled={descargandoReporte !== null}
                title="Mini Libreta - Información académica completa"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${descargandoReporte === 'excel'
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
              >
                {descargandoReporte === 'excel' ? (
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                <span>{descargandoReporte === 'excel' ? 'Generando...' : 'Mini Libreta'}</span>
              </button>

              {/* Botón PDF */}
              <button
                onClick={onDescargarPDF}
                disabled={descargandoReporte !== null}
                title="Libreta Completa - Con análisis de rendimiento"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${descargandoReporte === 'pdf'
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
              >
                {descargandoReporte === 'pdf' ? (
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                )}
                <span className="hidden md:inline">{descargandoReporte === 'pdf' ? 'Generando...' : 'Libreta + Estadística'}</span>
                <span className="md:hidden">{descargandoReporte === 'pdf' ? 'Generando...' : 'Libreta PDF'}</span>
              </button>

              {/* Botón Actualizar */}
              <button
                onClick={onRefresh}
                className="flex items-center gap-2 bg-[#8D2C1D] text-white px-4 py-2.5 rounded-lg hover:bg-[#6D1F14] transition-colors text-sm font-medium"
                title="Actualizar cursos"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Actualizar</span>
              </button>
            </div>
          </div>

          {/* Filtros rápidos dinámicos */}
          {cursos.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-[#666666]">Filtros rápidos:</span>
              {cursos.map((curso) => (
                <button
                  key={curso.id}
                  onClick={() => setFiltro(curso.nombre)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filtro.toLowerCase().includes(curso.nombre.toLowerCase())
                    ? 'bg-[#8D2C1D] text-white'
                    : 'bg-[#F7F3E9] text-[#8D2C1D] hover:bg-[#E9E1C9]'
                    }`}
                >
                  {curso.nombre}
                </button>
              ))}
              {filtro && (
                <button
                  onClick={() => setFiltro('')}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
          )}

          {/* Contador de resultados */}
          {filtro && (
            <div className="text-sm text-[#666666]">
              Mostrando {cursosFiltrados.length} de {cursos.length} cursos
            </div>
          )}
        </div>
      </div>

      {/* Lista de cursos */}
      {cursosFiltrados.length === 0 ? (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9] p-8">
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-bold text-[#8D2C1D] mb-2">
              No se encontraron cursos
            </h3>
            <p className="text-[#666666] mb-4">
              No hay cursos que coincidan con tu búsqueda: "{filtro}"
            </p>
            <button
              onClick={() => setFiltro('')}
              className="text-[#8D2C1D] hover:text-[#6D1F14] font-medium"
            >
              Limpiar filtro
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cursosFiltrados.map((curso) => (
            <CursoCard
              key={curso.id}
              curso={curso}
              alumnoId={alumnoId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
