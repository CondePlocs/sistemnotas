"use client";

import { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { PeriodoAcademico, ProfesorAsignacion } from '@/types/evaluaciones';
import { evaluacionesAPI } from '@/lib/api/evaluaciones';

interface ModalSeleccionPeriodoProps {
  isOpen: boolean;
  onClose: () => void;
  asignacion: ProfesorAsignacion | null;
  onPeriodoSeleccionado: (asignacion: ProfesorAsignacion, periodo: PeriodoAcademico) => void;
}

export default function ModalSeleccionPeriodo({
  isOpen,
  onClose,
  asignacion,
  onPeriodoSeleccionado
}: ModalSeleccionPeriodoProps) {
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && asignacion) {
      cargarPeriodos();
    }
  }, [isOpen, asignacion]);

  const cargarPeriodos = async () => {
    if (!asignacion) return;
    
    try {
      setLoading(true);
      setError(null);
      // Usar colegioId que ahora está disponible directamente
      const periodosData = await evaluacionesAPI.obtenerPeriodosActivos(asignacion.colegioId);
      setPeriodos(periodosData);
    } catch (error) {
      console.error('Error cargando períodos:', error);
      setError('Error al cargar los períodos académicos');
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarPeriodo = (periodo: PeriodoAcademico) => {
    if (asignacion) {
      onPeriodoSeleccionado(asignacion, periodo);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Seleccionar Período Académico
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {asignacion && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">
                {asignacion.curso.nombre}
              </h4>
              <p className="text-sm text-gray-600">
                {asignacion.salon.grado}° {asignacion.salon.seccion}
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando períodos...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">⚠️ Error</div>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={cargarPeriodos}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : periodos.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay períodos activos
              </h3>
              <p className="text-gray-500">
                No se encontraron períodos académicos activos para este colegio.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-4">
                Selecciona el período académico para registrar notas:
              </p>
              {periodos.map((periodo) => (
                <button
                  key={periodo.id}
                  onClick={() => handleSeleccionarPeriodo(periodo)}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-900">
                        {periodo.nombre}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {periodo.tipo} - {periodo.anioAcademico}
                      </p>
                    </div>
                    <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
