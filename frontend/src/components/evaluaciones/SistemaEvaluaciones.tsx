"use client";

import { useState, useEffect } from 'react';
import { DatosEvaluacion } from '@/types/evaluaciones';
import TablaEvaluaciones from './TablaEvaluaciones';
import VistaMobile from './VistaMobile';

interface SistemaEvaluacionesProps {
  datos: DatosEvaluacion;
}

export default function SistemaEvaluaciones({ datos }: SistemaEvaluacionesProps) {
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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {isMobile ? (
          <VistaMobile datos={datos} />
        ) : (
          <TablaEvaluaciones datos={datos} />
        )}
      </div>
    </div>
  );
}
