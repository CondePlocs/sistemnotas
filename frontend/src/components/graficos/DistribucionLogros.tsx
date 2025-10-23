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
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-[#E9E1C9]">
        <p className="font-semibold text-[#8D2C1D] mb-2">{data.nombre}</p>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="inline-block w-3 h-3 bg-[#22C55E] rounded mr-2"></span>
            AD: {data.AD} ({data.porcentajes.AD}%)
          </p>
          <p className="text-sm">
            <span className="inline-block w-3 h-3 bg-[#3B82F6] rounded mr-2"></span>
            A: {data.A} ({data.porcentajes.A}%)
          </p>
          <p className="text-sm">
            <span className="inline-block w-3 h-3 bg-[#F59E0B] rounded mr-2"></span>
            B: {data.B} ({data.porcentajes.B}%)
          </p>
          <p className="text-sm">
            <span className="inline-block w-3 h-3 bg-[#EF4444] rounded mr-2"></span>
            C: {data.C} ({data.porcentajes.C}%)
          </p>
          <p className="text-sm font-medium border-t pt-1 mt-2">
            Total: {data.totalNotas} notas
          </p>
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

  // Preparar datos para el gráfico de pastel
  const datosGrafico = colegios.map((colegio) => ({
    nombre: colegio.nombre,
    AD: colegio.logros.AD,
    A: colegio.logros.A,
    B: colegio.logros.B,
    C: colegio.logros.C,
    totalNotas: colegio.totalNotas,
    porcentajes: colegio.porcentajes,
  }));

  // Datos para múltiples pasteles (uno por tipo de logro)
  const tiposLogro = ['AD', 'A', 'B', 'C'];
  
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
            {/* Pastel principal con todos los datos */}
            <Pie
              data={datosGrafico}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={40}
              paddingAngle={2}
              dataKey="totalNotas"
            >
              {datosGrafico.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`hsl(${(index * 137.5) % 360}, 70%, 60%)`}
                />
              ))}
            </Pie>
            
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
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
