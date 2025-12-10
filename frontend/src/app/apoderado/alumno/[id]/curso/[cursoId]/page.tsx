"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import SimpleHeader from '@/components/layout/SimpleHeader';
import CursoInfo from '@/components/apoderado/CursoInfo';
import CompetenciasList from '@/components/apoderado/CompetenciasList';
import { apoderadoAPI } from '@/lib/api/apoderado';
import type { CursoDetalle } from '@/types/apoderado';

export default function CursoDetalle() {
  const { user, logout } = useAuth();
  const params = useParams();
  const router = useRouter();
  const alumnoId = parseInt(params.id as string);
  const cursoId = parseInt(params.cursoId as string);

  const [curso, setCurso] = useState<CursoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (alumnoId && cursoId) {
      cargarDetalleCurso();
    }
  }, [alumnoId, cursoId]);

  const cargarDetalleCurso = async () => {
    try {
      setLoading(true);
      setError(null);

      const cursoData = await apoderadoAPI.obtenerDetalleCursoAlumno(alumnoId, cursoId);
      setCurso(cursoData);
    } catch (error) {
      console.error('Error cargando detalle del curso:', error);
      setError('Error al cargar la información del curso');
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    router.push(`/apoderado/alumno/${alumnoId}`);
  };

  // Ya no necesitamos calcular el promedio manualmente
  // El backend lo calcula usando NotaCalculoService con la refactorización de notas mixtas

  if (loading) {
    return (
      <ProtectedRoute requiredRole={['APODERADO']}>
        <div className="min-h-screen bg-gradient-to-br from-[#F7F3E9] to-[#E9E1C9] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D] mx-auto mb-4"></div>
            <p className="text-[#8D2C1D] font-medium">Cargando detalle del curso...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !curso) {
    return (
      <ProtectedRoute requiredRole={['APODERADO']}>
        <div className="min-h-screen bg-gradient-to-br from-[#F7F3E9] to-[#E9E1C9] flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-[#8D2C1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h2 className="text-2xl font-bold text-[#8D2C1D] mb-2">
              {error || 'Curso no encontrado'}
            </h2>
            <button
              onClick={handleVolver}
              className="bg-[#8D2C1D] text-white px-6 py-2 rounded-lg hover:bg-[#6D1F14] transition-colors"
            >
              Volver
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
          title={curso?.nombre ? `Curso: ${curso.nombre}` : 'Detalle del Curso'}
          showBackButton={true}
          dashboardPath="/apoderado/dashboard"
        />

        <main className="container mx-auto px-4 py-8">
          {/* Información del Curso */}
          <CursoInfo
            curso={curso}
            promedioGeneral={curso.promedioGeneral}
          />

          {/* Lista de Competencias */}
          <CompetenciasList
            competencias={curso.competencias}
            onRefresh={cargarDetalleCurso}
          />
        </main>

      </div>
    </ProtectedRoute>
  );
}
