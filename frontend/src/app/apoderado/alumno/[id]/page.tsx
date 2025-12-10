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

          {/* Información del Alumno */}
          <AlumnoInfo alumno={alumno} />


          {/* Lista de Cursos */}
          <CursosList
            cursos={cursos}
            alumnoId={alumnoId}
            onRefresh={cargarDatosAlumno}
            alumnoNombre={`${alumno.nombres} ${alumno.apellidos}`}
            onDescargarExcel={descargarMiniLibretaExcel}
            onDescargarPDF={descargarMiniLibretaCompletaPDF}
            descargandoReporte={descargandoReporte}
          />
        </main>

      </div>
    </ProtectedRoute>
  );
}
