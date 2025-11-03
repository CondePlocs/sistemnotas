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
  const readonly = searchParams.get('readonly') === 'true';

  const [contexto, setContexto] = useState<ContextoTrabajo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [descargandoReporte, setDescargandoReporte] = useState<'excel' | 'pdf' | null>(null);

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

  /**
   * Descarga la Hoja de Registro en formato Excel
   */
  const descargarHojaRegistroExcel = async () => {
    if (!asignacionId) return;
    
    try {
      setDescargandoReporte('excel');
      
      const response = await fetch(`/api/reportes/profesor/hoja-registro?profesorAsignacionId=${asignacionId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      // Obtener el nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `hoja-trabajo-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Crear blob y descargar
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Mostrar mensaje de éxito
      alert(`✅ ¡Hoja de Registro descargada exitosamente!\nArchivo: ${filename}`);
      
    } catch (error) {
      console.error('Error al descargar hoja de registro:', error);
      alert(`❌ Error al generar la hoja de registro: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setDescargandoReporte(null);
    }
  };

  /**
   * Descarga el Informe de Intervención Temprana en formato PDF
   */
  const descargarInformeIntervencionPDF = async () => {
    if (!asignacionId) return;
    
    try {
      setDescargandoReporte('pdf');
      
      const response = await fetch(`/api/reportes/profesor/intervencion-temprana?profesorAsignacionId=${asignacionId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/pdf'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      // Obtener el nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `informe-intervencion-${new Date().toISOString().split('T')[0]}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Crear blob y descargar
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Mostrar mensaje de éxito
      alert(`✅ ¡Informe de Intervención descargado exitosamente!\nArchivo: ${filename}`);
      
    } catch (error) {
      console.error('Error al descargar informe de intervención:', error);
      alert(`❌ Error al generar el informe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setDescargandoReporte(null);
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


        {/* Contenido principal - Ancho completo */}
        <div className="flex-1 px-2 sm:px-4 lg:px-6 py-4">
          {/* Título Principal con Botones de Reportes */}
          <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#8D2C1D] mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>
                📚 Gestión de Evaluaciones
              </h1>
              <p className="text-lg text-[#666666]">
                Administra las evaluaciones de tus estudiantes y descarga reportes de trabajo
              </p>
            </div>
            
            {/* Botones de Reportes - Horizontales y Compactos */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#666666] mr-2">Reportes:</span>
              
              {/* Botón Excel - Compacto */}
              <button
                onClick={descargarHojaRegistroExcel}
                disabled={descargandoReporte !== null}
                className={`group relative overflow-hidden rounded-lg px-4 py-2.5 transition-all duration-300 transform hover:scale-105 ${
                  descargandoReporte === 'excel'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg'
                }`}
              >
                <div className="relative z-10 flex items-center space-x-2">
                  <div className="bg-white/20 p-1.5 rounded backdrop-blur-sm">
                    {descargandoReporte === 'excel' ? (
                      <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-bold text-white">
                    {descargandoReporte === 'excel' ? 'Generando...' : 'Excel'}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>

              {/* Botón PDF - Compacto */}
              <button
                onClick={descargarInformeIntervencionPDF}
                disabled={descargandoReporte !== null}
                className={`group relative overflow-hidden rounded-lg px-4 py-2.5 transition-all duration-300 transform hover:scale-105 ${
                  descargandoReporte === 'pdf'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-md hover:shadow-lg'
                }`}
              >
                <div className="relative z-10 flex items-center space-x-2">
                  <div className="bg-white/20 p-1.5 rounded backdrop-blur-sm">
                    {descargandoReporte === 'pdf' ? (
                      <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-bold text-white">
                    {descargandoReporte === 'pdf' ? 'Generando...' : 'PDF'}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </div>
          </div>

          {/* Contenido principal - Sistema de Evaluaciones con ancho completo */}
          <div className="w-full">
            <SistemaEvaluaciones
              contexto={contexto}
              onCrearEvaluacion={handleCrearEvaluacion}
              asignacionId={parseInt(asignacionId!)}
              periodoId={parseInt(periodoId!)}
              readonly={readonly}
            />
          </div>
        </div>

        {/* Footer Reutilizable */}
        <DashboardFooter />
      </div>
    </ProtectedRoute>
  );
}
