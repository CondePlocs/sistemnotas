'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CursoProblema } from '@/types/estadisticas';

interface CursosProblemaProps {
  cursos: CursoProblema[];
  isLoading?: boolean;
}

// Colores de la paleta de marca para las barras
const COLORES_BARRAS = [
  '#8D2C1D', // Rojo principal
  '#D96924', // Naranja
  '#B8860B', // Dorado
  '#CD853F', // Marrón claro
  '#A0522D', // Sienna
];

// Tooltip personalizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-[#E9E1C9]">
        <p className="font-semibold text-[#8D2C1D] mb-2">{data.nombre}</p>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-medium">Nivel:</span> {data.nivel}
          </p>
          <p className="text-sm">
            <span className="font-medium">Total alumnos:</span> {data.totalAlumnos}
          </p>
          <p className="text-sm">
            <span className="font-medium">Con problemas:</span> {data.alumnosProblema}
          </p>
          <p className="text-sm">
            <span className="font-medium">Porcentaje:</span> {data.porcentajeProblema}%
          </p>
          <div className="border-t pt-2 mt-2">
            <p className="text-xs text-gray-600">Desglose problemas:</p>
            <p className="text-xs">Nota B: {data.detalleProblemas.B}</p>
            <p className="text-xs">Nota C: {data.detalleProblemas.C}</p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function CursosProblema({ cursos, isLoading = false }: CursosProblemaProps) {
  if (isLoading) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#E9E1C9]">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D]"></div>
        </div>
      </div>
    );
  }

  if (!cursos || cursos.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#E9E1C9]">
        <h3 className="text-lg font-semibold text-[#8D2C1D] mb-4">
          Top Cursos Problema
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <p className="text-lg mb-2">📈</p>
            <p>No hay datos de cursos disponibles</p>
            <p className="text-sm">Registra evaluaciones para ver estadísticas</p>
          </div>
        </div>
      </div>
    );
  }

  // Preparar datos para el gráfico (tomar solo los primeros 8 para mejor visualización)
  const datosGrafico = cursos.slice(0, 8).map((curso, index) => ({
    nombre: curso.nombre.length > 15 ? curso.nombre.substring(0, 15) + '...' : curso.nombre,
    nombreCompleto: curso.nombre,
    porcentajeProblema: curso.porcentajeProblema,
    totalAlumnos: curso.totalAlumnos,
    alumnosProblema: curso.alumnosProblema,
    nivel: curso.nivel,
    detalleProblemas: curso.detalleProblemas,
    color: COLORES_BARRAS[index % COLORES_BARRAS.length],
  }));

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#E9E1C9]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#8D2C1D] mb-2">
          Top Cursos Problema
        </h3>
        <p className="text-sm text-gray-600">
          Cursos con mayor porcentaje de alumnos con notas B y C
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={datosGrafico}
            layout="horizontal"
            margin={{
              top: 5,
              right: 30,
              left: 80,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E9E1C9" />
            <XAxis 
              type="number" 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              stroke="#666666"
            />
            <YAxis 
              type="category" 
              dataKey="nombre"
              width={75}
              stroke="#666666"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="porcentajeProblema" radius={[0, 4, 4, 0]}>
              {datosGrafico.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Estadísticas resumidas */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gradient-to-r from-[#8D2C1D]/10 to-[#D96924]/10 rounded-lg">
          <div className="text-2xl font-bold text-[#8D2C1D]">
            {cursos.length}
          </div>
          <div className="text-sm text-gray-700">Cursos Analizados</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-r from-[#8D2C1D]/10 to-[#D96924]/10 rounded-lg">
          <div className="text-2xl font-bold text-[#8D2C1D]">
            {cursos.length > 0 ? Math.round(cursos.reduce((sum, c) => sum + c.porcentajeProblema, 0) / cursos.length) : 0}%
          </div>
          <div className="text-sm text-gray-700">Promedio Problemas</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-r from-[#8D2C1D]/10 to-[#D96924]/10 rounded-lg">
          <div className="text-2xl font-bold text-[#8D2C1D]">
            {cursos.reduce((sum, c) => sum + c.totalAlumnos, 0)}
          </div>
          <div className="text-sm text-gray-700">Total Alumnos</div>
        </div>
      </div>

      {/* Lista de cursos más problemáticos */}
      {cursos.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-[#8D2C1D] mb-3">
            Cursos que requieren atención inmediata:
          </h4>
          <div className="space-y-2">
            {cursos.slice(0, 3).map((curso, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                <div>
                  <span className="font-medium text-sm">{curso.nombre}</span>
                  <span className="text-xs text-gray-600 ml-2">({curso.nivel})</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-red-600">
                    {curso.porcentajeProblema}%
                  </div>
                  <div className="text-xs text-gray-600">
                    {curso.alumnosProblema}/{curso.totalAlumnos}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
