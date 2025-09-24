"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Curso, 
  NivelEducativo, 
  NIVELES_EDUCATIVOS,
  obtenerColorCurso,

} from '@/types/curso';

function CursosListContent() {
  const router = useRouter();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroNivel, setFiltroNivel] = useState<NivelEducativo | 'TODOS'>('TODOS');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cursos', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar cursos');
      }

      const data = await response.json();
      setCursos(data.cursos || []);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const cursosFiltrados = cursos.filter(curso => {
    const coincideNivel = filtroNivel === 'TODOS' || curso.nivel === filtroNivel;
    const coincideBusqueda = curso.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            (curso.descripcion && curso.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
    
    return coincideNivel && coincideBusqueda;
  });

  const estadisticasPorNivel = NIVELES_EDUCATIVOS.map(nivel => ({
    ...nivel,
    cantidad: cursos.filter(curso => curso.nivel === nivel.valor).length
  }));

  const handleEditarCurso = (curso: Curso) => {
    router.push(`/owner/cursos/${curso.id}/editar`);
  };

  const handleVerCompetencias = (curso: Curso) => {
    router.push(`/owner/cursos/${curso.id}/competencias`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Cursos</h1>
              <p className="text-sm text-gray-600 mt-1">
                Administra los cursos y competencias del sistema educativo
              </p>
            </div>
            
            <button
              onClick={() => router.push('/owner/cursos/nuevo')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Nuevo Curso
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cursos</p>
                <p className="text-2xl font-bold text-gray-900">{cursos.length}</p>
              </div>
            </div>
          </div>

          {estadisticasPorNivel.map(nivel => (
            <div key={nivel.valor} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">
                      {nivel.label.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{nivel.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{nivel.cantidad}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar cursos
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre o descripción..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Filtro por Nivel */}
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por nivel
              </label>
              <select
                value={filtroNivel}
                onChange={(e) => setFiltroNivel(e.target.value as NivelEducativo | 'TODOS')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="TODOS">Todos los niveles</option>
                {NIVELES_EDUCATIVOS.map(nivel => (
                  <option key={nivel.valor} value={nivel.valor}>
                    {nivel.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Cursos */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={cargarCursos}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Intentar nuevamente
            </button>
          </div>
        ) : cursosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {cursos.length === 0 ? 'No hay cursos creados' : 'No se encontraron cursos'}
            </h3>
            <p className="text-gray-600 mb-4">
              {cursos.length === 0 
                ? 'Comienza creando tu primer curso con sus competencias'
                : 'Intenta ajustar los filtros de búsqueda'
              }
            </p>
            {cursos.length === 0 && (
              <button
                onClick={() => router.push('/owner/cursos/nuevo')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Crear Primer Curso
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cursosFiltrados.map(curso => (
              <CursoCard
                key={curso.id}
                curso={curso}
                onEdit={handleEditarCurso}
                onViewCompetencias={handleVerCompetencias}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Componente para mostrar cada curso
interface CursoCardProps {
  curso: Curso;
  onEdit: (curso: Curso) => void;
  onViewCompetencias: (curso: Curso) => void;
}

function CursoCard({ curso, onEdit, onViewCompetencias }: CursoCardProps) {
  const nivelInfo = NIVELES_EDUCATIVOS.find(n => n.valor === curso.nivel);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {/* Header del curso */}
      <div 
        className="p-4 rounded-t-lg"
        style={{ backgroundColor: obtenerColorCurso(curso.color) }}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            
            <div>
              <h3 className="font-bold text-lg">{curso.nombre}</h3>
              <p className="text-sm opacity-90">
                {nivelInfo?.label} • {curso.competencias?.length || 0} competencias
              </p>
            </div>
          </div>
          
         
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {curso.descripcion && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {curso.descripcion}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>
            Creado: {new Date(curso.creadoEn).toLocaleDateString()}
          </span>
          
        </div>

        {/* Acciones */}
        <div className="flex space-x-2">
          <button
            onClick={() => onViewCompetencias(curso)}
            className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Ver Competencias
          </button>
          <button
            onClick={() => onEdit(curso)}
            className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CursosList() {
  return (
    <ProtectedRoute requiredRole="OWNER">
      <CursosListContent />
    </ProtectedRoute>
  );
}
