'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { SalonConAlumnos } from '@/types/salon-alumnos';
import { Salon } from '@/types/salon';
import { OPCIONES_NIVELES_EDUCATIVOS } from '@/types/colegio';
import SalonCard from '@/components/salon/SalonCard';
import ModalAsignacionAlumnos from '@/components/modals/ModalAsignacionAlumnos';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  PlusIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

interface EstadoGestion {
  salones: Salon[];
  salonSeleccionado: Salon | null;
  modalAsignacionAbierto: boolean;
  cargando: boolean;
  error: string | null;
  filtroNivel: string;
  busqueda: string;
  refreshTrigger: number;
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
    refreshTrigger: 0
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

  // Filtrar salones
  const salonesFiltrados = estado.salones.filter(salon => {
    const cumpleFiltroNivel = estado.filtroNivel === 'TODOS' || salon.nivel === estado.filtroNivel;
    const cumpleBusqueda = estado.busqueda === '' || 
      salon.grado.toLowerCase().includes(estado.busqueda.toLowerCase()) ||
      salon.seccion.toLowerCase().includes(estado.busqueda.toLowerCase());
    
    return cumpleFiltroNivel && cumpleBusqueda && salon.activo;
  });

  // Agrupar salones por nivel
  const salonesPorNivel = salonesFiltrados.reduce((acc, salon) => {
    if (!acc[salon.nivel]) {
      acc[salon.nivel] = [];
    }
    acc[salon.nivel].push(salon);
    return acc;
  }, {} as Record<string, Salon[]>);

  const abrirModalAsignacion = (salon: Salon) => {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando salones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestión de Alumnos por Salón
                </h1>
                <p className="text-gray-600">
                  Asigna y gestiona alumnos en los salones de tu colegio
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                Total: {salonesFiltrados.length} salones
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filtro por nivel */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por nivel
              </label>
              <select
                value={estado.filtroNivel}
                onChange={(e) => setEstado(prev => ({ ...prev, filtroNivel: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar salón
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={estado.busqueda}
                  onChange={(e) => setEstado(prev => ({ ...prev, busqueda: e.target.value }))}
                  placeholder="Buscar por grado o sección..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {estado.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{estado.error}</p>
            <button
              onClick={cargarSalones}
              className="mt-2 text-red-600 hover:text-red-800 font-medium"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Salones agrupados por nivel */}
        {Object.keys(salonesPorNivel).length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay salones</h3>
            <p className="mt-1 text-sm text-gray-500">
              {estado.filtroNivel !== 'TODOS' || estado.busqueda
                ? 'No se encontraron salones con los filtros aplicados'
                : 'Comienza creando salones para tu colegio'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(salonesPorNivel).map(([nivel, salones]) => {
              const nivelInfo = OPCIONES_NIVELES_EDUCATIVOS.find(n => n.value === nivel);
              return (
                <div key={nivel}>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">{nivelInfo?.icon}</span>
                    {nivelInfo?.label}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({salones.length} salones)
                    </span>
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {salones.map(salon => (
                      <SalonCard
                        key={salon.id}
                        salon={salon}
                        onAsignarAlumnos={abrirModalAsignacion}
                        refreshTrigger={estado.refreshTrigger}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
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
    </div>
  );
}

export default function GestionSalonesPage() {
  return (
    <ProtectedRoute requiredRole="DIRECTOR">
      <GestionSalonesPageContent />
    </ProtectedRoute>
  );
}
