'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DirectorSidebar from '@/components/layout/DirectorSidebar';
import { SalonConAlumnos } from '@/types/salon-alumnos';
import { Salon, SalonConNivel } from '@/types/salon';
import { OPCIONES_NIVELES_EDUCATIVOS } from '@/types/colegio';
import SalonesPorNivel from '@/components/salon/SalonesPorNivel';
import ModalAsignacionAlumnos from '@/components/modals/ModalAsignacionAlumnos';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';

interface EstadoGestion {
  salones: Salon[];
  salonSeleccionado: SalonConNivel | null;
  modalAsignacionAbierto: boolean;
  cargando: boolean;
  error: string | null;
  filtroNivel: string;
  busqueda: string;
  refreshTrigger: number;
  // Paginación
  paginaActual: number;
  salonesPorPagina: number;
  totalSalones: number;
}

function GestionSalonesPageContent() {
  const { user } = useAuth();
  const [estado, setEstado] = useState<EstadoGestion>({
    salones: [],
    salonSeleccionado: null,
    modalAsignacionAbierto: false,
    cargando: true,
    error: null,
    filtroNivel: 'TODOS',
    busqueda: '',
    refreshTrigger: 0,
    // Paginación
    paginaActual: 1,
    salonesPorPagina: 20,
    totalSalones: 0
  });

  // Cargar salones del colegio
  useEffect(() => {
    cargarSalones();
  }, []);

  const cargarSalones = async () => {
    try {
      setEstado(prev => ({ ...prev, cargando: true, error: null }));
      
      const response = await fetch('/api/salones', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar salones');
      }

      const data = await response.json();
      setEstado(prev => ({ 
        ...prev, 
        salones: data.salones || [],
        cargando: false 
      }));
    } catch (error) {
      console.error('Error:', error);
      setEstado(prev => ({ 
        ...prev, 
        error: 'Error al cargar los salones',
        cargando: false 
      }));
    }
  };

  // Filtrar salones y agregar campo nivel para compatibilidad
  const salonesFiltrados = estado.salones
    .map(salon => ({
      ...salon,
      nivel: salon.colegioNivel?.nivel?.nombre || 'SIN_NIVEL'
    }))
    .filter(salon => {
      const cumpleFiltroNivel = estado.filtroNivel === 'TODOS' || salon.nivel === estado.filtroNivel;
      const cumpleBusqueda = estado.busqueda === '' || 
        salon.grado.toLowerCase().includes(estado.busqueda.toLowerCase()) ||
        salon.seccion.toLowerCase().includes(estado.busqueda.toLowerCase());
      
      return cumpleFiltroNivel && cumpleBusqueda && salon.activo;
    });

  // Paginación
  const totalPaginas = Math.ceil(salonesFiltrados.length / estado.salonesPorPagina);
  const indiceInicio = (estado.paginaActual - 1) * estado.salonesPorPagina;
  const indiceFin = indiceInicio + estado.salonesPorPagina;
  const salonesPaginados = salonesFiltrados.slice(indiceInicio, indiceFin);

  // Agrupar salones paginados por nivel
  const salonesPorNivel = salonesPaginados.reduce((acc, salon) => {
    const nivelNombre = salon.nivel;
    if (!acc[nivelNombre]) {
      acc[nivelNombre] = [];
    }
    acc[nivelNombre].push(salon);
    return acc;
  }, {} as Record<string, SalonConNivel[]>);

  // Funciones de paginación
  const cambiarPagina = (nuevaPagina: number) => {
    setEstado(prev => ({ ...prev, paginaActual: nuevaPagina }));
  };

  const paginaAnterior = () => {
    if (estado.paginaActual > 1) {
      cambiarPagina(estado.paginaActual - 1);
    }
  };

  const paginaSiguiente = () => {
    if (estado.paginaActual < totalPaginas) {
      cambiarPagina(estado.paginaActual + 1);
    }
  };

  const abrirModalAsignacion = (salon: SalonConNivel) => {
    setEstado(prev => ({
      ...prev,
      salonSeleccionado: salon,
      modalAsignacionAbierto: true
    }));
  };

  const cerrarModalAsignacion = () => {
    setEstado(prev => ({
      ...prev,
      salonSeleccionado: null,
      modalAsignacionAbierto: false
    }));
  };

  const onAsignacionExitosa = () => {
    // Incrementar refreshTrigger para forzar actualización de tarjetas
    setEstado(prev => ({ 
      ...prev, 
      refreshTrigger: prev.refreshTrigger + 1,
      modalAsignacionAbierto: false,
      salonSeleccionado: null
    }));
  };

  if (estado.cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D] mx-auto"></div>
          <p className="mt-4 text-[#8D2C1D] font-medium">Cargando salones...</p>
        </div>
      </div>
    );
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
            Gestión de Alumnos por Salón
          </h1>
          <p className="text-[#666666]">Asigna y gestiona alumnos en los salones del colegio</p>
        </div>

        <div>
        {/* Estadísticas - 1 fila en móvil */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-4 border border-[#E9E1C9] shadow-lg">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left">
              <div className="p-1 sm:p-2 bg-blue-100 rounded-lg mb-1 sm:mb-0">
                <BuildingOffice2Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{estado.salones.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-4 border border-[#E9E1C9] shadow-lg">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left">
              <div className="p-1 sm:p-2 bg-green-100 rounded-lg mb-1 sm:mb-0">
                <AcademicCapIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Filtrados</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{salonesFiltrados.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-4 border border-[#E9E1C9] shadow-lg">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left">
              <div className="p-1 sm:p-2 bg-purple-100 rounded-lg mb-1 sm:mb-0">
                <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Activos</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {salonesFiltrados.filter(s => s.activo).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-4 border border-[#E9E1C9] shadow-lg">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left">
              <div className="p-1 sm:p-2 bg-orange-100 rounded-lg mb-1 sm:mb-0">
                <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <div className="sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Niveles</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{Object.keys(salonesPorNivel).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros mejorados - Sin botón global */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 border border-[#E9E1C9] shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filtro por nivel */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[#8D2C1D] mb-2">
                Filtrar por Nivel
              </label>
              <select
                value={estado.filtroNivel}
                onChange={(e) => setEstado(prev => ({ ...prev, filtroNivel: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 bg-white/90 text-[#333333]"
              >
                <option value="TODOS">Todos los niveles</option>
                {OPCIONES_NIVELES_EDUCATIVOS.map(nivel => (
                  <option key={nivel.value} value={nivel.value}>
                    {nivel.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Búsqueda */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[#8D2C1D] mb-2">
                Buscar Salón
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#666666]" />
                <input
                  type="text"
                  value={estado.busqueda}
                  onChange={(e) => setEstado(prev => ({ ...prev, busqueda: e.target.value }))}
                  placeholder="Buscar por grado o sección..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 bg-white/90 text-[#333333] placeholder-[#999999]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {estado.error && (
          <div className="bg-red-50/90 backdrop-blur-sm border-2 border-red-200 rounded-2xl p-4 mb-6 shadow-lg">
            <p className="text-red-800 font-medium">{estado.error}</p>
            <button
              onClick={cargarSalones}
              className="mt-2 text-red-600 hover:text-red-800 font-semibold transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Salones agrupados por nivel - Componente separado */}
        <SalonesPorNivel 
          salonesPorNivel={salonesPorNivel}
          onAsignarAlumnos={abrirModalAsignacion}
          refreshTrigger={estado.refreshTrigger}
        />

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-[#E9E1C9] shadow-lg mt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Información de paginación */}
              <div className="text-sm text-[#666666]">
                Mostrando {indiceInicio + 1} - {Math.min(indiceFin, salonesFiltrados.length)} de {salonesFiltrados.length} salones
              </div>

              {/* Controles de paginación */}
              <div className="flex items-center gap-2">
                <button
                  onClick={paginaAnterior}
                  disabled={estado.paginaActual === 1}
                  className="px-3 py-2 text-sm font-medium text-[#8D2C1D] bg-white border-2 border-[#E9E1C9] rounded-lg hover:bg-[#8D2C1D] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Anterior
                </button>

                {/* Números de página */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numeroPagina => (
                    <button
                      key={numeroPagina}
                      onClick={() => cambiarPagina(numeroPagina)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        estado.paginaActual === numeroPagina
                          ? 'bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white'
                          : 'text-[#8D2C1D] bg-white border-2 border-[#E9E1C9] hover:bg-[#8D2C1D] hover:text-white'
                      }`}
                    >
                      {numeroPagina}
                    </button>
                  ))}
                </div>

                <button
                  onClick={paginaSiguiente}
                  disabled={estado.paginaActual === totalPaginas}
                  className="px-3 py-2 text-sm font-medium text-[#8D2C1D] bg-white border-2 border-[#E9E1C9] rounded-lg hover:bg-[#8D2C1D] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Modal de asignación */}
        {estado.modalAsignacionAbierto && estado.salonSeleccionado && (
          <ModalAsignacionAlumnos
            salon={estado.salonSeleccionado}
            isOpen={estado.modalAsignacionAbierto}
            onClose={cerrarModalAsignacion}
            onSuccess={onAsignacionExitosa}
          />
        )}
      </main>
    </DirectorSidebar>
  );
}

export default function GestionSalonesPage() {
  return (
    <ProtectedRoute requiredRole={["DIRECTOR", "ADMINISTRATIVO"]}>
      <GestionSalonesPageContent />
    </ProtectedRoute>
  );
}
