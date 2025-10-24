"use client";

import Link from "next/link";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DirectorSidebar from "@/components/layout/DirectorSidebar";
import GraficosDirector from "@/components/graficos/GraficosDirector";

function DirectorDashboardContent() {
  const [descargandoReporte, setDescargandoReporte] = useState<string | null>(null);

  /**
   * Descarga el reporte de alumnos en riesgo
   */
  const descargarReporteAlumnosRiesgo = async (formato: 'excel' | 'pdf') => {
    try {
      setDescargandoReporte(formato);
      
      const response = await fetch(`/api/reportes/director/alumnos-riesgo?formato=${formato}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': formato === 'excel' 
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      // Obtener el nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `alumnos-riesgo-${new Date().toISOString().split('T')[0]}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
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
      alert(`¡Reporte descargado exitosamente! Archivo: ${filename}`);
      
    } catch (error) {
      console.error('Error al descargar reporte:', error);
      alert(`Error al generar el reporte: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setDescargandoReporte(null);
    }
  };

  return (
    <DirectorSidebar>
      <main className="flex-1 p-8 overflow-auto">
        {/* Header de la página */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold text-[#333333] mb-2" 
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Dashboard Director
          </h1>
          <p className="text-[#666666]">Panel de control y gestión del colegio</p>
        </div>
        {/* Primera fila: 3 cards principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Card: Registrar Profesor */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Profesores</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Registrar nuevos profesores para el colegio.
            </p>
            <Link 
              href="/director/profesores"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-block text-center"
            >
              Registrar Profesor
            </Link>
          </div>

          {/* Card: Registrar Apoderado */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Apoderados</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Registrar padres de familia y apoderados.
            </p>
            <Link 
              href="/director/apoderados"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-block text-center"
            >
              Registrar Apoderado
            </Link>
          </div>

          {/* Card: Gestionar Administrativos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-[#8D2C1D]/10 p-3 rounded-full">
                <svg className="w-6 h-6 text-[#8D2C1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Personal Administrativo</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Gestionar el personal administrativo del colegio.
            </p>
            <Link 
              href="/director/administrativos"
              className="w-full bg-gradient-to-r from-[#8D2C1D] to-[#A0522D] hover:from-[#A0522D] hover:to-[#8D2C1D] text-white font-medium py-2 px-4 rounded-md transition-all duration-200 inline-block text-center"
            >
              Gestionar Administrativos
            </Link>
          </div>

          {/* Card: Registrar Alumnos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Alumnos</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Registrar estudiantes del colegio.
            </p>
            <Link 
              href="/director/alumnos"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-block text-center"
            >
              Registrar Alumno
            </Link>
          </div>

        </div>

        {/* Segunda fila: Cards de gestión */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card: Gestión de Salones */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Salones</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Crear y gestionar salones por niveles educativos autorizados.
            </p>
            <Link 
              href="/director/salones"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-block text-center"
            >
              Gestionar Salones
            </Link>
          </div>

          {/* Card: Alumnos por Salón */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Alumnos por Salón</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Asignar y gestionar alumnos en los salones del colegio.
            </p>
            <Link 
              href="/director/salones/gestion"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-block text-center"
            >
              Gestionar Asignaciones
            </Link>
          </div>

          {/* Card: Períodos Académicos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Períodos Académicos</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Gestionar bimestres, trimestres y semestres del año académico.
            </p>
            <Link 
              href="/director/periodos-academicos"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-block text-center"
            >
              Gestionar Períodos
            </Link>
          </div>

          {/* Card: Asignar Profesores */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-teal-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Asignar Profesores</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Asignar profesores a cursos específicos en los salones del colegio.
            </p>
            <Link 
              href="/director/asignaciones-profesor"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-block text-center"
            >
              Gestionar Asignaciones
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Profesores</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Apoderados</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Administrativos</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-sm text-gray-600">Total Usuarios</div>
          </div>
        </div>

        {/* 🚨 SECCIÓN: REPORTES ACADÉMICOS */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-[#333333] mb-6" style={{ fontFamily: 'var(--font-poppins)' }}>
            Reportes Académicos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card: Alumnos en Riesgo */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-full shadow-md">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">Alumnos en Riesgo</h3>
                  <p className="text-sm text-gray-600">Período Académico Activo</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6 text-sm leading-relaxed">
                Genera un reporte detallado en Excel con los estudiantes que tienen promedio menor a 3.0 en cualquier curso del período académico actual.
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => descargarReporteAlumnosRiesgo('excel')}
                  disabled={descargandoReporte !== null}
                  className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg ${
                    descargandoReporte === 'excel'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                  }`}
                >
                  {descargandoReporte === 'excel' ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generando Excel...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Descargar Excel</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 📊 NUEVA SECCIÓN: GRÁFICOS BI PARA DIRECTOR */}
        <div className="mt-12">
          <GraficosDirector />
        </div>
      </main>
    </DirectorSidebar>
  );
}

export default function DirectorDashboard() {
  return (
    <ProtectedRoute requiredRole={["DIRECTOR", "ADMINISTRATIVO"]}>
      <DirectorDashboardContent />
    </ProtectedRoute>
  );
}
