"use client";

import SistemaEvaluaciones from '@/components/evaluaciones/SistemaEvaluaciones';
import { datosSimulados } from '@/lib/datosSimulados';

export default function DemoEvaluacionesPage() {
  return (
    <div>
      <SistemaEvaluaciones datos={datosSimulados} />
    </div>
  );
}
