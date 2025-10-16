"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import SimpleHeader from '@/components/layout/SimpleHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
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

  const calcularPromedioGeneral = () => {
    if (!curso?.competencias.length) return null;

    const notasValidas = curso.competencias
      .flatMap(comp => comp.evaluaciones)
      .map(evaluacion => evaluacion.nota)
      .filter(nota => nota !== null && nota !== undefined);

    if (notasValidas.length === 0) return null;

    // Convertir notas a números para calcular promedio
    const valores = notasValidas.map(nota => {
      switch (nota) {
        case 'AD': return 4;
        case 'A': return 3;
        case 'B': return 2;
        case 'C': return 1;
        default: return 0;
      }
    });

    const promedio = valores.reduce((sum: number, val: number) => sum + val, 0) / valores.length;
    
    // Convertir de vuelta a escala literal
    if (promedio >= 3.5) return 'AD';
    if (promedio >= 2.5) return 'A';
    if (promedio >= 1.5) return 'B';
    return 'C';
  };

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
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-[#8D2C1D] mb-2">
              {error || 'Curso no encontrado'}
            </h2>
            <button
              onClick={handleVolver}
              className="bg-[#8D2C1D] text-white px-6 py-2 rounded-lg hover:bg-[#6D1F14] transition-colors"
            >
              Volver al Alumno
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
          {/* Botón Volver */}
          <div className="mb-6">
            <button
              onClick={handleVolver}
              className="flex items-center text-[#8D2C1D] hover:text-[#6D1F14] transition-colors font-medium"
            >
              <span className="mr-2">←</span>
              Volver al Alumno
            </button>
          </div>

          {/* Información del Curso */}
          <CursoInfo 
            curso={curso} 
            promedioGeneral={calcularPromedioGeneral()}
          />

          {/* Lista de Competencias */}
          <CompetenciasList 
            competencias={curso.competencias}
            onRefresh={cargarDetalleCurso}
          />
        </main>

        <DashboardFooter />
      </div>
    </ProtectedRoute>
  );
}
