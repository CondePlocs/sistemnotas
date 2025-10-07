"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
import ModalConfirmarPassword from '@/components/modals/ModalConfirmarPassword';
import ModalCurso from '@/components/owner/ModalCurso';
import ModalCompetenciasCurso from '@/components/owner/ModalCompetenciasCurso';
import { useAuth } from '@/context/AuthContext';
import { 
  Curso, 
  NivelEducativo, 
  NIVELES_EDUCATIVOS,
  obtenerColorCurso,
} from '@/types/curso';

function CursosListContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroNivel, setFiltroNivel] = useState<NivelEducativo | 'TODOS'>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [cursoAEliminar, setCursoAEliminar] = useState<number | null>(null);
  const [showModalCurso, setShowModalCurso] = useState(false);
  const [showModalCompetencias, setShowModalCompetencias] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
    const coincideNivel = filtroNivel === 'TODOS' || curso.nivel?.nombre === filtroNivel;
    const coincideBusqueda = curso.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            (curso.descripcion && curso.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
    
    return coincideNivel && coincideBusqueda;
  });

  // Paginación
  const totalPages = Math.ceil(cursosFiltrados.length / itemsPerPage);
  const cursosPaginados = cursosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const estadisticasPorNivel = NIVELES_EDUCATIVOS.map(nivel => ({
    ...nivel,
    cantidad: cursos.filter(curso => curso.nivel?.nombre === nivel.valor).length
  }));

  const handleEditarCurso = (cursoId: number) => {
    setCursoSeleccionado(cursoId);
    setShowModalCurso(true);
  };

  const handleVerCompetencias = (cursoId: number) => {
    setCursoSeleccionado(cursoId);
    setShowModalCompetencias(true);
  };

  const handleEliminarCurso = (cursoId: number) => {
    setCursoAEliminar(cursoId);
    setShowPasswordModal(true);
  };

  const confirmarEliminacion = async (password: string) => {
    if (!cursoAEliminar) return;

    try {
      // Verificar contraseña
      const verifyResponse = await fetch('http://localhost:3001/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      if (!verifyResponse.ok) {
        alert('Contraseña incorrecta');
        return;
      }

      // Eliminar curso
      const deleteResponse = await fetch(`http://localhost:3001/api/cursos/${cursoAEliminar}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.message || 'Error al eliminar el curso');
      }

      alert('Curso eliminado exitosamente');
      setShowPasswordModal(false);
      setCursoAEliminar(null);
      cargarCursos(); // Recargar lista
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar el curso');
    }
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
    <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#F6CBA3] to-[#E9E1C9]">
      {/* Header */}
      <DashboardHeader 
        title="Sistema de Gestión Educativa"
        userName={user?.nombres || user?.email}
        userEmail={user?.email}
        onLogout={logout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título de sección con botón */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#8D2C1D] mb-2">Gestión de Cursos</h2>
            <p className="text-[#666666]">Administra los cursos y competencias del sistema educativo</p>
          </div>
          <button
            onClick={() => {
              setCursoSeleccionado(undefined);
              setShowModalCurso(true);
            }}
            className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Nuevo Curso</span>
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-4 md:grid-cols-4 gap-2 md:gap-4 mb-8">
          {/* Total Cursos */}
          <div className="bg-white/95 backdrop-blur-sm p-3 md:p-6 rounded-xl md:rounded-2xl shadow-lg border-2 border-[#E9E1C9] hover:border-[#8D2C1D] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-0">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#8D2C1D] to-[#D96924] rounded-lg md:rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
              </div>
              <div className="md:ml-4 text-center md:text-left">
                <p className="text-xs md:text-sm font-medium text-[#666666] hidden md:block">Total Cursos</p>
                <p className="text-xs md:text-sm font-medium text-[#666666] md:hidden">Total</p>
                <p className="text-xl md:text-3xl font-bold text-[#8D2C1D]">{cursos.length}</p>
              </div>
            </div>
          </div>

          {/* Niveles */}
          {estadisticasPorNivel.map((nivel, index) => {
            const colors = [
              { bg: 'from-[#10B981] to-[#059669]', text: 'text-emerald-600' },
              { bg: 'from-[#3B82F6] to-[#2563EB]', text: 'text-blue-600' },
              { bg: 'from-[#8B5CF6] to-[#7C3AED]', text: 'text-purple-600' }
            ];
            const color = colors[index % colors.length];
            
            return (
              <div key={nivel.valor} className="bg-white/95 backdrop-blur-sm p-3 md:p-6 rounded-xl md:rounded-2xl shadow-lg border-2 border-[#E9E1C9] hover:border-[#8D2C1D] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-0">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${color.bg} rounded-lg md:rounded-xl flex items-center justify-center shadow-md`}>
                      <span className="text-white font-bold text-base md:text-lg">
                        {nivel.label.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="md:ml-4 text-center md:text-left">
                    <p className="text-xs md:text-sm font-medium text-[#666666]">{nivel.label}</p>
                    <p className={`text-xl md:text-3xl font-bold ${color.text}`}>{nivel.cantidad}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-2 border-[#E9E1C9] mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[#8D2C1D] mb-2">
                Buscar cursos
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setCurrentPage(1); // Reset a primera página al buscar
                  }}
                  placeholder="Buscar por nombre o descripción..."
                  className="w-full pl-11 pr-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D]/20 focus:border-[#8D2C1D] transition-all duration-200 group-hover:border-[#D96924] placeholder:text-[#999999] text-[#333333]"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-[#666666] group-hover:text-[#8D2C1D] transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Filtro por Nivel */}
            <div className="sm:w-64">
              <label className="block text-sm font-semibold text-[#8D2C1D] mb-2">
                Filtrar por nivel
              </label>
              <select
                value={filtroNivel}
                onChange={(e) => {
                  setFiltroNivel(e.target.value as NivelEducativo | 'TODOS');
                  setCurrentPage(1); // Reset a primera página al filtrar
                }}
                className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D]/20 focus:border-[#8D2C1D] transition-all duration-200 hover:border-[#D96924] cursor-pointer bg-white text-[#333333] font-medium"
              >
                <option value="TODOS" className="text-[#333333] font-medium">📚 Todos los niveles</option>
                {NIVELES_EDUCATIVOS.map(nivel => (
                  <option key={nivel.valor} value={nivel.valor} className="text-[#333333] font-medium">
                    {nivel.label === 'Inicial' ? '🎨' : nivel.label === 'Primaria' ? '📖' : '🎓'} {nivel.label}
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
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {cursosPaginados.map(curso => (
                <CursoCard
                  key={curso.id}
                  curso={curso}
                  onEdit={handleEditarCurso}
                  onViewCompetencias={handleVerCompetencias}
                  onDelete={handleEliminarCurso}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border-2 border-[#E9E1C9] rounded-lg hover:border-[#8D2C1D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-[#8D2C1D] text-white'
                          : 'bg-white border-2 border-[#E9E1C9] hover:border-[#8D2C1D]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border-2 border-[#E9E1C9] rounded-lg hover:border-[#8D2C1D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modales */}
      <ModalCurso
        isOpen={showModalCurso}
        onClose={() => {
          setShowModalCurso(false);
          setCursoSeleccionado(undefined);
        }}
        onSuccess={cargarCursos}
        cursoId={cursoSeleccionado}
      />

      <ModalCompetenciasCurso
        isOpen={showModalCompetencias}
        onClose={() => {
          setShowModalCompetencias(false);
          setCursoSeleccionado(undefined);
        }}
        cursoId={cursoSeleccionado!}
      />

      {/* Modal de confirmación con contraseña */}
      {showPasswordModal && (
        <ModalConfirmarPassword
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setCursoAEliminar(null);
          }}
          onConfirm={confirmarEliminacion}
          title="Confirmar Eliminación"
          message="Esta acción eliminará el curso permanentemente. Por seguridad, ingresa tu contraseña para confirmar."
        />
      )}

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
}

// Componente para mostrar cada curso
interface CursoCardProps {
  curso: Curso;
  onEdit: (cursoId: number) => void;
  onViewCompetencias: (cursoId: number) => void;
  onDelete: (cursoId: number) => void;
}

function CursoCard({ curso, onEdit, onViewCompetencias, onDelete }: CursoCardProps) {
  const nivelInfo = NIVELES_EDUCATIVOS.find(n => n.valor === curso.nivel?.nombre);
  
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
        <div className="space-y-2">
          <div className="flex space-x-2">
            <button
              onClick={() => onViewCompetencias(curso.id)}
              className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Ver Competencias
            </button>
            <button
              onClick={() => onEdit(curso.id)}
              className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              Editar
            </button>
          </div>
          <button
            onClick={() => onDelete(curso.id)}
            className="w-full px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
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
