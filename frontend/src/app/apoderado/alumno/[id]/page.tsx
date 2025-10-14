"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
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
        <DashboardHeader 
          title={`${alumno.nombres} ${alumno.apellidos}`}
          userName={user?.nombres ? `${user.nombres} ${user.apellidos}` : user?.email}
          userEmail={user?.email}
          onLogout={() => logout()}
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

          {/* Lista de Cursos */}
          <CursosList 
            cursos={cursos} 
            alumnoId={alumnoId}
            onRefresh={cargarDatosAlumno}
          />
        </main>

        <DashboardFooter />
      </div>
    </ProtectedRoute>
  );
}
