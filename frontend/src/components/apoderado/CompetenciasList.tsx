"use client";

import { useState } from 'react';
import { CompetenciaDetalle } from '@/types/apoderado';
import CompetenciaCard from '@/components/apoderado/CompetenciaCard';

interface CompetenciasListProps {
  competencias: CompetenciaDetalle[];
  onRefresh: () => void;
}

export default function CompetenciasList({ competencias, onRefresh }: CompetenciasListProps) {
  const [competenciaExpandida, setCompetenciaExpandida] = useState<number | null>(null);

  const toggleCompetencia = (competenciaId: number) => {
    setCompetenciaExpandida(prev => prev === competenciaId ? null : competenciaId);
  };

  if (competencias.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9] p-8">
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto mb-4 text-[#8D2C1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-2xl font-bold text-[#8D2C1D] mb-2">
            Sin Competencias Definidas
          </h3>
          <p className="text-[#666666] mb-6">
            Este curso aún no tiene competencias definidas.
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

  // Dividir competencias en dos columnas manualmente
  const mitad = Math.ceil(competencias.length / 2);
  const columna1 = competencias.slice(0, mitad);
  const columna2 = competencias.slice(mitad);

  return (
    <div className="space-y-6">
      {/* Header simple */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#8D2C1D] flex items-center gap-2">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Competencias del Curso
        </h2>
      </div>

      {/* Layout de 2 columnas independientes usando flexbox */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Columna 1 */}
        <div className="flex-1 w-full space-y-6">
          {columna1.map((competencia, index) => (
            <CompetenciaCard
              key={competencia.id}
              competencia={competencia}
              index={index + 1}
              isExpanded={competenciaExpandida === competencia.id}
              onToggle={() => toggleCompetencia(competencia.id)}
            />
          ))}
        </div>

        {/* Columna 2 */}
        {columna2.length > 0 && (
          <div className="flex-1 w-full space-y-6">
            {columna2.map((competencia, index) => (
              <CompetenciaCard
                key={competencia.id}
                competencia={competencia}
                index={mitad + index + 1}
                isExpanded={competenciaExpandida === competencia.id}
                onToggle={() => toggleCompetencia(competencia.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
