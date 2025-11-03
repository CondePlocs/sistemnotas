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
  const [isLoadingDistribucion, setIsLoadingDistribucion] = useState(true);
  const [errorDistribucion, setErrorDistribucion] = useState<string | null>(null);
  
  const [cursosProblemaData, setCursosProblemaData] = useState<CursosProblemaResponse | null>(null);
  const [isLoadingCursosProblema, setIsLoadingCursosProblema] = useState(true);
  const [errorCursosProblema, setErrorCursosProblema] = useState<string | null>(null);

  // Cargar datos de distribución de logros y cursos problema
  useEffect(() => {
    const cargarDatos = async () => {
      // Cargar distribución de logros
      try {
        setIsLoadingDistribucion(true);
        setErrorDistribucion(null);
        const distribucionData = await EstadisticasAPI.obtenerDistribucionLogrosGlobal();
        setDistribucionData(distribucionData);
      } catch (error) {
        console.error('Error al cargar distribución de logros:', error);
        setErrorDistribucion(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsLoadingDistribucion(false);
      }

      // Cargar cursos problema
      try {
        setIsLoadingCursosProblema(true);
        setErrorCursosProblema(null);
        const cursosData = await EstadisticasAPI.obtenerCursosProblemaGlobal();
        setCursosProblemaData(cursosData);
      } catch (error) {
        console.error('Error al cargar cursos problema:', error);
        setErrorCursosProblema(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsLoadingCursosProblema(false);
      }
    };

    cargarDatos();
  }, []);

  // Funciones para reintentar carga de datos
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

  const reintentarCursosProblema = () => {
    const cargarCursosProblema = async () => {
      try {
        setIsLoadingCursosProblema(true);
        setErrorCursosProblema(null);
        const data = await EstadisticasAPI.obtenerCursosProblemaGlobal();
        setCursosProblemaData(data);
      } catch (error) {
        setErrorCursosProblema(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsLoadingCursosProblema(false);
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

      {/* Gráfico de Distribución de Logros con estadísticas */}
      <div className="space-y-4 max-w-4xl mx-auto">
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
          <>
            <DistribucionLogros 
              colegios={distribucionData?.colegios || []}
              isLoading={isLoadingDistribucion}
            />
            {/* Estadísticas debajo del gráfico */}
            {distribucionData && !isLoadingDistribucion && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#E9E1C9] text-center">
                  <div className="text-2xl font-bold text-[#8D2C1D]">
                    {distribucionData.totalColegios}
                  </div>
                  <div className="text-sm text-gray-700">Colegios Registrados</div>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#E9E1C9] text-center">
                  <div className="text-2xl font-bold text-[#8D2C1D]">
                    {distribucionData.totalNotasGlobal.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-700">Notas Registradas</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Gráfico de Cursos Problema */}
      <div className="space-y-4 max-w-6xl mx-auto">
        {errorCursosProblema ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-red-200">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Error al cargar cursos problema
              </h3>
              <p className="text-sm text-red-500 mb-4">{errorCursosProblema}</p>
              <button
                onClick={reintentarCursosProblema}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                disabled={isLoadingCursosProblema}
              >
                {isLoadingCursosProblema ? 'Cargando...' : 'Reintentar'}
              </button>
            </div>
          </div>
        ) : (
          <CursosProblema 
            cursos={cursosProblemaData?.cursosProblema || []}
            isLoading={isLoadingCursosProblema}
          />
        )}
      </div>

    </div>
  );
}
