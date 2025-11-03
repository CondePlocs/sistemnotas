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
  readonly?: boolean;
}

export default function SistemaEvaluaciones({ 
  contexto, 
  onCrearEvaluacion,
  asignacionId,
  periodoId,
  readonly = false
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
    <div className="w-full">
      {isMobile ? (
        <VistaMobile 
          contexto={contexto}
          onCrearEvaluacion={onCrearEvaluacion}
          asignacionId={asignacionId}
          periodoId={periodoId}
          readonly={readonly}
        />
      ) : (
        <TablaEvaluaciones 
          contexto={contexto}
          onCrearEvaluacion={onCrearEvaluacion}
          asignacionId={asignacionId}
          periodoId={periodoId}
          readonly={readonly}
        />
      )}
    </div>
  );
}
