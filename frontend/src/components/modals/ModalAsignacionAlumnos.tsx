'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { SalonConNivel } from '@/types/salon';
import { AlumnoDisponible, FiltrosAlumnos } from '@/types/salon-alumnos';
import { 
  XMarkIcon, 
  MagnifyingGlassIcon,
  UserPlusIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ModalAsignacionAlumnosProps {
  salon: SalonConNivel;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface EstadoModal {
  alumnos: AlumnoDisponible[];
  alumnosSeleccionados: number[];
  filtros: FiltrosAlumnos;
  cargando: boolean;
  asignando: boolean;
  error: string | null;
}

export default function ModalAsignacionAlumnos({ 
  salon, 
  isOpen, 
  onClose, 
  onSuccess 
}: ModalAsignacionAlumnosProps) {
  const [estado, setEstado] = useState<EstadoModal>({
    alumnos: [],
    alumnosSeleccionados: [],
    filtros: {
      busqueda: '',
      edadMinima: undefined,
      edadMaxima: undefined
    },
    cargando: false,
    asignando: false,
    error: null
  });

  // Cargar alumnos disponibles cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      cargarAlumnosDisponibles();
    }
  }, [isOpen]);

  const cargarAlumnosDisponibles = async () => {
    try {
      setEstado(prev => ({ ...prev, cargando: true, error: null }));

      const response = await fetch('/api/salones/alumnos-disponibles', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar alumnos disponibles');
      }

      const data = await response.json();
      setEstado(prev => ({
        ...prev,
        alumnos: data.data || [],
        cargando: false
      }));
    } catch (error) {
      console.error('Error:', error);
      setEstado(prev => ({
        ...prev,
        error: 'Error al cargar los alumnos disponibles',
        cargando: false
      }));
    }
  };

  // Función para calcular edad desde fechaNacimiento
  const calcularEdad = (fechaNacimiento: string | null): number | null => {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const diferenciaMes = hoy.getMonth() - nacimiento.getMonth();
    if (diferenciaMes < 0 || (diferenciaMes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  // Filtrar alumnos con edad calculada
  const alumnosFiltrados = estado.alumnos.filter(alumno => {
    const cumpleBusqueda = !estado.filtros.busqueda || 
      alumno.nombres.toLowerCase().includes(estado.filtros.busqueda.toLowerCase()) ||
      alumno.apellidos.toLowerCase().includes(estado.filtros.busqueda.toLowerCase()) ||
      (alumno.dni && alumno.dni.includes(estado.filtros.busqueda));

    const edadCalculada = calcularEdad(alumno.fechaNacimiento);
    const cumpleEdadMinima = !estado.filtros.edadMinima || 
      (edadCalculada !== null && edadCalculada >= estado.filtros.edadMinima);

    const cumpleEdadMaxima = !estado.filtros.edadMaxima || 
      (edadCalculada !== null && edadCalculada <= estado.filtros.edadMaxima);

    return cumpleBusqueda && cumpleEdadMinima && cumpleEdadMaxima;
  });

  const toggleSeleccionAlumno = (alumnoId: number) => {
    setEstado(prev => ({
      ...prev,
      alumnosSeleccionados: prev.alumnosSeleccionados.includes(alumnoId)
        ? prev.alumnosSeleccionados.filter(id => id !== alumnoId)
        : [...prev.alumnosSeleccionados, alumnoId]
    }));
  };

  const seleccionarTodosFiltrados = () => {
    const idsFiltrados = alumnosFiltrados.map(alumno => alumno.id);
    setEstado(prev => ({
      ...prev,
      alumnosSeleccionados: idsFiltrados
    }));
  };

  const deseleccionarTodos = () => {
    setEstado(prev => ({
      ...prev,
      alumnosSeleccionados: []
    }));
  };

  const asignarAlumnos = async () => {
    if (estado.alumnosSeleccionados.length === 0) {
      setEstado(prev => ({ ...prev, error: 'Selecciona al menos un alumno' }));
      return;
    }

    try {
      setEstado(prev => ({ ...prev, asignando: true, error: null }));

      const response = await fetch(`/api/salones/${salon.id}/alumnos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          salonId: salon.id,
          alumnos: estado.alumnosSeleccionados.map(id => ({ alumnoId: id }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al asignar alumnos');
      }

      // Éxito
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      setEstado(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al asignar alumnos',
        asignando: false
      }));
    }
  };

  const obtenerRangoEdadSugerido = (nivel: string) => {
    switch (nivel) {
      case 'INICIAL':
        return { min: 3, max: 5 };
      case 'PRIMARIA':
        return { min: 6, max: 11 };
      case 'SECUNDARIA':
        return { min: 12, max: 17 };
      default:
        return { min: 3, max: 17 };
    }
  };

  const aplicarFiltroEdadSugerido = () => {
    const rango = obtenerRangoEdadSugerido(salon.nivel);
    setEstado(prev => ({
      ...prev,
      filtros: {
        ...prev.filtros,
        edadMinima: rango.min,
        edadMaxima: rango.max
      }
    }));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm text-left align-middle shadow-xl transition-all border border-[#E9E1C9]">
                {/* Header con gradiente de marca */}
                <div className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Dialog.Title className="text-xl font-bold text-white">
                        Asignar Alumnos al Salón
                      </Dialog.Title>
                      <p className="text-white/80 mt-1">
                        {salon.grado} - {salon.seccion} ({salon.nivel})
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-white/80 hover:text-white bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-all duration-200"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Filtros con estilo de marca */}
                <div className="p-6 border-b border-[#E9E1C9] bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9]">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Búsqueda */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[#8D2C1D] mb-2">
                        Buscar Alumno
                      </label>
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#666666]" />
                        <input
                          type="text"
                          value={estado.filtros.busqueda}
                          onChange={(e) => setEstado(prev => ({
                            ...prev,
                            filtros: { ...prev.filtros, busqueda: e.target.value }
                          }))}
                          placeholder="Nombre, apellido o DNI..."
                          className="w-full pl-10 pr-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 bg-white/90 text-[#333333] placeholder-[#999999]"
                        />
                      </div>
                    </div>

                    {/* Edad mínima */}
                    <div>
                      <label className="block text-sm font-semibold text-[#8D2C1D] mb-2">
                        Edad Mínima
                      </label>
                      <input
                        type="number"
                        min="3"
                        max="25"
                        value={estado.filtros.edadMinima || ''}
                        onChange={(e) => setEstado(prev => ({
                          ...prev,
                          filtros: { ...prev.filtros, edadMinima: e.target.value ? parseInt(e.target.value) : undefined }
                        }))}
                        placeholder="3"
                        className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 bg-white/90 text-[#333333] placeholder-[#999999]"
                      />
                    </div>

                    {/* Edad máxima */}
                    <div>
                      <label className="block text-sm font-semibold text-[#8D2C1D] mb-2">
                        Edad Máxima
                      </label>
                      <input
                        type="number"
                        min="3"
                        max="25"
                        value={estado.filtros.edadMaxima || ''}
                        onChange={(e) => setEstado(prev => ({
                          ...prev,
                          filtros: { ...prev.filtros, edadMaxima: e.target.value ? parseInt(e.target.value) : undefined }
                        }))}
                        placeholder="25"
                        className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 bg-white/90 text-[#333333] placeholder-[#999999]"
                      />
                    </div>
                  </div>

                  {/* Botones de filtro y selección */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={aplicarFiltroEdadSugerido}
                      className="text-sm text-[#8D2C1D] hover:text-[#D96924] font-semibold bg-white/50 hover:bg-white/70 px-3 py-2 rounded-lg transition-all duration-200"
                    >
                      Filtrar por edad sugerida para {salon.nivel} ({obtenerRangoEdadSugerido(salon.nivel).min}-{obtenerRangoEdadSugerido(salon.nivel).max} años)
                    </button>
                    
                    {alumnosFiltrados.length > 0 && (
                      <>
                        <button
                          onClick={seleccionarTodosFiltrados}
                          className="text-sm text-white font-semibold bg-[#8D2C1D] hover:bg-[#D96924] px-3 py-2 rounded-lg transition-all duration-200"
                        >
                          Seleccionar todos los filtrados ({alumnosFiltrados.length})
                        </button>
                        
                        {estado.alumnosSeleccionados.length > 0 && (
                          <button
                            onClick={deseleccionarTodos}
                            className="text-sm text-[#8D2C1D] hover:text-red-600 font-semibold bg-white/50 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200"
                          >
                            Deseleccionar todos
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6 max-h-96 overflow-y-auto">
                  {estado.error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-red-700 text-sm">{estado.error}</span>
                      </div>
                    </div>
                  )}

                  {estado.cargando ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8D2C1D] mx-auto"></div>
                      <p className="mt-2 text-[#666666]">Cargando alumnos...</p>
                    </div>
                  ) : alumnosFiltrados.length === 0 ? (
                    <div className="text-center py-8">
                      <UserPlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No hay alumnos disponibles</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {alumnosFiltrados.map((alumno) => (
                        <div
                          key={alumno.id}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            estado.alumnosSeleccionados.includes(alumno.id)
                              ? 'border-[#8D2C1D] bg-[#8D2C1D]/10'
                              : 'border-[#E9E1C9] hover:border-[#8D2C1D]/50 bg-white/50'
                          }`}
                          onClick={() => toggleSeleccionAlumno(alumno.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                estado.alumnosSeleccionados.includes(alumno.id)
                                  ? 'border-[#8D2C1D] bg-[#8D2C1D]'
                                  : 'border-gray-300'
                              }`}>
                                {estado.alumnosSeleccionados.includes(alumno.id) && (
                                  <CheckIcon className="h-3 w-3 text-white" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-[#8D2C1D]">
                                  {alumno.apellidos}, {alumno.nombres}
                                </p>
                                <p className="text-sm text-[#666666]">
                                  DNI: {alumno.dni || 'No registrado'} • 
                                  Edad: {calcularEdad(alumno.fechaNacimiento) ? `${calcularEdad(alumno.fechaNacimiento)} años` : 'No registrada'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-[#E9E1C9]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#666666]">
                      {estado.alumnosSeleccionados.length} alumno{estado.alumnosSeleccionados.length !== 1 ? 's' : ''} seleccionado{estado.alumnosSeleccionados.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={onClose}
                        className="px-4 py-2 text-[#666666] hover:text-[#8D2C1D] font-medium transition-colors duration-200"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={asignarAlumnos}
                        disabled={estado.asignando || estado.alumnosSeleccionados.length === 0}
                        className="px-6 py-2 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white font-semibold rounded-xl hover:from-[#D96924] hover:to-[#8D2C1D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                      >
                        {estado.asignando ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Asignando...
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="h-4 w-4" />
                            Asignar Alumnos
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
