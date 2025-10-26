'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { LogrosPorColegio } from '@/types/estadisticas';

interface DistribucionLogrosProps {
  colegios: LogrosPorColegio[];
  isLoading?: boolean;
}

// Colores para cada tipo de logro (paleta de marca)
const COLORES_LOGROS = {
  AD: '#22C55E', // Verde - Excelente
  A: '#3B82F6',  // Azul - Bueno
  B: '#F59E0B',  // Amarillo - Regular
  C: '#EF4444'   // Rojo - Deficiente
};

// Tooltip personalizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
        <p className="font-bold text-lg text-[#8D2C1D] mb-3">{data.name}</p>
        <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 p-2 rounded">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-[#22C55E] rounded"></span>
                <p className="text-sm font-semibold text-gray-900">Logro AD</p>
              </div>
              <p className="text-sm mt-1 text-gray-700">{data.logros.AD} ({data.porcentajes.AD}%)</p>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-[#3B82F6] rounded"></span>
                <p className="text-sm font-semibold text-gray-900">Logro A</p>
              </div>
              <p className="text-sm mt-1 text-gray-700">{data.logros.A} ({data.porcentajes.A}%)</p>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-[#F59E0B] rounded"></span>
                <p className="text-sm font-semibold text-gray-900">Logro B</p>
              </div>
              <p className="text-sm mt-1 text-gray-700">{data.logros.B} ({data.porcentajes.B}%)</p>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-[#EF4444] rounded"></span>
                <p className="text-sm font-semibold text-gray-900">Logro C</p>
              </div>
              <p className="text-sm mt-1 text-gray-700">{data.logros.C} ({data.porcentajes.C}%)</p>
            </div>
          </div>
          <div className="pt-2 mt-1 border-t text-center">
            <p className="text-sm font-bold text-gray-900">Total: {data.value} notas</p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function DistribucionLogros({ colegios, isLoading = false }: DistribucionLogrosProps) {
  if (isLoading) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#E9E1C9]">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D]"></div>
        </div>
      </div>
    );
  }

  if (!colegios || colegios.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#E9E1C9]">
        <h3 className="text-lg font-semibold text-[#8D2C1D] mb-4">
          Distribución de Logros por Colegio
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <p className="text-lg mb-2">📊</p>
            <p>No hay datos de logros disponibles</p>
            <p className="text-sm">Registra algunas notas para ver estadísticas</p>
          </div>
        </div>
      </div>
    );
  }

  // Preparar datos para el gráfico de pastel - Mostrar por colegio
  const datosGrafico = colegios.map((colegio, index) => ({
    name: colegio.nombre,
    value: colegio.totalNotas,
    logros: colegio.logros,
    porcentajes: colegio.porcentajes,
    color: `hsl(${(index * 137.5) % 360}, 70%, 60%)`
  }));
  
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#E9E1C9]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#8D2C1D] mb-2">
          Distribución de Logros por Colegio
        </h3>
        <p className="text-sm text-gray-600">
          Vista global del rendimiento académico en todos los colegios del sistema
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={datosGrafico}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={40}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={false}
            >
              {datosGrafico.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                />
              ))}
            </Pie>
            
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 100 }} />
            <Legend 
              verticalAlign="bottom"
              height={60}
              formatter={(value, entry: any) => (
                <span className="text-sm text-gray-800 font-medium flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: entry.color }}></span>
                  {value}
                </span>
              )}
              onClick={undefined}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Estadísticas resumidas */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {colegios.reduce((sum, c) => sum + c.logros.AD, 0)}
          </div>
          <div className="text-sm text-green-700">Logro AD</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {colegios.reduce((sum, c) => sum + c.logros.A, 0)}
          </div>
          <div className="text-sm text-blue-700">Logro A</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {colegios.reduce((sum, c) => sum + c.logros.B, 0)}
          </div>
          <div className="text-sm text-yellow-700">Logro B</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {colegios.reduce((sum, c) => sum + c.logros.C, 0)}
          </div>
          <div className="text-sm text-red-700">Logro C</div>
        </div>
      </div>
    </div>
  );
}
