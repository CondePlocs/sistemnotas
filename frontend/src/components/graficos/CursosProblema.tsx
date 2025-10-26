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

    // Función para obtener el color y texto según el porcentaje
    const getStatusInfo = (porcentaje: number) => {
      if (porcentaje >= 70) return { color: 'text-red-600 bg-red-50', text: 'Crítico' };
      if (porcentaje >= 50) return { color: 'text-yellow-600 bg-yellow-50', text: 'Alto' };
      if (porcentaje >= 30) return { color: 'text-blue-600 bg-blue-50', text: 'Moderado' };
      return { color: 'text-green-600 bg-green-50', text: 'Bajo' };
    };

    const statusInfo = getStatusInfo(data.porcentajeProblema);

    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200 max-w-[320px]">
        <div className="mb-3">
          <p className="font-bold text-lg text-[#8D2C1D] mb-1">{data.nombreCompleto}</p>
          <div className={`inline-block px-2 py-1 rounded text-sm font-medium ${statusInfo.color}`}>
            Nivel de Riesgo: {statusInfo.text}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-600 mb-1">Nivel</p>
            <p className="text-sm font-bold text-gray-900">{data.nivel}</p>
          </div>
          <div className={`${statusInfo.color} p-2 rounded`}>
            <p className="text-xs text-gray-600 mb-1">Índice Problema</p>
            <p className="text-sm font-bold">{data.porcentajeProblema}%</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-600 mb-1">Total Alumnos</p>
            <p className="text-sm font-bold text-gray-900">{data.totalAlumnos}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-600 mb-1">Con Dificultades</p>
            <p className="text-sm font-bold text-gray-900">{data.alumnosProblema}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm font-semibold text-gray-900 mb-2">Desglose de Dificultades:</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-yellow-50 p-2 rounded">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block w-2 h-2 bg-yellow-500 rounded"></span>
                <p className="text-xs font-medium text-gray-700">Logro B</p>
              </div>
              <p className="text-sm font-bold text-yellow-700">{data.detalleProblemas.B} alumnos</p>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block w-2 h-2 bg-red-500 rounded"></span>
                <p className="text-xs font-medium text-gray-700">Logro C</p>
              </div>
              <p className="text-sm font-bold text-red-700">{data.detalleProblemas.C} alumnos</p>
            </div>
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

  // Función para acortar nombres de manera inteligente
  const acortarNombre = (nombre: string) => {
    if (nombre.length <= 20) return nombre;
    
    // Dividir en palabras
    const palabras = nombre.split(' ');
    
    if (palabras.length === 1) {
      return nombre.substring(0, 18) + '...';
    }

    // Si tiene más de una palabra, intentar abreviar
    const primerasPalabras = palabras[0];
    const ultimaPalabra = palabras[palabras.length - 1];
    
    // Si las primeras palabras son muy largas, acortarlas
    const inicio = primerasPalabras.length > 12 
      ? primerasPalabras.substring(0, 10) + '...'
      : primerasPalabras;
      
    return `${inicio} ${ultimaPalabra}`;
  };

  // Preparar datos para el gráfico (tomar solo los primeros 8 para mejor visualización)
  const datosGrafico = cursos.slice(0, 8).map((curso, index) => ({
    nombre: acortarNombre(curso.nombre),
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
              left: 120,
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
              width={110}
              stroke="#666666"
              tick={{
                fill: '#374151',
                fontSize: 12,
                fontWeight: 500
              }}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              wrapperStyle={{ zIndex: 100 }} 
              cursor={{ fill: 'rgba(147, 197, 253, 0.1)' }}
            />
            <Bar 
              dataKey="porcentajeProblema" 
              radius={[0, 4, 4, 0]}
              barSize={20}
            >
              {datosGrafico.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.porcentajeProblema >= 70 ? '#EF4444' : 
                        entry.porcentajeProblema >= 50 ? '#F59E0B' : 
                        entry.porcentajeProblema >= 30 ? '#3B82F6' : '#22C55E'}
                />
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
