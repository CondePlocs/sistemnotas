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

  // Estadísticas generales
  const totalEvaluaciones = competencias.reduce((total, comp) => total + comp.evaluaciones.length, 0);
  const evaluacionesConNota = competencias.reduce((total, comp) => 
    total + comp.evaluaciones.filter(evaluacion => evaluacion.nota).length, 0
  );

  if (competencias.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9] p-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
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

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9] p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#8D2C1D] mb-2">
              📋 Competencias y Evaluaciones
            </h2>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                Competencias: {competencias.length}
              </span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                Total Evaluaciones: {totalEvaluaciones}
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                Con Nota: {evaluacionesConNota}
              </span>
              {(totalEvaluaciones - evaluacionesConNota) > 0 && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                  Pendientes: {totalEvaluaciones - evaluacionesConNota}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Progreso general */}
            <div className="text-right">
              <div className="text-sm font-medium text-[#666666]">Progreso General</div>
              <div className="text-lg font-bold text-[#8D2C1D]">
                {totalEvaluaciones > 0 ? Math.round((evaluacionesConNota / totalEvaluaciones) * 100) : 0}%
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

        {/* Barra de progreso general */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${totalEvaluaciones > 0 ? (evaluacionesConNota / totalEvaluaciones) * 100 : 0}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Lista de competencias */}
      <div className="space-y-4">
        {competencias.map((competencia, index) => (
          <CompetenciaCard
            key={competencia.id}
            competencia={competencia}
            index={index + 1}
            isExpanded={competenciaExpandida === competencia.id}
            onToggle={() => toggleCompetencia(competencia.id)}
          />
        ))}
      </div>

      {/* Consejos para padres */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="text-lg font-bold text-blue-800 mb-2">
              Consejos para Apoyar el Aprendizaje
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>AD (Logro Destacado):</strong> El estudiante supera las expectativas</li>
              <li>• <strong>A (Logro Esperado):</strong> El estudiante alcanza los objetivos</li>
              <li>• <strong>B (En Proceso):</strong> El estudiante está desarrollando la competencia</li>
              <li>• <strong>C (En Inicio):</strong> El estudiante necesita apoyo adicional</li>
            </ul>
            <p className="text-xs text-blue-600 mt-3 italic">
              Recuerda que cada evaluación es una oportunidad de aprendizaje. 
              Si tienes dudas, no dudes en contactar al profesor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
