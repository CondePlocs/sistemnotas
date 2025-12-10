'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RendimientoPorGradoResponse } from '@/lib/api/estadisticas-director';

interface RendimientoPorGradoProps {
  data: RendimientoPorGradoResponse | null;
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

const RendimientoPorGrado: React.FC<RendimientoPorGradoProps> = ({
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
          Rendimiento por Grado
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando rendimiento...</span>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Rendimiento por Grado
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
  if (!data || data.grados.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Rendimiento por Grado
        </h3>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">No hay datos por grado disponibles</p>
          <p className="text-sm text-gray-500">Los gráficos aparecerán cuando se registren notas por grado</p>
        </div>
      </div>
    );
  }

  // Preparar datos para el gráfico
  const datosGrafico = data.grados.map(grado => ({
    grado: grado.grado,
    AD: grado.logros.AD,
    A: grado.logros.A,
    B: grado.logros.B,
    C: grado.logros.C,
    totalAlumnos: grado.totalAlumnos,
    promedio: grado.promedioNumerico
  }));

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      const gradoData = data.grados.find(g => g.grado === label);

      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          <p className="text-sm text-gray-600 mb-2">
            Total alumnos: <span className="font-medium">{gradoData?.totalAlumnos}</span>
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Promedio: <span className="font-medium">{gradoData?.promedioNumerico.toFixed(2)}</span>
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="flex items-center">
                  <div
                    className="w-3 h-3 rounded mr-2"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm">{entry.dataKey}:</span>
                </span>
                <span className="font-medium ml-2">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Rendimiento por Grado
        </h3>
        <p className="text-sm text-gray-600">
          Comparación del desempeño entre los diferentes niveles y grados
        </p>
      </div>

      <div className="h-80 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={datosGrafico}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="grado"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-sm">{`Logro ${value}`}</span>}
            />
            <Bar dataKey="AD" stackId="a" fill={COLORES_LOGROS.AD} name="AD" />
            <Bar dataKey="A" stackId="a" fill={COLORES_LOGROS.A} name="A" />
            <Bar dataKey="B" stackId="a" fill={COLORES_LOGROS.B} name="B" />
            <Bar dataKey="C" stackId="a" fill={COLORES_LOGROS.C} name="C" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Resumen estadístico */}
      <div className="pt-4 border-t">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.totalGrados}</div>
            <div className="text-sm text-gray-600">Grados Analizados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.grados.reduce((sum, g) => sum + g.totalAlumnos, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Alumnos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {data.grados.length > 0
                ? (data.grados.reduce((sum, g) => sum + g.promedioNumerico, 0) / data.grados.length).toFixed(2)
                : '0.00'
              }
            </div>
            <div className="text-sm text-gray-600">Promedio General</div>
          </div>
        </div>

        {/* Lista de grados con mejor y peor rendimiento */}
        {data.grados.length > 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-1">Mejor Rendimiento</h4>
              <p className="text-green-700">
                {data.grados.reduce((mejor, actual) =>
                  actual.promedioNumerico > mejor.promedioNumerico ? actual : mejor
                ).grado}
                <span className="ml-2 font-medium">
                  ({data.grados.reduce((mejor, actual) =>
                    actual.promedioNumerico > mejor.promedioNumerico ? actual : mejor
                  ).promedioNumerico.toFixed(2)})
                </span>
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-1">Requiere Atención</h4>
              <p className="text-red-700">
                {data.grados.reduce((menor, actual) =>
                  actual.promedioNumerico < menor.promedioNumerico ? actual : menor
                ).grado}
                <span className="ml-2 font-medium">
                  ({data.grados.reduce((menor, actual) =>
                    actual.promedioNumerico < menor.promedioNumerico ? actual : menor
                  ).promedioNumerico.toFixed(2)})
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RendimientoPorGrado;
