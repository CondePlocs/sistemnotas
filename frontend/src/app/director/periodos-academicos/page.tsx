'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
import ModalPeriodoAcademico from '@/components/modals/ModalPeriodoAcademico';
import ModalVerPeriodoAcademico from '@/components/modals/ModalVerPeriodoAcademico';
import ModalConfirmarPassword from '@/components/modals/ModalConfirmarPassword';
import { useAuth } from '@/context/AuthContext';
import { 
  PeriodoAcademico, 
  PeriodoAcademicoFormData, 
  ListaPeriodosResponse,
  PeriodoAcademicoResponse 
} from '@/types/periodo-academico';
import { PlusIcon, CalendarIcon, CheckCircleIcon, EyeIcon, PencilIcon, XCircleIcon } from '@heroicons/react/24/outline';

function PeriodosAcademicosContent() {
  const router = useRouter();
  const { logout } = useAuth();
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedPeriodo, setSelectedPeriodo] = useState<PeriodoAcademico | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [pendingAction, setPendingAction] = useState<{type: 'activate' | 'deactivate' | 'edit', periodo: PeriodoAcademico, formData?: PeriodoAcademicoFormData} | null>(null);
  
  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const periodosPorPagina = 8;

  // Cargar períodos
  const cargarPeriodos = async () => {
    try {
      const response = await fetch('/api/periodos-academicos', {
        credentials: 'include'
      });

      if (response.ok) {
        const data: ListaPeriodosResponse = await response.json();
        setPeriodos(data.data.periodos);
      } else {
        setError('Error al cargar períodos académicos');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPeriodos();
  }, []);

  // Crear período
  const handleCrearPeriodo = async (formData: PeriodoAcademicoFormData) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/periodos-academicos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data: PeriodoAcademicoResponse = await response.json();
        setPeriodos(prev => [data.data, ...prev]);
        setModalOpen(false);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al crear período académico');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  // Manejar edición
  const handleEdit = (periodo: PeriodoAcademico) => {
    setSelectedPeriodo(periodo);
    setIsEditing(true);
    setModalOpen(true);
  };

  // Manejar ver detalles
  const handleView = (periodo: PeriodoAcademico) => {
    setSelectedPeriodo(periodo);
    setIsViewModalOpen(true);
  };

  // Manejar activar/desactivar
  const handleToggleActive = (periodo: PeriodoAcademico) => {
    setPendingAction({
      type: periodo.activo ? 'deactivate' : 'activate',
      periodo
    });
    setIsPasswordModalOpen(true);
  };

  // Confirmar acción con contraseña
  const handlePasswordConfirm = async (password: string) => {
    if (!pendingAction) return;

    try {
      let response;
      
      if (pendingAction.type === 'activate') {
        response = await fetch(`/api/periodos-academicos/${pendingAction.periodo.id}/activar`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ password })
        });
      } else if (pendingAction.type === 'edit' && pendingAction.formData) {
        response = await fetch(`/api/periodos-academicos/${pendingAction.periodo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ...pendingAction.formData, password })
        });
      }

      if (response?.ok) {
        await cargarPeriodos();
        alert(`Período ${pendingAction.type === 'activate' ? 'activado' : pendingAction.type === 'edit' ? 'actualizado' : 'desactivado'} exitosamente`);
        
        if (pendingAction.type === 'edit') {
          setModalOpen(false);
          setSelectedPeriodo(null);
          setIsEditing(false);
        }
      } else {
        const errorData = await response?.json();
        setError(errorData?.message || 'Error en la operación');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    } finally {
      setIsPasswordModalOpen(false);
      setPendingAction(null);
    }
  };

  // Manejar actualización
  const handleUpdatePeriodo = async (formData: PeriodoAcademicoFormData) => {
    if (!selectedPeriodo) return;
    
    setPendingAction({
      type: 'edit',
      periodo: selectedPeriodo,
      formData
    });
    setIsPasswordModalOpen(true);
  };

  // Filtrar períodos
  const periodosFiltrados = periodos.filter(periodo => {
    const termino = busqueda.toLowerCase();
    return (
      periodo.nombre.toLowerCase().includes(termino) ||
      periodo.tipo.toLowerCase().includes(termino) ||
      periodo.anioAcademico.toString().includes(termino)
    );
  });

  // Calcular paginación
  const totalPaginas = Math.ceil(periodosFiltrados.length / periodosPorPagina);
  const indiceInicio = (paginaActual - 1) * periodosPorPagina;
  const indiceFin = indiceInicio + periodosPorPagina;
  const periodosPaginados = periodosFiltrados.slice(indiceInicio, indiceFin);

  // Resetear página cuando cambia la búsqueda
  const handleBusquedaChange = (valor: string) => {
    setBusqueda(valor);
    setPaginaActual(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D] mx-auto"></div>
          <p className="mt-4 text-[#666666]">Cargando períodos académicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9]">
      <DashboardHeader 
        title="Gestión de Períodos Académicos"
        onLogout={logout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-3 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg border-2 border-[#E9E1C9] hover:border-[#8D2C1D] transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 text-[#8D2C1D]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[#8D2C1D]">Períodos Académicos</h1>
              <p className="mt-2 text-[#666666]">
                Gestiona los períodos académicos de tu institución educativa
              </p>
            </div>
          </div>
        </div>

        {/* Búsqueda y Nuevo Período */}
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-2 border-[#E9E1C9] mb-6">
          <label className="block text-sm font-semibold text-[#8D2C1D] mb-3">
            Buscar períodos académicos
          </label>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nombre, tipo, año..."
                value={busqueda}
                onChange={(e) => handleBusquedaChange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 text-[#333333] placeholder-[#999999] bg-white/90"
              />
            </div>
            <button
              onClick={() => {
                setSelectedPeriodo(null);
                setIsEditing(false);
                setModalOpen(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white rounded-xl hover:from-[#D96924] hover:to-[#8D2C1D] focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <PlusIcon className="w-5 h-5" />
              Nuevo Período
            </button>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50/90 backdrop-blur-sm border-2 border-red-200 rounded-2xl p-4 shadow-lg">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline font-medium"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Períodos List */}
        {periodosFiltrados.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#E9E1C9] p-12 text-center">
            <CalendarIcon className="mx-auto h-16 w-16 text-[#8D2C1D]/50 mb-4" />
            <h3 className="text-xl font-bold text-[#8D2C1D] mb-2">
              {busqueda ? 'No se encontraron períodos' : 'No hay períodos académicos'}
            </h3>
            <p className="text-[#666666] mb-6">
              {busqueda 
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza creando tu primer período académico'
              }
            </p>
            {!busqueda && (
              <button
                onClick={() => {
                  setSelectedPeriodo(null);
                  setIsEditing(false);
                  setModalOpen(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white rounded-xl hover:from-[#D96924] hover:to-[#8D2C1D] focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 mx-auto"
              >
                <PlusIcon className="w-5 h-5" />
                Crear Primer Período
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {periodosPaginados.map((periodo) => (
              <div
                key={periodo.id}
                className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-4 md:p-6 ${
                  periodo.activo 
                    ? 'border-green-500 bg-gradient-to-br from-green-50 to-white' 
                    : 'border-[#E9E1C9] hover:border-[#8D2C1D]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#8D2C1D] truncate">
                    {periodo.nombre}
                  </h3>
                  {periodo.activo && (
                    <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 ml-2" />
                  )}
                </div>
                
                <div className="space-y-2 text-sm text-[#666666] mb-4">
                  <p><span className="font-semibold text-[#8D2C1D]">Tipo:</span> {periodo.tipo}</p>
                  <p><span className="font-semibold text-[#8D2C1D]">Año:</span> {periodo.anioAcademico}</p>
                  <p><span className="font-semibold text-[#8D2C1D]">Orden:</span> {['I', 'II', 'III', 'IV', 'V', 'VI'][periodo.orden - 1]}</p>
                  <p><span className="font-semibold text-[#8D2C1D]">Inicio:</span> {new Date(periodo.fechaInicio).toLocaleDateString('es-PE')}</p>
                  <p><span className="font-semibold text-[#8D2C1D]">Fin:</span> {new Date(periodo.fechaFin).toLocaleDateString('es-PE')}</p>
                </div>

                {/* Botones de acción */}
                <div className="space-y-2">
                  {/* Primera fila - Ver y Editar */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(periodo)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex items-center justify-center gap-1 text-xs font-medium shadow-md hover:shadow-lg"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Ver
                    </button>
                    <button
                      onClick={() => handleEdit(periodo)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 flex items-center justify-center gap-1 text-xs font-medium shadow-md hover:shadow-lg"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Editar
                    </button>
                  </div>
                  
                  {/* Segunda fila - Activar/Desactivar */}
                  {periodo.activo ? (
                    <div className="w-full bg-gradient-to-r from-green-100 to-green-200 text-green-800 py-2 px-4 rounded-lg text-xs text-center font-bold border border-green-300">
                      ✓ PERÍODO ACTIVO
                    </div>
                  ) : (
                    <button
                      onClick={() => handleToggleActive(periodo)}
                      className="w-full px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 flex items-center justify-center gap-1 text-xs font-medium shadow-md hover:shadow-lg"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Activar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {periodosFiltrados.length > 0 && totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="px-4 py-2 bg-white/90 backdrop-blur-sm border-2 border-[#E9E1C9] rounded-xl hover:border-[#8D2C1D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-[#8D2C1D] font-medium"
            >
              ← Anterior
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                <button
                  key={pagina}
                  onClick={() => setPaginaActual(pagina)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    paginaActual === pagina
                      ? 'bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white shadow-lg'
                      : 'bg-white/90 backdrop-blur-sm border-2 border-[#E9E1C9] hover:border-[#8D2C1D] text-[#8D2C1D]'
                  }`}
                >
                  {pagina}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              className="px-4 py-2 bg-white/90 backdrop-blur-sm border-2 border-[#E9E1C9] rounded-xl hover:border-[#8D2C1D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-[#8D2C1D] font-medium"
            >
              Siguiente →
            </button>
          </div>
        )}

        {/* Información de paginación */}
        {periodosFiltrados.length > 0 && (
          <div className="text-center mt-4 text-[#666666]">
            Mostrando {indiceInicio + 1} - {Math.min(indiceFin, periodosFiltrados.length)} de {periodosFiltrados.length} períodos
            {busqueda && ` (filtrados de ${periodos.length} total)`}
          </div>
        )}
      </main>

      <DashboardFooter />

      {/* Modales */}
      <ModalPeriodoAcademico
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedPeriodo(null);
          setIsEditing(false);
        }}
        onSubmit={isEditing ? handleUpdatePeriodo : handleCrearPeriodo}
        periodo={isEditing ? selectedPeriodo : null}
        title={isEditing ? 'Editar Período Académico' : 'Nuevo Período Académico'}
        loading={submitting}
      />

      <ModalVerPeriodoAcademico
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPeriodo(null);
        }}
        periodo={selectedPeriodo}
      />

      <ModalConfirmarPassword
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPendingAction(null);
        }}
        onConfirm={handlePasswordConfirm}
        title={pendingAction?.type === 'activate' ? 'Activar Período' : pendingAction?.type === 'edit' ? 'Confirmar Edición' : 'Desactivar Período'}
        message={pendingAction?.type === 'activate' 
          ? 'Para activar este período académico (y desactivar el actual), ingresa tu contraseña.' 
          : pendingAction?.type === 'edit'
          ? 'Para confirmar los cambios en el período académico, ingresa tu contraseña.'
          : 'Para desactivar este período académico, ingresa tu contraseña.'
        }
      />
    </div>
  );
}

export default function PeriodosAcademicosPage() {
  return (
    <ProtectedRoute requiredRole="DIRECTOR">
      <PeriodosAcademicosContent />
    </ProtectedRoute>
  );
}
