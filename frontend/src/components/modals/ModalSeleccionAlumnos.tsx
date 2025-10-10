"use client";

import { useState, useEffect } from 'react';
import { Alumno } from '@/types/apoderado';

interface ModalSeleccionAlumnosProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (alumnos: Alumno[]) => void;
  alumnosSeleccionados: Alumno[];
  multiSelect?: boolean;
}

export default function ModalSeleccionAlumnos({
  isOpen,
  onClose,
  onSelect,
  alumnosSeleccionados,
  multiSelect = true
}: ModalSeleccionAlumnosProps) {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionados, setSeleccionados] = useState<Alumno[]>(alumnosSeleccionados);
  const [error, setError] = useState<string | null>(null);

  // Cargar alumnos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      cargarAlumnos();
      setSeleccionados(alumnosSeleccionados);
    }
  }, [isOpen, alumnosSeleccionados]);

  const cargarAlumnos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/apoderados/alumnos-disponibles', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar alumnos');
      }

      const data = await response.json();
      setAlumnos(data);
    } catch (error) {
      console.error('Error al cargar alumnos:', error);
      setError('Error al cargar la lista de alumnos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar alumnos por búsqueda
  const alumnosFiltrados = alumnos.filter(alumno => {
    const termino = busqueda.toLowerCase();
    return (
      alumno.nombres.toLowerCase().includes(termino) ||
      alumno.apellidos.toLowerCase().includes(termino) ||
      (alumno.dni && alumno.dni.includes(termino))
    );
  });

  const handleSeleccionar = (alumno: Alumno) => {
    if (multiSelect) {
      const yaSeleccionado = seleccionados.find(a => a.id === alumno.id);
      if (yaSeleccionado) {
        setSeleccionados(seleccionados.filter(a => a.id !== alumno.id));
      } else {
        setSeleccionados([...seleccionados, alumno]);
      }
    } else {
      setSeleccionados([alumno]);
    }
  };

  const handleConfirmar = () => {
    onSelect(seleccionados);
    onClose();
  };

  const handleCancelar = () => {
    setSeleccionados(alumnosSeleccionados);
    setBusqueda('');
    onClose();
  };

  const estaSeleccionado = (alumno: Alumno) => {
    return seleccionados.some(a => a.id === alumno.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Seleccionar Alumnos
          </h2>
          <button
            onClick={handleCancelar}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Búsqueda */}
        <div className="p-6 border-b">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o DNI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Lista de alumnos */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando alumnos...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">{error}</div>
              <button
                onClick={cargarAlumnos}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Intentar nuevamente
              </button>
            </div>
          ) : alumnosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {busqueda ? 'No se encontraron alumnos con ese criterio' : 'No hay alumnos disponibles'}
            </div>
          ) : (
            <div className="grid gap-3">
              {alumnosFiltrados.map((alumno) => (
                <div
                  key={alumno.id}
                  onClick={() => handleSeleccionar(alumno)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    estaSeleccionado(alumno)
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            estaSeleccionado(alumno)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {estaSeleccionado(alumno) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {alumno.apellidos}, {alumno.nombres}
                          </h3>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            {alumno.dni && (
                              <span>DNI: {alumno.dni}</span>
                            )}
                            {alumno.fechaNacimiento && (
                              <span>
                                Nacimiento: {new Date(alumno.fechaNacimiento).toLocaleDateString()}
                              </span>
                            )}
                            {alumno.sexo && (
                              <span className="capitalize">{alumno.sexo}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        alumno.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {alumno.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {seleccionados.length} alumno{seleccionados.length !== 1 ? 's' : ''} seleccionado{seleccionados.length !== 1 ? 's' : ''}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCancelar}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmar}
              disabled={seleccionados.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar Selección
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
