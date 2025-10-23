'use client';

import { useState, useEffect } from 'react';
import { EstadisticasAPI } from '@/lib/api/estadisticas';
import { DistribucionLogrosResponse, CursosProblemaResponse } from '@/types/estadisticas';
import DistribucionLogros from './DistribucionLogros';
import CursosProblema from './CursosProblema';

interface GraficosOwnerProps {
  className?: string;
}

export default function GraficosOwner({ className = '' }: GraficosOwnerProps) {
  const [distribucionData, setDistribucionData] = useState<DistribucionLogrosResponse | null>(null);
  const [cursosData, setCursosData] = useState<CursosProblemaResponse | null>(null);
  const [isLoadingDistribucion, setIsLoadingDistribucion] = useState(true);
  const [isLoadingCursos, setIsLoadingCursos] = useState(true);
  const [errorDistribucion, setErrorDistribucion] = useState<string | null>(null);
  const [errorCursos, setErrorCursos] = useState<string | null>(null);

  // Cargar datos de distribución de logros
  useEffect(() => {
    const cargarDistribucionLogros = async () => {
      try {
        setIsLoadingDistribucion(true);
        setErrorDistribucion(null);
        const data = await EstadisticasAPI.obtenerDistribucionLogrosGlobal();
        setDistribucionData(data);
      } catch (error) {
        console.error('Error al cargar distribución de logros:', error);
        setErrorDistribucion(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsLoadingDistribucion(false);
      }
    };

    cargarDistribucionLogros();
  }, []);

  // Cargar datos de cursos problema
  useEffect(() => {
    const cargarCursosProblema = async () => {
      try {
        setIsLoadingCursos(true);
        setErrorCursos(null);
        const data = await EstadisticasAPI.obtenerCursosProblemaGlobal();
        setCursosData(data);
      } catch (error) {
        console.error('Error al cargar cursos problema:', error);
        setErrorCursos(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsLoadingCursos(false);
      }
    };

    cargarCursosProblema();
  }, []);

  // Función para reintentar carga de datos
  const reintentarDistribucion = () => {
    const cargarDistribucionLogros = async () => {
      try {
        setIsLoadingDistribucion(true);
        setErrorDistribucion(null);
        const data = await EstadisticasAPI.obtenerDistribucionLogrosGlobal();
        setDistribucionData(data);
      } catch (error) {
        setErrorDistribucion(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsLoadingDistribucion(false);
      }
    };
    cargarDistribucionLogros();
  };

  const reintentarCursos = () => {
    const cargarCursosProblema = async () => {
      try {
        setIsLoadingCursos(true);
        setErrorCursos(null);
        const data = await EstadisticasAPI.obtenerCursosProblemaGlobal();
        setCursosData(data);
      } catch (error) {
        setErrorCursos(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsLoadingCursos(false);
      }
    };
    cargarCursosProblema();
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header de la sección */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#8D2C1D] mb-2">
          📊 Estadísticas del Sistema
        </h2>
        <p className="text-gray-600">
          Vista global del rendimiento académico en todos los colegios
        </p>
      </div>

      {/* Grid de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Gráfico de Distribución de Logros */}
        <div className="space-y-4">
          {errorDistribucion ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-red-200">
              <div className="text-center">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  Error al cargar distribución de logros
                </h3>
                <p className="text-sm text-red-500 mb-4">{errorDistribucion}</p>
                <button
                  onClick={reintentarDistribucion}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  disabled={isLoadingDistribucion}
                >
                  {isLoadingDistribucion ? 'Cargando...' : 'Reintentar'}
                </button>
              </div>
            </div>
          ) : (
            <DistribucionLogros 
              colegios={distribucionData?.colegios || []}
              isLoading={isLoadingDistribucion}
            />
          )}
        </div>

        {/* Gráfico de Cursos Problema */}
        <div className="space-y-4">
          {errorCursos ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-red-200">
              <div className="text-center">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  Error al cargar cursos problema
                </h3>
                <p className="text-sm text-red-500 mb-4">{errorCursos}</p>
                <button
                  onClick={reintentarCursos}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  disabled={isLoadingCursos}
                >
                  {isLoadingCursos ? 'Cargando...' : 'Reintentar'}
                </button>
              </div>
            </div>
          ) : (
            <CursosProblema 
              cursos={cursosData?.cursosProblema || []}
              isLoading={isLoadingCursos}
            />
          )}
        </div>
      </div>

      {/* Resumen global */}
      {distribucionData && cursosData && !isLoadingDistribucion && !isLoadingCursos && (
        <div className="bg-gradient-to-r from-[#8D2C1D]/10 to-[#D96924]/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#8D2C1D] mb-4 text-center">
            📈 Resumen Global del Sistema
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8D2C1D]">
                {distribucionData.totalColegios}
              </div>
              <div className="text-sm text-gray-700">Colegios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8D2C1D]">
                {distribucionData.totalNotasGlobal.toLocaleString()}
              </div>
              <div className="text-sm text-gray-700">Notas Registradas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8D2C1D]">
                {cursosData.cursosAnalizados}
              </div>
              <div className="text-sm text-gray-700">Cursos Analizados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8D2C1D]">
                {cursosData.promedioProblemasGlobal}%
              </div>
              <div className="text-sm text-gray-700">Promedio Problemas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
