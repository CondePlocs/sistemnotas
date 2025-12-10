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

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `alumnos-riesgo-${new Date().toISOString().split('T')[0]}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

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
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        {/* Header de la página con botón de reporte */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1
              className="text-3xl font-bold text-[#8D2C1D] mb-2"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Dashboard Director
            </h1>
            <p className="text-[#666666]">Panel de control y gestión del colegio</p>
          </div>

          {/* Botón Reportes en el header */}
          <button
            onClick={() => descargarReporteAlumnosRiesgo('excel')}
            disabled={descargandoReporte !== null}
            className={`flex items-center gap-2 font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base self-end sm:self-auto ${descargandoReporte === 'excel'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#8D2C1D] to-[#D96924] hover:from-[#A0522D] hover:to-[#8D2C1D] text-white'
              }`}
          >
            {descargandoReporte === 'excel' ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generando...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Alumnos en Riesgo (Excel)</span>
              </>
            )}
          </button>
        </div>

        {/* 📊 SECCIÓN: GRÁFICOS BI PARA DIRECTOR */}
        <div className="mb-8">
          <GraficosDirector />
        </div>

        {/* 🎯 SECCIÓN: ACCIONES RÁPIDAS - Solo botones */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#8D2C1D] mb-4" style={{ fontFamily: 'var(--font-poppins)' }}>
            Acciones Rápidas
          </h2>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/director/profesores"
              className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] hover:from-[#A0522D] hover:to-[#8D2C1D] text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Profesores
            </Link>
            <Link
              href="/director/apoderados"
              className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] hover:from-[#A0522D] hover:to-[#8D2C1D] text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Apoderados
            </Link>
            <Link
              href="/director/administrativos"
              className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] hover:from-[#A0522D] hover:to-[#8D2C1D] text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Admin
            </Link>
            <Link
              href="/director/alumnos"
              className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] hover:from-[#A0522D] hover:to-[#8D2C1D] text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Alumnos
            </Link>
            <Link
              href="/director/salones"
              className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] hover:from-[#A0522D] hover:to-[#8D2C1D] text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Salones
            </Link>
            <Link
              href="/director/salones/gestion"
              className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] hover:from-[#A0522D] hover:to-[#8D2C1D] text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Asignar Alumnos
            </Link>
            <Link
              href="/director/periodos-academicos"
              className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] hover:from-[#A0522D] hover:to-[#8D2C1D] text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Períodos
            </Link>
            <Link
              href="/director/asignaciones-profesor"
              className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] hover:from-[#A0522D] hover:to-[#8D2C1D] text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Asignar Profesores
            </Link>
          </div>
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