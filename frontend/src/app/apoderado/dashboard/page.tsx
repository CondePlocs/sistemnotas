"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import SimpleHeader from '@/components/layout/SimpleHeader';
import FiltroAlumnos from '@/components/apoderado/FiltroAlumnos';
import ListadoAlumnos from '@/components/apoderado/ListadoAlumnos';
import { apoderadoAPI } from '@/lib/api/apoderado';
import { AlumnoApoderado } from '@/types/apoderado';

export default function ApoderadoDashboard() {
  const { user, logout } = useAuth();
  const [alumnos, setAlumnos] = useState<AlumnoApoderado[]>([]);
  const [alumnosFiltrados, setAlumnosFiltrados] = useState<AlumnoApoderado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    cargarAlumnos();
  }, []);

  useEffect(() => {
    filtrarAlumnos();
  }, [alumnos, filtro]);

  const cargarAlumnos = async () => {
    try {
      setLoading(true);
      setError(null);
      const alumnosData = await apoderadoAPI.obtenerMisAlumnos();
      setAlumnos(alumnosData);
    } catch (error) {
      console.error('Error cargando alumnos:', error);
      setError('Error al cargar los alumnos');
    } finally {
      setLoading(false);
    }
  };

  const filtrarAlumnos = () => {
    if (!filtro.trim()) {
      setAlumnosFiltrados(alumnos);
      return;
    }

    const filtroLower = filtro.toLowerCase();
    const filtrados = alumnos.filter(alumno =>
      alumno.nombres.toLowerCase().includes(filtroLower) ||
      alumno.apellidos.toLowerCase().includes(filtroLower) ||
      alumno.salon?.grado.toLowerCase().includes(filtroLower) ||
      alumno.salon?.seccion.toLowerCase().includes(filtroLower) ||
      alumno.salon?.colegioNivel?.nivel?.nombre.toLowerCase().includes(filtroLower)
    );
    setAlumnosFiltrados(filtrados);
  };

  const handleFiltroChange = (nuevoFiltro: string) => {
    setFiltro(nuevoFiltro);
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="APODERADO">
        <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9] flex flex-col">
          <SimpleHeader
            title="Dashboard del Apoderado"
            showBackButton={false}
            showForwardButton={true}
            dashboardPath="/apoderado/dashboard"
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center bg-white/95 backdrop-blur-sm rounded-xl p-8 shadow-lg border-2 border-[#E9E1C9]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D] mx-auto"></div>
              <p className="mt-4 text-[#666666] font-medium">Cargando información de sus hijos...</p>
            </div>
          </div>

        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRole="APODERADO">
        <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9] flex flex-col">
          <SimpleHeader
            title="Dashboard del Apoderado"
            showBackButton={false}
            showForwardButton={true}
            dashboardPath="/apoderado/dashboard"
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center bg-white/95 backdrop-blur-sm rounded-xl p-8 shadow-lg border-2 border-red-200">
              <div className="text-red-600 mb-4 text-lg">⚠️ Error</div>
              <p className="text-red-700 mb-6 font-medium">{error}</p>
              <button
                onClick={cargarAlumnos}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="APODERADO">
      <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9] flex flex-col">
        {/* Header Simple */}
        <SimpleHeader
          title="Dashboard del Apoderado"
          showBackButton={false}
          showForwardButton={true}
          dashboardPath="/apoderado/dashboard"
        />

        {/* Contenido principal */}
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Bienvenida */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#333333] mb-2 flex items-center gap-3">
              <svg className="w-8 h-8 text-[#8D2C1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
              ¡Bienvenido, {user?.nombres}!
            </h1>
            <p className="text-[#666666] text-lg">
              Aquí puedes ver el progreso académico de {alumnos.length === 1 ? 'tu hijo' : 'tus hijos'}
            </p>
          </div>

          {/* Estadísticas rápidas - Una sola fila en móvil */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 sm:p-6 border-2 border-[#E9E1C9] hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-[#8D2C1D] to-[#D96924] p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-md mb-2">
                  <svg className="h-4 w-4 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#666666] leading-tight mb-1">Estudiantes a su Cargo</p>
                <p className="text-lg sm:text-2xl font-bold text-[#8D2C1D]">{alumnos.length}</p>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 sm:p-6 border-2 border-[#E9E1C9] hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-[#8D2C1D] to-[#D96924] p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-md mb-2">
                  <svg className="h-4 w-4 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#666666] leading-tight mb-1">Niveles Educativos</p>
                <p className="text-lg sm:text-2xl font-bold text-[#8D2C1D]">
                  {new Set(alumnos.map(a => a.salon?.colegioNivel?.nivel?.nombre)).size}
                </p>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 sm:p-6 border-2 border-[#E9E1C9] hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-[#8D2C1D] to-[#D96924] p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-md mb-2">
                  <svg className="h-4 w-4 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#666666] leading-tight mb-1">Estudiantes Activos</p>
                <p className="text-lg sm:text-2xl font-bold text-[#8D2C1D]">
                  {alumnos.filter(a => a.activo).length}
                </p>
              </div>
            </div>
          </div>

          {/* Filtro de búsqueda */}
          <FiltroAlumnos
            filtro={filtro}
            onFiltroChange={handleFiltroChange}
            totalAlumnos={alumnos.length}
            alumnosFiltrados={alumnosFiltrados.length}
          />

          {/* Listado de alumnos */}
          <ListadoAlumnos
            alumnos={alumnosFiltrados}
            loading={loading}
          />
        </div>


      </div>
    </ProtectedRoute>
  );
}
