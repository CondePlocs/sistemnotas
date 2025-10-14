"use client";

import { useState, useMemo } from 'react';
import { CursoAlumno } from '@/types/apoderado';
import CursoCard from './CursoCard';
import FiltroCursos from './FiltroCursos';

interface CursosListProps {
  cursos: CursoAlumno[];
  alumnoId: number;
  onRefresh: () => void;
}

export default function CursosList({ cursos, alumnoId, onRefresh }: CursosListProps) {
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
    const conPromedio = cursos.filter(curso => curso.promedioFinal).length;
    const sinPromedio = total - conPromedio;

    return { total, conPromedio, sinPromedio };
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
      {/* Header con estadísticas */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9] p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#8D2C1D] mb-2">
              📚 Cursos del Alumno
            </h2>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                Total: {estadisticas.total}
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                Con promedio: {estadisticas.conPromedio}
              </span>
              {estadisticas.sinPromedio > 0 && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                  Sin promedio: {estadisticas.sinPromedio}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onRefresh}
            className="flex items-center gap-2 bg-[#8D2C1D] text-white px-4 py-2 rounded-lg hover:bg-[#6D1F14] transition-colors"
          >
            <span>🔄</span>
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtro de cursos */}
      <FiltroCursos 
        filtro={filtro}
        onFiltroChange={setFiltro}
        totalCursos={cursos.length}
        cursosFiltrados={cursosFiltrados.length}
      />

      {/* Lista de cursos */}
      {cursosFiltrados.length === 0 ? (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9] p-8">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
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
