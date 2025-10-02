"use client";

import { useState, useEffect } from 'react';
import { ContextoTrabajo, CreateEvaluacionDto, Evaluacion } from '@/types/evaluaciones';
import TablaEvaluaciones from './TablaEvaluaciones';
import VistaMobile from './VistaMobile';

interface SistemaEvaluacionesProps {
  contexto: ContextoTrabajo;
  onCrearEvaluacion: (data: CreateEvaluacionDto) => Promise<Evaluacion>;
  asignacionId: number;
  periodoId: number;
}

export default function SistemaEvaluaciones({ 
  contexto, 
  onCrearEvaluacion,
  asignacionId,
  periodoId
}: SistemaEvaluacionesProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {isMobile ? (
        <VistaMobile 
          contexto={contexto}
          onCrearEvaluacion={onCrearEvaluacion}
          asignacionId={asignacionId}
          periodoId={periodoId}
        />
      ) : (
        <TablaEvaluaciones 
          contexto={contexto}
          onCrearEvaluacion={onCrearEvaluacion}
          asignacionId={asignacionId}
          periodoId={periodoId}
        />
      )}
    </div>
  );
}
