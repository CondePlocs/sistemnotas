'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Salon } from '@/types/salon';
import { AlumnoDisponible, FiltrosAlumnos } from '@/types/salon-alumnos';
import { 
  XMarkIcon, 
  MagnifyingGlassIcon,
  UserPlusIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ModalAsignacionAlumnosProps {
  salon: Salon;
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

  // Filtrar alumnos
  const alumnosFiltrados = estado.alumnos.filter(alumno => {
    const cumpleBusqueda = !estado.filtros.busqueda || 
      alumno.nombres.toLowerCase().includes(estado.filtros.busqueda.toLowerCase()) ||
      alumno.apellidos.toLowerCase().includes(estado.filtros.busqueda.toLowerCase()) ||
      (alumno.dni && alumno.dni.includes(estado.filtros.busqueda));

    const cumpleEdadMinima = !estado.filtros.edadMinima || 
      (alumno.edad && alumno.edad >= estado.filtros.edadMinima);

    const cumpleEdadMaxima = !estado.filtros.edadMaxima || 
      (alumno.edad && alumno.edad <= estado.filtros.edadMaxima);

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

  const seleccionarTodos = () => {
    setEstado(prev => ({
      ...prev,
      alumnosSeleccionados: alumnosFiltrados.map(alumno => alumno.id)
    }));
  };

  const limpiarSeleccion = () => {
    setEstado(prev => ({
      ...prev,
      alumnosSeleccionados: []
    }));
  };

  const asignarAlumnos = async () => {
    if (estado.alumnosSeleccionados.length === 0) return;

    try {
      setEstado(prev => ({ ...prev, asignando: true, error: null }));

      const response = await fetch(`/api/salones/${salon.id}/alumnos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <Dialog.Title className="text-lg font-medium text-gray-900">
                      Asignar Alumnos al Salón
                    </Dialog.Title>
                    <p className="text-sm text-gray-600 mt-1">
                      {salon.grado} - {salon.seccion} ({salon.nivel})
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Filtros */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Búsqueda */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Buscar alumno
                      </label>
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={estado.filtros.busqueda}
                          onChange={(e) => setEstado(prev => ({
                            ...prev,
                            filtros: { ...prev.filtros, busqueda: e.target.value }
                          }))}
                          placeholder="Nombre, apellido o DNI..."
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Edad mínima */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Edad mínima
                      </label>
                      <input
                        type="number"
                        value={estado.filtros.edadMinima || ''}
                        onChange={(e) => setEstado(prev => ({
                          ...prev,
                          filtros: { 
                            ...prev.filtros, 
                            edadMinima: e.target.value ? parseInt(e.target.value) : undefined 
                          }
                        }))}
                        min="3"
                        max="18"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Edad máxima */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Edad máxima
                      </label>
                      <input
                        type="number"
                        value={estado.filtros.edadMaxima || ''}
                        onChange={(e) => setEstado(prev => ({
                          ...prev,
                          filtros: { 
                            ...prev.filtros, 
                            edadMaxima: e.target.value ? parseInt(e.target.value) : undefined 
                          }
                        }))}
                        min="3"
                        max="18"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Filtro rápido por edad sugerida */}
                  <div className="mt-4">
                    <button
                      onClick={aplicarFiltroEdadSugerido}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Filtrar por edad sugerida para {salon.nivel} ({obtenerRangoEdadSugerido(salon.nivel).min}-{obtenerRangoEdadSugerido(salon.nivel).max} años)
                    </button>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                  {/* Error */}
                  {estado.error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                      <div className="flex">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                          <p className="text-sm text-red-800">{estado.error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Controles de selección */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        {alumnosFiltrados.length} alumnos disponibles
                      </span>
                      {estado.alumnosSeleccionados.length > 0 && (
                        <span className="text-sm font-medium text-blue-600">
                          {estado.alumnosSeleccionados.length} seleccionados
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={seleccionarTodos}
                        disabled={alumnosFiltrados.length === 0}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400"
                      >
                        Seleccionar todos
                      </button>
                      <button
                        onClick={limpiarSeleccion}
                        disabled={estado.alumnosSeleccionados.length === 0}
                        className="text-sm text-gray-600 hover:text-gray-800 font-medium disabled:text-gray-400"
                      >
                        Limpiar selección
                      </button>
                    </div>
                  </div>

                  {/* Lista de alumnos */}
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                    {estado.cargando ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Cargando alumnos...</p>
                      </div>
                    ) : alumnosFiltrados.length === 0 ? (
                      <div className="p-8 text-center">
                        <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay alumnos disponibles</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {estado.alumnos.length === 0 
                            ? 'Todos los alumnos ya están asignados a salones'
                            : 'Prueba ajustando los filtros de búsqueda'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {alumnosFiltrados.map(alumno => (
                          <div
                            key={alumno.id}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                              estado.alumnosSeleccionados.includes(alumno.id) ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => toggleSeleccionAlumno(alumno.id)}
                          >
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  estado.alumnosSeleccionados.includes(alumno.id)
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'border-gray-300'
                                }`}>
                                  {estado.alumnosSeleccionados.includes(alumno.id) && (
                                    <CheckIcon className="w-3 h-3 text-white" />
                                  )}
                                </div>
                              </div>
                              
                              <div className="ml-3 flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {alumno.apellidos}, {alumno.nombres}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      DNI: {alumno.dni || 'No registrado'}
                                      {alumno.edad && ` • ${alumno.edad} años`}
                                    </p>
                                  </div>
                                  
                                  {alumno.edad && (
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      (() => {
                                        const rango = obtenerRangoEdadSugerido(salon.nivel);
                                        if (alumno.edad >= rango.min && alumno.edad <= rango.max) {
                                          return 'bg-green-100 text-green-800';
                                        } else {
                                          return 'bg-yellow-100 text-yellow-800';
                                        }
                                      })()
                                    }`}>
                                      {alumno.edad} años
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    disabled={estado.asignando}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={asignarAlumnos}
                    disabled={estado.alumnosSeleccionados.length === 0 || estado.asignando}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {estado.asignando ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Asignando...
                      </>
                    ) : (
                      <>
                        <UserPlusIcon className="h-4 w-4 mr-2" />
                        Asignar {estado.alumnosSeleccionados.length} alumno{estado.alumnosSeleccionados.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
