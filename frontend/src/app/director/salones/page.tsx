'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardHeader from '@/components/layout/DashboardHeader';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { NivelEducativo } from '@/types/colegio';
import { Salon } from '@/types/salon';
import CrearSalonModal from '@/components/CrearSalonModal';
import ModalSeleccionNivel from '@/components/modals/ModalSeleccionNivel';
import ModalVerSalon from '@/components/modals/ModalVerSalon';
import ModalEditarSalon from '@/components/modals/ModalEditarSalon';
import ModalConfirmarPassword from '@/components/modals/ModalConfirmarPassword';
import SalonInfoCard from '@/components/salon/SalonInfoCard';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  AcademicCapIcon 
} from '@heroicons/react/24/outline';

interface NivelesColegio {
  colegioId: number;
  colegioNombre: string;
  nivelesPermitidos: {
    id: number;
    nombre: string;
    puedeCrearSalones: boolean;
  }[];
}

interface SalonCardProps {
  nivel: NivelEducativo;
  onCrearSalon: (nivel: NivelEducativo) => void;
}

function SalonCard({ nivel, onCrearSalon }: SalonCardProps) {
  const getCardInfo = (nivel: NivelEducativo) => {
    switch (nivel) {
      case NivelEducativo.INICIAL:
        return {
          icon: '👶',
          titulo: 'Inicial',
          descripcion: 'Crear salones de 3, 4 y 5 años',
          color: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
          buttonColor: 'bg-pink-600 hover:bg-pink-700'
        };
      case NivelEducativo.PRIMARIA:
        return {
          icon: '📚',
          titulo: 'Primaria',
          descripcion: 'Crear salones de 1° a 6° grado',
          color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
      case NivelEducativo.SECUNDARIA:
        return {
          icon: '🎓',
          titulo: 'Secundaria',
          descripcion: 'Crear salones de 1° a 5° año',
          color: 'bg-green-50 border-green-200 hover:bg-green-100',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        };
    }
  };

  const info = getCardInfo(nivel);

  return (
    <div className={`p-6 rounded-lg border-2 transition-all duration-200 ${info.color}`}>
      <div className="text-center">
        <div className="text-4xl mb-3">{info.icon}</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{info.titulo}</h3>
        <p className="text-gray-600 mb-4">{info.descripcion}</p>
        
        {/* Estadísticas simuladas */}
        <div className="bg-white rounded-lg p-3 mb-4">
          <div className="text-sm text-gray-500">Salones actuales</div>
          <div className="text-2xl font-bold text-gray-800">0</div>
        </div>
        
        <button
          onClick={() => onCrearSalon(nivel)}
          className={`w-full text-white py-2 px-4 rounded-md transition-colors ${info.buttonColor}`}
        >
          Crear Salón
        </button>
      </div>
    </div>
  );
}

interface EstadoSalones {
  salones: Salon[];
  nivelesColegio: NivelesColegio | null;
  loading: boolean;
  error: string | null;
  busqueda: string;
  filtroNivel: string;
  filtroTurno: string;
  paginaActual: number;
  salonesPorPagina: number;
}

function GestionSalonesContent() {
  const { user, logout } = useAuth();
  
  // Estados principales
  const [estado, setEstado] = useState<EstadoSalones>({
    salones: [],
    nivelesColegio: null,
    loading: true,
    error: null,
    busqueda: '',
    filtroNivel: 'TODOS',
    filtroTurno: 'TODOS',
    paginaActual: 1,
    salonesPorPagina: 12
  });

  // Estados de modales
  const [modalSeleccionNivel, setModalSeleccionNivel] = useState(false);
  const [modalCrearSalon, setModalCrearSalon] = useState(false);
  const [modalVerSalon, setModalVerSalon] = useState(false);
  const [modalEditarSalon, setModalEditarSalon] = useState(false);
  const [modalConfirmarPassword, setModalConfirmarPassword] = useState(false);
  const [nivelSeleccionado, setNivelSeleccionado] = useState<NivelEducativo | null>(null);
  const [salonSeleccionado, setSalonSeleccionado] = useState<Salon | null>(null);
  
  // Estados para confirmación de contraseña
  const [pendingEdit, setPendingEdit] = useState<{ salon: Salon; formData: any } | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setEstado(prev => ({ ...prev, loading: true, error: null }));
      
      // Cargar niveles y salones en paralelo
      const [nivelesResponse, salonesResponse] = await Promise.all([
        fetch('/api/colegios/mi-colegio/niveles', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch('/api/salones', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })
      ]);

      if (!nivelesResponse.ok || !salonesResponse.ok) {
        throw new Error('Error al cargar datos');
      }

      const niveles = await nivelesResponse.json();
      const salones = await salonesResponse.json();

      setEstado(prev => ({
        ...prev,
        nivelesColegio: niveles,
        salones: salones.salones || [],
        loading: false
      }));
    } catch (err) {
      setEstado(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error desconocido',
        loading: false
      }));
    }
  };

  // Funciones para manejar modales
  const abrirModalCrear = () => {
    setModalSeleccionNivel(true);
  };

  const seleccionarNivel = (nivel: NivelEducativo) => {
    setNivelSeleccionado(nivel);
    setModalSeleccionNivel(false);
    setModalCrearSalon(true);
  };

  const cerrarModalCrear = () => {
    setModalCrearSalon(false);
    setNivelSeleccionado(null);
  };

  const handleSalonCreado = async (salonData: any) => {
    // Lógica existente de creación
    try {
      if (salonData.tipo === 'manual') {
        const response = await fetch('/api/salones', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nivel: salonData.nivel,
            grado: salonData.grado,
            seccion: salonData.seccion,
            turno: salonData.turno
          })
        });

        if (!response.ok) throw new Error('Error al crear el salón');
        
        alert('¡Salón creado exitosamente!');
      } else if (salonData.tipo === 'automatico') {
        const response = await fetch('/api/salones/lote', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nivel: salonData.nivel,
            grado: salonData.grado,
            secciones: salonData.secciones,
            turno: salonData.turno
          })
        });

        if (!response.ok) throw new Error('Error al crear los salones');
        
        const result = await response.json();
        alert(`¡${result.resumen?.total || salonData.secciones.length} salones creados exitosamente!`);
      }
      
      cerrarModalCrear();
      cargarDatos(); // Recargar datos
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear el/los salón(es). Por favor intenta de nuevo.');
    }
  };

  // Funciones para gestión de salones
  const verSalon = (salon: Salon) => {
    setSalonSeleccionado(salon);
    setModalVerSalon(true);
  };

  const editarSalon = (salon: Salon) => {
    setSalonSeleccionado(salon);
    setModalEditarSalon(true);
  };

  // Función para manejar la edición con confirmación de contraseña
  const handleEditWithPassword = (salon: Salon, formData: any) => {
    setPendingEdit({ salon, formData });
    setModalEditarSalon(false); // Cerrar modal de edición
    setModalConfirmarPassword(true); // Abrir modal de confirmación
  };

  // Función para confirmar la edición con contraseña
  const handlePasswordConfirm = async (password: string) => {
    if (!pendingEdit) return;

    try {
      const { salon, formData } = pendingEdit;
      const response = await fetch(`/api/salones/${salon.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          password // Para confirmar la operación
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', response.status, errorData);
        throw new Error(`Error ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      console.log('Salón actualizado:', result);
      
      // Recargar datos y cerrar modales
      await cargarDatos();
      alert('¡Salón actualizado exitosamente!');
      
      // Limpiar estados
      setPendingEdit(null);
      setModalConfirmarPassword(false);
      setSalonSeleccionado(null);
      
    } catch (error) {
      console.error('Error completo:', error);
      alert(`Error al actualizar el salón: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const eliminarSalon = async (salon: Salon) => {
    if (!confirm(`¿Estás seguro de eliminar el salón ${salon.grado} - ${salon.seccion}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/salones/${salon.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Error al eliminar el salón');
      
      alert('Salón eliminado exitosamente');
      cargarDatos(); // Recargar datos
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el salón');
    }
  };

  // Filtros y paginación
  const salonesFiltrados = estado.salones.filter(salon => {
    const cumpleBusqueda = estado.busqueda === '' || 
      salon.grado.toLowerCase().includes(estado.busqueda.toLowerCase()) ||
      salon.seccion.toLowerCase().includes(estado.busqueda.toLowerCase());
    
    const cumpleNivel = estado.filtroNivel === 'TODOS' || 
      salon.colegioNivel?.nivel?.nombre === estado.filtroNivel;
    
    const cumpleTurno = estado.filtroTurno === 'TODOS' || 
      salon.turno === estado.filtroTurno;
    
    return cumpleBusqueda && cumpleNivel && cumpleTurno && salon.activo;
  });

  // Paginación
  const totalPaginas = Math.ceil(salonesFiltrados.length / estado.salonesPorPagina);
  const indiceInicio = (estado.paginaActual - 1) * estado.salonesPorPagina;
  const indiceFin = indiceInicio + estado.salonesPorPagina;
  const salonesPaginados = salonesFiltrados.slice(indiceInicio, indiceFin);

  const cambiarPagina = (pagina: number) => {
    setEstado(prev => ({ ...prev, paginaActual: pagina }));
  };

  const handleBusquedaChange = (valor: string) => {
    setEstado(prev => ({ ...prev, busqueda: valor, paginaActual: 1 }));
  };

  if (estado.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando salones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9] flex flex-col">
      {/* Header Reutilizable */}
      <DashboardHeader 
        title="Gestión de Salones"
        userName={user?.nombres && user?.apellidos ? `${user.nombres} ${user.apellidos}` : undefined}
        userEmail={user?.email}
        onLogout={logout}
      />


      {/* Contenido Principal */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        
        {/* Header con botón crear - Desktop */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#8D2C1D]">Administra los salones</h2>
            <p className="text-[#666666]">Gestiona los salones de tu institución</p>
          </div>
          <button
            onClick={abrirModalCrear}
            className="px-6 py-3 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white rounded-xl hover:from-[#D96924] hover:to-[#8D2C1D] focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <PlusIcon className="w-5 h-5" />
            Crear Salón
          </button>
        </div>

        {/* Filtros - Optimizados para móvil */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 lg:p-6 mb-4 lg:mb-6 border border-[#E9E1C9]">
          <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-4">
            
            {/* Fila 1: Búsqueda + Botón Crear (móvil) */}
            <div className="lg:col-span-2">
              <label className="block text-xs lg:text-sm font-semibold text-[#8D2C1D] mb-1 lg:mb-2">
                Buscar Salón
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#666666]" />
                  <input
                    type="text"
                    value={estado.busqueda}
                    onChange={(e) => handleBusquedaChange(e.target.value)}
                    placeholder="Buscar por grado o sección..."
                    className="w-full pl-9 pr-3 py-2 lg:py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 bg-white/90 text-sm"
                  />
                </div>
                {/* Botón Crear - Solo móvil */}
                <button
                  onClick={abrirModalCrear}
                  className="lg:hidden px-3 py-2 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white rounded-xl hover:from-[#D96924] hover:to-[#8D2C1D] focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] transition-all duration-200 flex items-center gap-1 font-semibold shadow-lg"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="text-xs">Crear</span>
                </button>
              </div>
            </div>

            {/* Fila 2: Nivel y Turno en una sola fila (móvil) */}
            <div className="grid grid-cols-2 gap-2 lg:contents">
              {/* Filtro por Nivel */}
              <div>
                <label className="block text-xs lg:text-sm font-semibold text-[#8D2C1D] mb-1 lg:mb-2">
                  Nivel
                </label>
                <select
                  value={estado.filtroNivel}
                  onChange={(e) => setEstado(prev => ({ ...prev, filtroNivel: e.target.value, paginaActual: 1 }))}
                  className="w-full px-2 lg:px-3 py-2 lg:py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 bg-white/90 text-xs lg:text-sm"
                >
                  <option value="TODOS">Todos</option>
                  <option value="INICIAL">Inicial</option>
                  <option value="PRIMARIA">Primaria</option>
                  <option value="SECUNDARIA">Secundaria</option>
                </select>
              </div>

              {/* Filtro por Turno */}
              <div>
                <label className="block text-xs lg:text-sm font-semibold text-[#8D2C1D] mb-1 lg:mb-2">
                  Turno
                </label>
                <select
                  value={estado.filtroTurno}
                  onChange={(e) => setEstado(prev => ({ ...prev, filtroTurno: e.target.value, paginaActual: 1 }))}
                  className="w-full px-2 lg:px-3 py-2 lg:py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 bg-white/90 text-xs lg:text-sm"
                >
                  <option value="TODOS">Todos</option>
                  <option value="MAÑANA">Mañana</option>
                  <option value="TARDE">Tarde</option>
                  <option value="NOCHE">Noche</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas - Una sola fila compacta */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 lg:p-4 mb-4 lg:mb-6 border border-[#E9E1C9] shadow-lg">
          <div className="grid grid-cols-4 gap-2 lg:gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <div className="p-1.5 lg:p-2 bg-blue-100 rounded-lg">
                  <AcademicCapIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Total</p>
              <p className="text-lg lg:text-xl font-bold text-gray-900">{estado.salones.length}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <div className="p-1.5 lg:p-2 bg-green-100 rounded-lg">
                  <AcademicCapIcon className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                </div>
              </div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Activos</p>
              <p className="text-lg lg:text-xl font-bold text-gray-900">{estado.salones.filter(s => s.activo).length}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <div className="p-1.5 lg:p-2 bg-orange-100 rounded-lg">
                  <AdjustmentsHorizontalIcon className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" />
                </div>
              </div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Filtrados</p>
              <p className="text-lg lg:text-xl font-bold text-gray-900">{salonesFiltrados.length}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <div className="p-1.5 lg:p-2 bg-purple-100 rounded-lg">
                  <AcademicCapIcon className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Página</p>
              <p className="text-lg lg:text-xl font-bold text-gray-900">{salonesPaginados.length}</p>
            </div>
          </div>
        </div>

        {/* Lista de Salones */}
        {estado.error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800">{estado.error}</p>
            <button
              onClick={cargarDatos}
              className="mt-2 text-red-600 hover:text-red-800 font-medium"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {salonesFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#E9E1C9]">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay salones</h3>
            <p className="mt-1 text-sm text-gray-500">
              {estado.busqueda || estado.filtroNivel !== 'TODOS' || estado.filtroTurno !== 'TODOS'
                ? 'No se encontraron salones con los filtros aplicados'
                : 'Comienza creando salones para tu colegio'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Grid responsive: 2 columnas en móvil, más en desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6">
              {salonesPaginados.map((salon) => (
                <SalonInfoCard
                  key={salon.id}
                  salon={salon}
                  onVer={verSalon}
                  onEditar={editarSalon}
                  onEliminar={eliminarSalon}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => cambiarPagina(estado.paginaActual - 1)}
                  disabled={estado.paginaActual === 1}
                  className="px-4 py-2 bg-white/90 backdrop-blur-sm border-2 border-[#E9E1C9] rounded-xl hover:border-[#8D2C1D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-[#8D2C1D] font-medium"
                >
                  ← Anterior
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                    <button
                      key={pagina}
                      onClick={() => cambiarPagina(pagina)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                        estado.paginaActual === pagina
                          ? 'bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white shadow-lg'
                          : 'bg-white/90 backdrop-blur-sm border-2 border-[#E9E1C9] hover:border-[#8D2C1D] text-[#8D2C1D]'
                      }`}
                    >
                      {pagina}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => cambiarPagina(estado.paginaActual + 1)}
                  disabled={estado.paginaActual === totalPaginas}
                  className="px-4 py-2 bg-white/90 backdrop-blur-sm border-2 border-[#E9E1C9] rounded-xl hover:border-[#8D2C1D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-[#8D2C1D] font-medium"
                >
                  Siguiente →
                </button>
              </div>
            )}

            {/* Información de paginación */}
            <div className="text-center mt-4 text-[#666666]">
              Mostrando {indiceInicio + 1} - {Math.min(indiceFin, salonesFiltrados.length)} de {salonesFiltrados.length} salones
              {(estado.busqueda || estado.filtroNivel !== 'TODOS' || estado.filtroTurno !== 'TODOS') && 
                ` (filtrados de ${estado.salones.length} total)`
              }
            </div>
          </>
        )}
      </div>

      {/* Footer Reutilizable */}
      <DashboardFooter />

      {/* Modales */}
      <ModalSeleccionNivel
        isOpen={modalSeleccionNivel}
        onClose={() => setModalSeleccionNivel(false)}
        niveles={estado.nivelesColegio?.nivelesPermitidos || []}
        onSeleccionarNivel={seleccionarNivel}
      />

      {modalCrearSalon && nivelSeleccionado && (
        <CrearSalonModal
          nivel={nivelSeleccionado}
          onClose={cerrarModalCrear}
          onSubmit={handleSalonCreado}
        />
      )}

      <ModalVerSalon
        isOpen={modalVerSalon}
        onClose={() => setModalVerSalon(false)}
        salon={salonSeleccionado}
      />

      <ModalEditarSalon
        isOpen={modalEditarSalon}
        onClose={() => setModalEditarSalon(false)}
        salon={salonSeleccionado}
        onSuccess={handleEditWithPassword}
      />

      <ModalConfirmarPassword
        isOpen={modalConfirmarPassword}
        onClose={() => {
          setModalConfirmarPassword(false);
          setPendingEdit(null);
        }}
        onConfirm={handlePasswordConfirm}
        title="Confirmar Edición de Salón"
        message="Para confirmar la actualización de los datos del salón, ingresa tu contraseña."
      />
    </div>
  );
}

export default function GestionSalones() {
  return (
    <ProtectedRoute requiredRole={["DIRECTOR", "ADMINISTRATIVO"]}>
      <GestionSalonesContent />
    </ProtectedRoute>
  );
}
