"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import SimpleHeader from '@/components/layout/SimpleHeader';
import AlumnoInfo from '@/components/apoderado/AlumnoInfo';
import CursosList from '@/components/apoderado/CursosList';
import { apoderadoAPI } from '@/lib/api/apoderado';
import { AlumnoApoderado, CursoAlumno } from '@/types/apoderado';

export default function AlumnoDetalle() {
  const { user, logout } = useAuth();
  const params = useParams();
  const router = useRouter();
  const alumnoId = parseInt(params.id as string);

  const [alumno, setAlumno] = useState<AlumnoApoderado | null>(null);
  const [cursos, setCursos] = useState<CursoAlumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [descargandoReporte, setDescargandoReporte] = useState<'excel' | 'pdf' | null>(null);

  useEffect(() => {
    if (alumnoId) {
      cargarDatosAlumno();
    }
  }, [alumnoId]);

  const cargarDatosAlumno = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar información del alumno y sus cursos en paralelo
      const [alumnosData, cursosData] = await Promise.all([
        apoderadoAPI.obtenerMisAlumnos(),
        apoderadoAPI.obtenerCursosAlumno(alumnoId)
      ]);

      // Buscar el alumno específico
      const alumnoEncontrado = alumnosData.find(a => a.id === alumnoId);
      
      if (!alumnoEncontrado) {
        setError('Alumno no encontrado o no tienes permisos para verlo');
        return;
      }

      setAlumno(alumnoEncontrado);
      setCursos(cursosData);
    } catch (error) {
      console.error('Error cargando datos del alumno:', error);
      setError('Error al cargar la información del alumno');
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    router.push('/apoderado/dashboard');
  };

  /**
   * Descarga la Mini Libreta en formato Excel
   */
  const descargarMiniLibretaExcel = async () => {
    if (!alumnoId) return;
    
    try {
      setDescargandoReporte('excel');
      
      const response = await fetch(`/api/reportes/padre/mini-libreta?alumnoId=${alumnoId}`, {
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
      let filename = `mini-libreta-${alumno?.nombres}-${alumno?.apellidos}-${new Date().toISOString().split('T')[0]}.xlsx`;
      
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
      alert(`✅ ¡Mini Libreta descargada exitosamente!\nArchivo: ${filename}`);
      
    } catch (error) {
      console.error('Error al descargar mini libreta:', error);
      alert(`❌ Error al generar la mini libreta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setDescargandoReporte(null);
    }
  };

  /**
   * Descarga la Mini Libreta Completa en formato PDF
   */
  const descargarMiniLibretaCompletaPDF = async () => {
    if (!alumnoId) return;
    
    try {
      setDescargandoReporte('pdf');
      
      const response = await fetch(`/api/reportes/padre/mini-libreta-completa?alumnoId=${alumnoId}`, {
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
      let filename = `mini-libreta-completa-${alumno?.nombres}-${alumno?.apellidos}-${new Date().toISOString().split('T')[0]}.pdf`;
      
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
      alert(`✅ ¡Mini Libreta Completa descargada exitosamente!\nArchivo: ${filename}`);
      
    } catch (error) {
      console.error('Error al descargar mini libreta completa:', error);
      alert(`❌ Error al generar la mini libreta completa: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setDescargandoReporte(null);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole={['APODERADO']}>
        <div className="min-h-screen bg-gradient-to-br from-[#F7F3E9] to-[#E9E1C9] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D] mx-auto mb-4"></div>
            <p className="text-[#8D2C1D] font-medium">Cargando información del alumno...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !alumno) {
    return (
      <ProtectedRoute requiredRole={['APODERADO']}>
        <div className="min-h-screen bg-gradient-to-br from-[#F7F3E9] to-[#E9E1C9] flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-bold text-[#8D2C1D] mb-2">
              {error || 'Alumno no encontrado'}
            </h2>
            <button
              onClick={handleVolver}
              className="bg-[#8D2C1D] text-white px-6 py-2 rounded-lg hover:bg-[#6D1F14] transition-colors"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole={['APODERADO']}>
      <div className="min-h-screen bg-gradient-to-br from-[#F7F3E9] to-[#E9E1C9]">
        {/* Header Simple */}
        <SimpleHeader 
          title={alumno ? `Alumno: ${alumno.nombres} ${alumno.apellidos}` : 'Información del Alumno'}
          showBackButton={true}
          dashboardPath="/apoderado/dashboard"
        />
        
        <main className="container mx-auto px-4 py-8">
          {/* Botón Volver */}
          <div className="mb-6">
            <button
              onClick={handleVolver}
              className="flex items-center text-[#8D2C1D] hover:text-[#6D1F14] transition-colors font-medium"
            >
              <span className="mr-2">←</span>
              Volver al Dashboard
            </button>
          </div>

          {/* Información del Alumno */}
          <AlumnoInfo alumno={alumno} />

          {/* 📊 SECCIÓN: REPORTES ACADÉMICOS */}
          <div className="mb-8 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#E9E1C9] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] p-3 rounded-lg shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#333333]" style={{ fontFamily: 'var(--font-poppins)' }}>
                    Reportes Académicos
                  </h2>
                  <p className="text-sm text-[#666666]">
                    Descarga los reportes académicos de {alumno.nombres}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Botón: Mini Libreta Excel */}
              <button
                onClick={descargarMiniLibretaExcel}
                disabled={descargandoReporte !== null}
                className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 transform hover:scale-105 ${
                  descargandoReporte === 'excel'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                      {descargandoReporte === 'excel' ? (
                        <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {descargandoReporte === 'excel' ? 'Generando...' : 'Mini Libreta'}
                      </h3>
                      <p className="text-sm text-white/90">
                        Formato Excel (.xlsx)
                      </p>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-white/80 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>

              {/* Botón: Mini Libreta Completa PDF */}
              <button
                onClick={descargarMiniLibretaCompletaPDF}
                disabled={descargandoReporte !== null}
                className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 transform hover:scale-105 ${
                  descargandoReporte === 'pdf'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                      {descargandoReporte === 'pdf' ? (
                        <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {descargandoReporte === 'pdf' ? 'Generando...' : 'Libreta Completa'}
                      </h3>
                      <p className="text-sm text-white/90">
                        Formato PDF (.pdf)
                      </p>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-white/80 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </div>

            {/* Descripción de los reportes */}
            <div className="mt-6 pt-4 border-t border-[#E9E1C9]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#666666]">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>
                    <strong className="text-[#333333]">Mini Libreta:</strong> Información académica completa con cursos, competencias, evaluaciones y notas del estudiante
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>
                    <strong className="text-[#333333]">Libreta Completa:</strong> Mini libreta + análisis de rendimiento con top 3 mejores y peores cursos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Cursos */}
          <CursosList 
            cursos={cursos} 
            alumnoId={alumnoId}
            onRefresh={cargarDatosAlumno}
          />
        </main>

      </div>
    </ProtectedRoute>
  );
}
