"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import SimpleHeader from '@/components/layout/SimpleHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { ContextoTrabajo, CreateEvaluacionDto, Evaluacion } from '@/types/evaluaciones';
import { evaluacionesAPI } from '@/lib/api/evaluaciones';
import SistemaEvaluaciones from '@/components/evaluaciones/SistemaEvaluaciones';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ProfesorEvaluacionesPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const asignacionId = searchParams.get('asignacionId');
  const periodoId = searchParams.get('periodoId');

  const [contexto, setContexto] = useState<ContextoTrabajo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (asignacionId && periodoId) {
      cargarContextoTrabajo();
    } else {
      setError('Parámetros de asignación o período no válidos');
      setLoading(false);
    }
  }, [asignacionId, periodoId]);

  const cargarContextoTrabajo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const contextoData = await evaluacionesAPI.obtenerContextoTrabajo(
        parseInt(asignacionId!),
        parseInt(periodoId!)
      );
      
      setContexto(contextoData);
    } catch (error) {
      console.error('Error cargando contexto de trabajo:', error);
      setError('Error al cargar los datos de evaluación');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearEvaluacion = async (data: CreateEvaluacionDto): Promise<Evaluacion> => {
    try {
      const nuevaEvaluacion = await evaluacionesAPI.crearEvaluacion(data);
      
      // Recargar el contexto para mostrar la nueva evaluación
      await cargarContextoTrabajo();
      
      return nuevaEvaluacion;
    } catch (error) {
      console.error('Error creando evaluación:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="PROFESOR">
        <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9] flex flex-col">
          <SimpleHeader 
            title="Registro de Evaluaciones"
            showBackButton={true}
            dashboardPath="/profesor/dashboard"
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center bg-white/95 backdrop-blur-sm rounded-xl p-8 shadow-lg border-2 border-[#E9E1C9]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D] mx-auto"></div>
              <p className="mt-4 text-[#666666] font-medium">Cargando datos de evaluación...</p>
            </div>
          </div>
          <DashboardFooter />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRole="PROFESOR">
        <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9] flex flex-col">
          <SimpleHeader 
            title="Registro de Evaluaciones"
            showBackButton={true}
            dashboardPath="/profesor/dashboard"
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center bg-white/95 backdrop-blur-sm rounded-xl p-8 shadow-lg border-2 border-red-200">
              <div className="text-red-600 mb-4 text-lg">⚠️ Error</div>
              <p className="text-red-700 mb-6 font-medium">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cargarContextoTrabajo}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  Reintentar
                </button>
                <Link
                  href="/profesor/dashboard"
                  className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] hover:from-[#7A2518] hover:to-[#C55A1F] text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-center"
                >
                  Volver al Dashboard
                </Link>
              </div>
            </div>
          </div>
          <DashboardFooter />
        </div>
      </ProtectedRoute>
    );
  }

  if (!contexto) {
    return (
      <ProtectedRoute requiredRole="PROFESOR">
        <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9] flex flex-col">
          <SimpleHeader 
            title="Registro de Evaluaciones"
            showBackButton={true}
            dashboardPath="/profesor/dashboard"
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center bg-white/95 backdrop-blur-sm rounded-xl p-8 shadow-lg border-2 border-[#E9E1C9]">
              <p className="text-[#666666] mb-6 font-medium">No se pudo cargar el contexto de trabajo</p>
              <Link
                href="/profesor/dashboard"
                className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] hover:from-[#7A2518] hover:to-[#C55A1F] text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                Volver al Dashboard
              </Link>
            </div>
          </div>
          <DashboardFooter />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="PROFESOR">
      <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9] flex flex-col">
        {/* Header Simple */}
        <SimpleHeader 
          title={contexto ? `Evaluaciones: ${contexto.asignacion.curso}` : 'Registro de Evaluaciones'}
          showBackButton={true}
          dashboardPath="/profesor/dashboard"
        />


        {/* Contenido principal */}
        <div className="flex-1 p-4 sm:p-6">
          {/* Navegación ya incluida en SimpleHeader */}

          <SistemaEvaluaciones
            contexto={contexto}
            onCrearEvaluacion={handleCrearEvaluacion}
            asignacionId={parseInt(asignacionId!)}
            periodoId={parseInt(periodoId!)}
          />
        </div>

        {/* Footer Reutilizable */}
        <DashboardFooter />
      </div>
    </ProtectedRoute>
  );
}
