"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DirectorSidebar from '@/components/layout/DirectorSidebar';
import { useAuth } from '@/context/AuthContext';
import { usePermissionCheck } from '@/hooks/usePermissionCheck';
import AdministrativoCard from '@/components/director/AdministrativoCard';
import ModalAdministrativo from '@/components/modals/ModalAdministrativo';
import ModalVerAdministrativo from '@/components/modals/ModalVerAdministrativo';
import ModalConfirmarPassword from '@/components/modals/ModalConfirmarPassword';
import { Administrativo, AdministrativoFormData } from '@/types/administrativo';

function AdministrativosContent() {
  const { user } = useAuth();
  const [administrativos, setAdministrativos] = useState<Administrativo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedAdministrativo, setSelectedAdministrativo] = useState<Administrativo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ administrativo: Administrativo; newStatus: 'activo' | 'inactivo' } | null>(null);
  const [pendingEdit, setPendingEdit] = useState<{ administrativo: Administrativo; formData: any } | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const administrativosPorPagina = 12;

  const router = useRouter();
  
  // Verificar si el usuario es director
  const isDirector = user?.roles?.some(role => role.rol === 'DIRECTOR');
  
  const { permisoVerificado, loading: permissionLoading } = usePermissionCheck({
    permissionType: 'administrativos'
  });

  useEffect(() => {
    if (permisoVerificado) {
      fetchAdministrativos();
    }
  }, [permisoVerificado]);

  const fetchAdministrativos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/administrativos', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al cargar administrativos');
      }

      const data = await response.json();
      setAdministrativos(data);
    } catch (error) {
      console.error('Error al cargar administrativos:', error);
      alert('Error al cargar la lista de administrativos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdministrativo = async (formData: AdministrativoFormData) => {
    try {
      const response = await fetch('/api/administrativos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear administrativo');
      }

      await fetchAdministrativos();
      alert('Administrativo registrado exitosamente');
    } catch (error) {
      console.error('Error al crear administrativo:', error);
      throw error;
    }
  };

  const handleUpdateAdministrativo = async (formData: AdministrativoFormData) => {
    if (!selectedAdministrativo) return;

    // Guardar los datos y mostrar modal de confirmación de contraseña
    setPendingEdit({ administrativo: selectedAdministrativo, formData });
    setIsPasswordModalOpen(true);
    // NO cerrar el modal de edición - debe superponerse
  };

  const executeUpdate = async (formData: AdministrativoFormData) => {
    if (!selectedAdministrativo) return;

    try {
      const response = await fetch(`/api/administrativos/${selectedAdministrativo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar administrativo');
      }

      await fetchAdministrativos();
      alert('Administrativo actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar administrativo:', error);
      throw error;
    }
  };

  const handleToggleStatus = (administrativo: Administrativo) => {
    const newStatus = administrativo.usuarioRol.usuario.estado === 'activo' ? 'inactivo' : 'activo';
    setPendingStatusChange({ administrativo, newStatus });
    setIsPasswordModalOpen(true);
  };

  const handleConfirmStatusChange = async (password: string) => {
    // Si hay una edición pendiente, ejecutarla
    if (pendingEdit) {
      try {
        // Agregar la contraseña a los datos del formulario
        const formDataWithPassword = {
          ...pendingEdit.formData,
          confirmPassword: password
        };

        const response = await fetch(`/api/administrativos/${pendingEdit.administrativo.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formDataWithPassword),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al actualizar administrativo');
        }

        await fetchAdministrativos();
        alert('Administrativo actualizado exitosamente');
        
        // Cerrar modal y limpiar estado
        setIsPasswordModalOpen(false);
        setPendingEdit(null);
        setSelectedAdministrativo(null);
        setIsEditing(false);
        // Cerrar modal de edición después de actualizar exitosamente
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error al actualizar administrativo:', error);
        alert('Error al actualizar el administrativo. Verifica tu contraseña.');
      }
      return;
    }

    // Si hay un cambio de estado pendiente, ejecutarlo
    if (pendingStatusChange) {
      try {
        const response = await fetch(`/api/administrativos/${pendingStatusChange.administrativo.id}/estado`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ 
            estado: pendingStatusChange.newStatus,
            password 
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al cambiar estado');
        }

        await fetchAdministrativos();
        alert(`Administrativo ${pendingStatusChange.newStatus === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
        
        // Cerrar modal inmediatamente después del éxito
        setIsPasswordModalOpen(false);
        setPendingStatusChange(null);
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        alert('Error al cambiar el estado del administrativo');
      }
    }
  };

  const handleView = (administrativo: Administrativo) => {
    setSelectedAdministrativo(administrativo);
    setIsViewModalOpen(true);
  };

  const handleEdit = (administrativo: Administrativo) => {
    setSelectedAdministrativo(administrativo);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAdministrativo(null);
    setIsEditing(false);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedAdministrativo(null);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPendingStatusChange(null);
    setPendingEdit(null);
  };

  // Filtrar administrativos
  const administrativosFiltrados = administrativos.filter(administrativo => {
    const termino = busqueda.toLowerCase();
    const nombres = administrativo.usuarioRol.usuario.nombres?.toLowerCase() || '';
    const apellidos = administrativo.usuarioRol.usuario.apellidos?.toLowerCase() || '';
    const dni = administrativo.usuarioRol.usuario.dni?.toLowerCase() || '';
    const email = administrativo.usuarioRol.usuario.email.toLowerCase();
    const cargo = administrativo.cargo?.toLowerCase() || '';

    return nombres.includes(termino) || 
           apellidos.includes(termino) || 
           dni.includes(termino) || 
           email.includes(termino) ||
           cargo.includes(termino);
  });

  // Paginación
  const totalPaginas = Math.ceil(administrativosFiltrados.length / administrativosPorPagina);
  const indiceInicio = (paginaActual - 1) * administrativosPorPagina;
  const indiceFin = indiceInicio + administrativosPorPagina;
  const administrativosPaginados = administrativosFiltrados.slice(indiceInicio, indiceFin);

  // Reset página cuando cambia la búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

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
    <DirectorSidebar>
      <main className="flex-1 p-8 overflow-auto">
        {/* Header de la página */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold text-[#333333] mb-2" 
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Gestión de Personal Administrativo
          </h1>
          <p className="text-[#666666]">Administra el personal administrativo del colegio</p>
        </div>

        {/* Filtros y Búsqueda - Botón al lado del filtro */}
        <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border-2 border-[#E9E1C9] mb-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#8D2C1D]">
              Buscar personal administrativo
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar por nombre, DNI, email, cargo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 text-[#333333] placeholder-[#999999] bg-white/90"
                />
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setSelectedAdministrativo(null);
                    setIsEditing(false);
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-3 sm:px-6 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white font-semibold rounded-xl hover:from-[#D96924] hover:to-[#8D2C1D] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="hidden sm:inline">Nuevo Administrativo</span>
                  <span className="sm:hidden text-sm">Nuevo</span>
                </button>
                
                {/* Solo mostrar botón de permisos a directores */}
                {isDirector && (
                  <button
                    onClick={() => router.push('/director/permisos')}
                    className="px-3 py-3 sm:px-6 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-semibold rounded-xl hover:from-[#1D4ED8] hover:to-[#2563EB] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="hidden sm:inline">Gestionar Permisos</span>
                    <span className="sm:hidden text-sm">Permisos</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas - Una sola fila en móvil */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mb-6">
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
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-[#8D2C1D]">{administrativos.length}</p>
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
                  {administrativos.filter(a => a.usuarioRol.usuario.estado === 'activo').length}
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
                  {administrativos.filter(a => a.usuarioRol.usuario.estado === 'inactivo').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border-2 border-[#E9E1C9] hover:border-[#8D2C1D] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center text-center sm:text-left">
              <div className="flex-shrink-0 mx-auto sm:mx-0 mb-2 sm:mb-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="sm:ml-3 lg:ml-4">
                <p className="text-xs sm:text-sm font-medium text-[#666666]">Filtrados</p>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-600">{administrativosFiltrados.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Administrativos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8D2C1D]"></div>
            <span className="ml-2 text-[#666666]">Cargando administrativos...</span>
          </div>
        ) : administrativosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-lg border-2 border-[#E9E1C9]">
              <svg className="mx-auto h-16 w-16 text-[#8D2C1D]/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-[#8D2C1D] mb-2">No hay personal administrativo</h3>
              <p className="text-[#666666] mb-4">
                {administrativos.length === 0 
                  ? 'Comienza registrando el primer miembro del personal administrativo.'
                  : 'No se encontraron administrativos con el término de búsqueda actual.'
                }
              </p>
              {administrativos.length === 0 && (
                <button
                  onClick={() => {
                    setSelectedAdministrativo(null);
                    setIsEditing(false);
                    setIsModalOpen(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white font-semibold rounded-xl hover:from-[#D96924] hover:to-[#8D2C1D] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Registrar Primer Administrativo
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {administrativosPaginados.map((administrativo) => (
                <AdministrativoCard
                  key={administrativo.id}
                  administrativo={administrativo}
                  onView={handleView}
                  onEdit={handleEdit}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <button
                  onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                  disabled={paginaActual === 1}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                  <button
                    key={pagina}
                    onClick={() => setPaginaActual(pagina)}
                    className={`px-3 py-2 rounded-lg border transition-colors ${
                      pagina === paginaActual
                        ? 'bg-[#8D2C1D] text-white border-[#8D2C1D]'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pagina}
                  </button>
                ))}
                
                <button
                  onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modales */}
      <ModalAdministrativo
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={isEditing ? handleUpdateAdministrativo : handleCreateAdministrativo}
        administrativo={selectedAdministrativo}
        isEditing={isEditing}
      />

      <ModalVerAdministrativo
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        administrativo={selectedAdministrativo}
        onEdit={handleEdit}
      />

      <ModalConfirmarPassword
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        onConfirm={handleConfirmStatusChange}
        title={pendingEdit ? 'Actualizar Administrativo' : `${pendingStatusChange?.newStatus === 'activo' ? 'Activar' : 'Desactivar'} Administrativo`}
        message={pendingEdit 
          ? 'Para confirmar la actualización de los datos del administrativo, ingresa tu contraseña.'
          : `¿Estás seguro de que deseas ${pendingStatusChange?.newStatus === 'activo' ? 'activar' : 'desactivar'} a este administrativo? Esta acción requiere confirmación con tu contraseña.`
        }
      />
    </DirectorSidebar>
  );
}

export default function AdministrativosPage() {
  return (
    <ProtectedRoute requiredRole={["DIRECTOR", "ADMINISTRATIVO"]}>
      <AdministrativosContent />
    </ProtectedRoute>
  );
}
