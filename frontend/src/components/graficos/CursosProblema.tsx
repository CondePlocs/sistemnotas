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

    const statusInfo = getStatusInfo(Number(data.porcentajeProblema));

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

  console.log('Datos de cursos recibidos:', cursos);
  
  console.log('Cursos sin procesar:', cursos);
  
  // Asegurarnos de que siempre haya al menos un espacio para mostrar datos
  let datosGrafico = cursos.length === 0 ? [{
    nombre: 'Sin datos',
    nombreCompleto: 'Sin datos disponibles',
    porcentajeProblema: 0,
    totalAlumnos: 0,
    alumnosProblema: 0,
    nivel: '-',
    detalleProblemas: { B: 0, C: 0 },
  }] : cursos.slice(0, 8).map((curso, index) => {
    // Asegurarnos de que porcentajeProblema sea un número
    const porcentaje = typeof curso.porcentajeProblema === 'string' 
      ? parseFloat(curso.porcentajeProblema) 
      : curso.porcentajeProblema || 0; // Añadimos || 0 para manejar undefined
      
    const porcentajeNumerico = Number(porcentaje.toFixed(2));
    console.log('Porcentaje convertido:', porcentajeNumerico);
    
    const resultado = {
      nombre: acortarNombre(curso.nombre),
      nombreCompleto: curso.nombre,
      porcentajeProblema: porcentajeNumerico,
      totalAlumnos: Number(curso.totalAlumnos) || 0,
      alumnosProblema: Number(curso.alumnosProblema) || 0,
      nivel: curso.nivel || '-',
      detalleProblemas: curso.detalleProblemas || { B: 0, C: 0 }
    };
    
    console.log('Datos procesados para gráfico:', resultado);
    return resultado;
  });

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#E9E1C9] w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#8D2C1D] mb-2">
          Top Cursos Problema
        </h3>
        <p className="text-sm text-gray-600">
          Cursos con mayor porcentaje de alumnos con notas B y C
        </p>
      </div>

      <div className="w-full" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={datosGrafico}
            layout="horizontal"
            margin={{
              top: 20,
              right: 60,
              left: 140,
              bottom: 20,
            }}
            barCategoryGap={8}
            maxBarSize={40}
          >
            <defs>
              {/* Gradientes para las barras */}
              <linearGradient id="colorCritico" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#DC2626" />
              </linearGradient>
              <linearGradient id="colorAlto" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="colorModerado" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
              <linearGradient id="colorBajo" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E5E7EB" 
              horizontal={true}
              vertical={false}
            />
            
            <XAxis 
              type="number" 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              stroke="#374151"
              tick={{ fill: '#374151', fontSize: 12 }}
              axisLine={{ stroke: '#9CA3AF' }}
              tickLine={{ stroke: '#9CA3AF' }}
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            
            <YAxis 
              type="category" 
              dataKey="nombre"
              width={130}
              stroke="#374151"
              tick={{
                fill: '#111827',
                fontSize: 13,
                fontWeight: 500
              }}
              axisLine={{ stroke: '#9CA3AF' }}
            />
            
            <Tooltip 
              content={<CustomTooltip />} 
              wrapperStyle={{ zIndex: 100 }} 
              cursor={{ fill: 'rgba(147, 197, 253, 0.1)' }}
            />
            
            <Bar 
              dataKey="porcentajeProblema" 
              radius={[0, 6, 6, 0]}
              barSize={35}
              minPointSize={35}
              animationDuration={1500}
              animationBegin={200}
              background={{ fill: '#f3f4f6' }}
              label={{
                position: 'right',
                fill: '#374151',
                fontSize: 13,
                fontWeight: 600,
                formatter: (value: any) => `${value}%`,
                dx: 5
              }}
            >
              {datosGrafico.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={`url(#${
                    entry.porcentajeProblema >= 70 ? 'colorCritico' :
                    entry.porcentajeProblema >= 50 ? 'colorAlto' :
                    entry.porcentajeProblema >= 30 ? 'colorModerado' :
                    'colorBajo'
                  })`}
                  stroke={entry.porcentajeProblema >= 70 ? '#991B1B' : 
                         entry.porcentajeProblema >= 50 ? '#92400E' : 
                         entry.porcentajeProblema >= 30 ? '#1E40AF' : 
                         '#047857'}
                  strokeWidth={1}
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
            {cursos.length > 0 ? Math.round(cursos.reduce((sum, c) => sum + Number(c.porcentajeProblema), 0) / cursos.length) : 0}%
          </div>
          <div className="text-sm text-gray-700">Promedio Problemas</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-r from-[#8D2C1D]/10 to-[#D96924]/10 rounded-lg">"
          <div className="text-2xl font-bold text-[#8D2C1D]">
            {cursos.reduce((sum, c) => sum + c.totalAlumnos, 0)}
          </div>
          <div className="text-sm text-gray-700">Total Alumnos</div>
        </div>
      </div>

      {/* Lista de cursos más problemáticos */}
      {cursos.length > 0 && (
        <div className="mt-6">
          <h4 className="text-base font-semibold text-[#8D2C1D] mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Cursos que requieren atención inmediata:
          </h4>
          <div className="space-y-2">
            {cursos.slice(0, 3).map((curso, index) => {
              const porcentaje = Number(curso.porcentajeProblema);
              const bgColor = porcentaje >= 70 ? 'bg-red-50' : 
                            porcentaje >= 50 ? 'bg-yellow-50' : 
                            porcentaje >= 30 ? 'bg-blue-50' : 'bg-green-50';
              
              const textColor = porcentaje >= 70 ? 'text-red-800' : 
                              porcentaje >= 50 ? 'text-yellow-800' : 
                              porcentaje >= 30 ? 'text-blue-800' : 'text-green-800';

              return (
                <div key={index} className={`flex items-center justify-between p-3 ${bgColor} rounded-lg border border-gray-200`}>
                  <div>
                    <span className={`font-semibold text-sm ${textColor}`}>{curso.nombre}</span>
                    <span className="text-xs text-gray-600 ml-2">({curso.nivel})</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${textColor}`}>
                      {curso.porcentajeProblema}%
                    </div>
                    <div className="text-xs text-gray-600">
                      {curso.alumnosProblema}/{curso.totalAlumnos} alumnos
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
