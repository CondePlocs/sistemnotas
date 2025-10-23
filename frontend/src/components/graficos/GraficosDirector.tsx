'use client';

import React, { useState, useEffect } from 'react';
import { EstadisticasDirectorAPI, LogrosPorColegio, RendimientoPorGradoResponse, CursosProblemaColegioResponse } from '@/lib/api/estadisticas-director';
import DistribucionLogrosDirector from './DistribucionLogrosDirector';
import RendimientoPorGrado from './RendimientoPorGrado';
import CursosProblemaDirector from './CursosProblemaDirector';

const GraficosDirector: React.FC = () => {
  // Estados para distribución de logros
  const [distribucionData, setDistribucionData] = useState<LogrosPorColegio | null>(null);
  const [distribucionLoading, setDistribucionLoading] = useState(true);
  const [distribucionError, setDistribucionError] = useState<string | null>(null);

  // Estados para rendimiento por grado
  const [rendimientoData, setRendimientoData] = useState<RendimientoPorGradoResponse | null>(null);
  const [rendimientoLoading, setRendimientoLoading] = useState(true);
  const [rendimientoError, setRendimientoError] = useState<string | null>(null);

  // Estados para cursos problema
  const [cursosProblemaData, setCursosProblemaData] = useState<CursosProblemaColegioResponse | null>(null);
  const [cursosProblemaLoading, setCursosProblemaLoading] = useState(true);
  const [cursosProblemaError, setCursosProblemaError] = useState<string | null>(null);

  // Función para cargar distribución de logros
  const cargarDistribucionLogros = async () => {
    try {
      setDistribucionLoading(true);
      setDistribucionError(null);
      const data = await EstadisticasDirectorAPI.obtenerDistribucionLogrosColegio();
      setDistribucionData(data);
    } catch (error) {
      console.error('Error al cargar distribución de logros:', error);
      setDistribucionError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setDistribucionLoading(false);
    }
  };

  // Función para cargar rendimiento por grado
  const cargarRendimientoPorGrado = async () => {
    try {
      setRendimientoLoading(true);
      setRendimientoError(null);
      const data = await EstadisticasDirectorAPI.obtenerRendimientoPorGrado();
      setRendimientoData(data);
    } catch (error) {
      console.error('Error al cargar rendimiento por grado:', error);
      setRendimientoError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setRendimientoLoading(false);
    }
  };

  // Función para cargar cursos problema
  const cargarCursosProblema = async () => {
    try {
      setCursosProblemaLoading(true);
      setCursosProblemaError(null);
      const data = await EstadisticasDirectorAPI.obtenerCursosProblemaColegioDirector();
      setCursosProblemaData(data);
    } catch (error) {
      console.error('Error al cargar cursos problema:', error);
      setCursosProblemaError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setCursosProblemaLoading(false);
    }
  };

  // Función para recargar todos los gráficos
  const recargarTodosLosGraficos = async () => {
    await Promise.all([
      cargarDistribucionLogros(),
      cargarRendimientoPorGrado(),
      cargarCursosProblema()
    ]);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    recargarTodosLosGraficos();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header con título y botón de recarga */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            📊 Estadísticas de Mi Colegio
          </h2>
          <p className="text-gray-600 mt-1">
            Vista táctica del rendimiento académico de tu institución educativa
          </p>
        </div>
        <button
          onClick={recargarTodosLosGraficos}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={distribucionLoading || rendimientoLoading || cursosProblemaLoading}
        >
          <svg 
            className={`w-4 h-4 ${distribucionLoading || rendimientoLoading || cursosProblemaLoading ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* Grid de gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Distribución de Logros - Gráfico principal (span completo en mobile) */}
        <div className="xl:col-span-1">
          <DistribucionLogrosDirector
            data={distribucionData}
            loading={distribucionLoading}
            error={distribucionError}
            onRetry={cargarDistribucionLogros}
          />
        </div>

        {/* Rendimiento por Grado */}
        <div className="xl:col-span-1">
          <RendimientoPorGrado
            data={rendimientoData}
            loading={rendimientoLoading}
            error={rendimientoError}
            onRetry={cargarRendimientoPorGrado}
          />
        </div>
      </div>

      {/* Cursos Problema - Ancho completo */}
      <div className="w-full">
        <CursosProblemaDirector
          data={cursosProblemaData}
          loading={cursosProblemaLoading}
          error={cursosProblemaError}
          onRetry={cargarCursosProblema}
        />
      </div>

      {/* Información adicional */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <div className="text-blue-500 mr-3 mt-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">Acerca de estas estadísticas</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>Distribución de Logros:</strong> Muestra el estado general de salud académica de tu colegio</p>
              <p>• <strong>Rendimiento por Grado:</strong> Permite comparar el desempeño entre diferentes niveles educativos</p>
              <p>• <strong>Cursos Problema:</strong> Identifica las materias que requieren atención inmediata</p>
              <p>• <strong>Datos en tiempo real:</strong> Las estadísticas se actualizan automáticamente con las nuevas evaluaciones</p>
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores de estado global */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${distribucionError ? 'bg-red-500' : distribucionLoading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            <div>
              <p className="text-sm font-medium text-gray-800">Distribución de Logros</p>
              <p className="text-xs text-gray-600">
                {distribucionError ? 'Error' : distribucionLoading ? 'Cargando...' : 'Actualizado'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${rendimientoError ? 'bg-red-500' : rendimientoLoading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            <div>
              <p className="text-sm font-medium text-gray-800">Rendimiento por Grado</p>
              <p className="text-xs text-gray-600">
                {rendimientoError ? 'Error' : rendimientoLoading ? 'Cargando...' : 'Actualizado'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${cursosProblemaError ? 'bg-red-500' : cursosProblemaLoading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            <div>
              <p className="text-sm font-medium text-gray-800">Cursos Problema</p>
              <p className="text-xs text-gray-600">
                {cursosProblemaError ? 'Error' : cursosProblemaLoading ? 'Cargando...' : 'Actualizado'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficosDirector;
