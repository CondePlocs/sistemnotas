"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ContextoTrabajo, CreateEvaluacionDto, Evaluacion } from '@/types/evaluaciones';
import { evaluacionesAPI } from '@/lib/api/evaluaciones';
import SistemaEvaluacionesReal from '@/components/evaluaciones/SistemaEvaluacionesReal';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ProfesorEvaluacionesPage() {
  const { user } = useAuth();
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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos de evaluación...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRole="PROFESOR">
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">⚠️ Error</div>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="space-x-4">
              <button
                onClick={cargarContextoTrabajo}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
              <Link
                href="/profesor/dashboard"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors inline-block"
              >
                Volver al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!contexto) {
    return (
      <ProtectedRoute requiredRole="PROFESOR">
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">No se pudo cargar el contexto de trabajo</p>
            <Link
              href="/profesor/dashboard"
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="PROFESOR">
      <div className="min-h-screen bg-gray-100">
        {/* Header con navegación */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Link
                    href="/profesor/dashboard"
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Volver al Dashboard
                  </Link>
                  <div className="h-6 border-l border-gray-300"></div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      Registro de Evaluaciones
                    </h1>
                    <p className="text-sm text-gray-600">
                      {contexto.asignacion.curso} - {contexto.asignacion.salon} | {contexto.periodo.nombre}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-4">
          <SistemaEvaluacionesReal
            contexto={contexto}
            onCrearEvaluacion={handleCrearEvaluacion}
            asignacionId={parseInt(asignacionId!)}
            periodoId={parseInt(periodoId!)}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
