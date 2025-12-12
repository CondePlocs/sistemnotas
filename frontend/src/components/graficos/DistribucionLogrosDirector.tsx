'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { LogrosPorColegio } from '@/lib/api/estadisticas-director';

interface DistribucionLogrosDirectorProps {
  data: LogrosPorColegio | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

// Colores para cada tipo de logro
const COLORES_LOGROS = {
  AD: '#10B981', // Verde - Logro destacado
  A: '#3B82F6',  // Azul - Logro esperado
  B: '#F59E0B',  // Amarillo - En proceso
  C: '#EF4444'   // Rojo - En inicio
};

const DistribucionLogrosDirector: React.FC<DistribucionLogrosDirectorProps> = ({
  data,
  loading,
  error,
  onRetry
}) => {
  // Estado de loading
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Distribución de Logros - Mi Colegio
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando distribución...</span>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Distribución de Logros - Mi Colegio
        </h3>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Estado sin datos
  if (!data || data.totalNotas === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Distribución de Logros - {data?.nombre || 'Mi Colegio'}
        </h3>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">No hay datos de evaluaciones registradas</p>
          <p className="text-sm text-gray-500">Los gráficos aparecerán cuando se registren notas</p>
        </div>
      </div>
    );
  }

  // Preparar datos para el gráfico
  const datosGrafico = [
    { name: 'Logro AD', value: data.logros.AD, color: COLORES_LOGROS.AD, porcentaje: data.porcentajes.AD },
    { name: 'Logro A', value: data.logros.A, color: COLORES_LOGROS.A, porcentaje: data.porcentajes.A },
    { name: 'Logro B', value: data.logros.B, color: COLORES_LOGROS.B, porcentaje: data.porcentajes.B },
    { name: 'Logro C', value: data.logros.C, color: COLORES_LOGROS.C, porcentaje: data.porcentajes.C }
  ].filter(item => item.value > 0); // Solo mostrar logros con datos

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border-2 border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-lg" style={{ color: data.color }}>
            {data.name}
          </p>
          <p className="text-sm text-gray-900 font-medium">
            Cantidad: <span className="font-bold text-gray-900">{data.value}</span>
          </p>
          <p className="text-sm text-gray-900 font-medium">
            Porcentaje: <span className="font-bold text-gray-900">{data.porcentaje}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Distribución de Logros - {data.nombre}
        </h3>
        <p className="text-sm text-gray-600">
          Vista general del rendimiento académico de tu colegio
        </p>
      </div>

      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={datosGrafico}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {datosGrafico.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Resumen estadístico */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{data.logros.AD}</div>
          <div className="text-sm text-gray-600">Logro AD</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{data.logros.A}</div>
          <div className="text-sm text-gray-600">Logro A</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{data.logros.B}</div>
          <div className="text-sm text-gray-600">Logro B</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{data.logros.C}</div>
          <div className="text-sm text-gray-600">Logro C</div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Total de evaluaciones: <span className="font-semibold">{data.totalNotas}</span>
        </p>
      </div>
    </div>
  );
};

export default DistribucionLogrosDirector;
