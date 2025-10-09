'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { useAuth } from '@/context/AuthContext';
import ProfesorCard from '@/components/director/ProfesorCard';
import ModalProfesor from '@/components/director/ModalProfesor';
import ModalVerProfesor from '@/components/director/ModalVerProfesor';
import ModalConfirmarPassword from '@/components/modals/ModalConfirmarPassword';
import { Profesor } from '@/types/profesor';
import { usePermissionCheck } from '@/hooks/usePermissionCheck';

const ITEMS_PER_PAGE = 12;

function GestionProfesoresContent() {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modales
  const [showModalProfesor, setShowModalProfesor] = useState(false);
  const [showModalVer, setShowModalVer] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState<Profesor | undefined>();
  const [profesorParaToggle, setProfesorParaToggle] = useState<Profesor | null>(null);

  const router = useRouter();
  const { logout } = useAuth();

  const { permisoVerificado, loading: permissionLoading } = usePermissionCheck({
    permissionType: 'profesores'
  });

  // Cargar profesores
  const cargarProfesores = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/profesores', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al cargar profesores');
      }

      const data = await response.json();
      setProfesores(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar profesores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (permisoVerificado) {
      cargarProfesores();
    }
  }, [permisoVerificado]);

  // Filtrar profesores
  const profesoresFiltrados = profesores.filter(profesor => {
    const termino = busqueda.toLowerCase();
    const nombres = profesor.usuarioRol.usuario.nombres?.toLowerCase() || '';
    const apellidos = profesor.usuarioRol.usuario.apellidos?.toLowerCase() || '';
    const dni = profesor.usuarioRol.usuario.dni?.toLowerCase() || '';
    const email = profesor.usuarioRol.usuario.email.toLowerCase();
    const especialidad = profesor.especialidad?.toLowerCase() || '';

    return nombres.includes(termino) || 
           apellidos.includes(termino) || 
           dni.includes(termino) || 
           email.includes(termino) ||
           especialidad.includes(termino);
  });

  // Paginación
  const totalPages = Math.ceil(profesoresFiltrados.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const profesoresPaginados = profesoresFiltrados.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handlers
  const handleNuevoProfesor = () => {
    setProfesorSeleccionado(undefined);
    setShowModalProfesor(true);
  };

  const handleEditarProfesor = (profesor: Profesor) => {
    setProfesorSeleccionado(profesor);
    setShowModalProfesor(true);
  };

  const handleVerProfesor = (profesor: Profesor) => {
    setProfesorSeleccionado(profesor);
    setShowModalVer(true);
  };

  const handleToggleStatus = (profesor: Profesor) => {
    setProfesorParaToggle(profesor);
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!profesorParaToggle) return;

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

      // Cambiar estado del usuario
      const newStatus = profesorParaToggle.usuarioRol.usuario.estado === 'activo' ? 'inactivo' : 'activo';
      
      const response = await fetch(`http://localhost:3001/api/auth/usuarios/${profesorParaToggle.usuarioRol.usuario.id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estado: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Error al cambiar el estado del profesor');
      }

      alert(`Profesor ${newStatus === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
      setShowPasswordModal(false);
      setProfesorParaToggle(null);
      cargarProfesores();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error al cambiar el estado');
    }
  };

  const handleSuccess = () => {
    cargarProfesores();
  };

  if (permissionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D] mx-auto"></div>
          <p className="mt-4 text-[#666666]">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!permisoVerificado) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9]">
      <DashboardHeader 
        title="Gestión de Profesores"
        onLogout={logout}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#8D2C1D]">Gestión de Profesores</h1>
            <p className="mt-2 text-[#666666]">
              Administra los profesores de tu institución educativa
            </p>
          </div>
        </div>

        {/* Estadísticas - Una sola fila en móvil */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 mb-6">
          <div className="bg-white/95 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border-2 border-[#E9E1C9] hover:border-[#8D2C1D] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center text-center sm:text-left">
              <div className="flex-shrink-0 mx-auto sm:mx-0 mb-2 sm:mb-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#8D2C1D] to-[#D96924] rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="sm:ml-3 lg:ml-4">
                <p className="text-xs sm:text-sm font-medium text-[#666666]">Total</p>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-[#8D2C1D]">{profesores.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border-2 border-[#E9E1C9] hover:border-[#8D2C1D] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center text-center sm:text-left">
              <div className="flex-shrink-0 mx-auto sm:mx-0 mb-2 sm:mb-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="sm:ml-3 lg:ml-4">
                <p className="text-xs sm:text-sm font-medium text-[#666666]">Activos</p>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600">
                  {profesores.filter(p => p.usuarioRol.usuario.estado === 'activo').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border-2 border-[#E9E1C9] hover:border-[#8D2C1D] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center text-center sm:text-left">
              <div className="flex-shrink-0 mx-auto sm:mx-0 mb-2 sm:mb-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="sm:ml-3 lg:ml-4">
                <p className="text-xs sm:text-sm font-medium text-[#666666]">Inactivos</p>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-red-600">
                  {profesores.filter(p => p.usuarioRol.usuario.estado === 'inactivo').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y Búsqueda - Botón al lado del filtro en móvil */}
        <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border-2 border-[#E9E1C9] mb-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#8D2C1D]">
              Buscar profesores
            </label>
            <div className="flex gap-2 sm:gap-3">
              <div className="flex-1 relative group">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Buscar por nombre, DNI, email..."
                  className="w-full pl-11 pr-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D]/20 focus:border-[#8D2C1D] transition-all duration-200 group-hover:border-[#D96924] placeholder:text-[#999999] text-[#333333]"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-[#666666] group-hover:text-[#8D2C1D] transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <button
                onClick={handleNuevoProfesor}
                className="flex-shrink-0 group relative inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
              >
                <svg className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Nuevo Profesor</span>
                <span className="sm:hidden">Nuevo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Profesores */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 mb-2">Error al cargar profesores</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={cargarProfesores}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : profesoresFiltrados.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#E9E1C9] p-12 text-center">
            <svg className="w-16 h-16 text-[#8D2C1D] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-bold text-[#8D2C1D] mb-2">
              {busqueda ? 'No se encontraron profesores' : 'No hay profesores registrados'}
            </h3>
            <p className="text-[#666666] mb-6">
              {busqueda 
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza registrando tu primer profesor'
              }
            </p>
            {!busqueda && (
              <button
                onClick={handleNuevoProfesor}
                className="px-6 py-3 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
              >
                Registrar Primer Profesor
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Grid de profesores - 2 columnas en móvil */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
              {profesoresPaginados.map((profesor) => (
                <ProfesorCard
                  key={profesor.id}
                  profesor={profesor}
                  onEdit={handleEditarProfesor}
                  onView={handleVerProfesor}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border-2 border-[#E9E1C9] text-[#666666] rounded-lg hover:border-[#8D2C1D] hover:text-[#8D2C1D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-[#8D2C1D] text-white'
                          : 'bg-white border-2 border-[#E9E1C9] text-[#666666] hover:border-[#8D2C1D] hover:text-[#8D2C1D]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border-2 border-[#E9E1C9] text-[#666666] rounded-lg hover:border-[#8D2C1D] hover:text-[#8D2C1D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}

      </main>

      <DashboardFooter />

      {/* Modales */}
      {showModalProfesor && (
        <ModalProfesor
          isOpen={showModalProfesor}
          onClose={() => {
            setShowModalProfesor(false);
            setProfesorSeleccionado(undefined);
          }}
          onSuccess={handleSuccess}
          profesor={profesorSeleccionado}
        />
      )}

      {showModalVer && profesorSeleccionado && (
        <ModalVerProfesor
          isOpen={showModalVer}
          onClose={() => {
            setShowModalVer(false);
            setProfesorSeleccionado(undefined);
          }}
          profesor={profesorSeleccionado}
        />
      )}

      {showPasswordModal && (
        <ModalConfirmarPassword
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setProfesorParaToggle(null);
          }}
          onConfirm={handlePasswordConfirm}
          title="Confirmar Cambio de Estado"
          message={`¿Estás seguro de ${profesorParaToggle?.usuarioRol.usuario.estado === 'activo' ? 'desactivar' : 'activar'} a este profesor? Esta acción requiere tu contraseña por seguridad.`}
        />
      )}
    </div>
  );
}

export default function GestionProfesores() {
  return (
    <ProtectedRoute requiredRole={["DIRECTOR", "ADMINISTRATIVO"]}>
      <GestionProfesoresContent />
    </ProtectedRoute>
  );
}
