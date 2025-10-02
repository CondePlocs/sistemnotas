"use client";

import { useState, useEffect } from 'react';
import { ContextoTrabajo, CreateEvaluacionDto, Evaluacion } from '@/types/evaluaciones';
import TablaEvaluacionesReal from './TablaEvaluacionesReal';
import VistaMobileReal from './VistaMobileReal';

interface SistemaEvaluacionesRealProps {
  contexto: ContextoTrabajo;
  onCrearEvaluacion: (data: CreateEvaluacionDto) => Promise<Evaluacion>;
  asignacionId: number;
  periodoId: number;
}

export default function SistemaEvaluacionesReal({ 
  contexto, 
  onCrearEvaluacion,
  asignacionId,
  periodoId
}: SistemaEvaluacionesRealProps) {
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
        <VistaMobileReal 
          contexto={contexto}
          onCrearEvaluacion={onCrearEvaluacion}
          asignacionId={asignacionId}
          periodoId={periodoId}
        />
      ) : (
        <TablaEvaluacionesReal 
          contexto={contexto}
          onCrearEvaluacion={onCrearEvaluacion}
          asignacionId={asignacionId}
          periodoId={periodoId}
        />
      )}
    </div>
  );
}
