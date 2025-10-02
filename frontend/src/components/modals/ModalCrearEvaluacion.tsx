"use client";

import { useState } from 'react';
import { XMarkIcon, CalendarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { CreateEvaluacionDto, Evaluacion } from '@/types/evaluaciones';

interface ModalCrearEvaluacionProps {
  isOpen: boolean;
  onClose: () => void;
  competenciaId: number | null;
  asignacionId: number;
  periodoId: number;
  onCrearEvaluacion: (data: CreateEvaluacionDto) => Promise<Evaluacion>;
}

export default function ModalCrearEvaluacion({
  isOpen,
  onClose,
  competenciaId,
  asignacionId,
  periodoId,
  onCrearEvaluacion
}: ModalCrearEvaluacionProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener fecha actual en formato YYYY-MM-DD para el input
  const fechaActual = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!competenciaId || !nombre.trim()) {
      setError('El nombre de la evaluación es requerido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data: CreateEvaluacionDto = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        fechaEvaluacion: fechaActual, // Fecha actual automática
        competenciaId,
        profesorAsignacionId: asignacionId,
        periodoId
      };

      await onCrearEvaluacion(data);
      
      // Limpiar formulario y cerrar modal
      setNombre('');
      setDescripcion('');
      onClose();
    } catch (error) {
      console.error('Error creando evaluación:', error);
      setError(error instanceof Error ? error.message : 'Error al crear la evaluación');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNombre('');
      setDescripcion('');
      setError(null);
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
            Nueva Evaluación
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Fecha de evaluación (solo lectura) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Fecha de Evaluación
            </label>
            <input
              type="date"
              value={fechaActual}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              La fecha se establece automáticamente al día actual
            </p>
          </div>

          {/* Nombre de la evaluación */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DocumentTextIcon className="h-4 w-4 inline mr-1" />
              Nombre de la Evaluación *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Examen Parcial, Práctica Calificada, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
              required
              maxLength={100}
            />
          </div>

          {/* Descripción (opcional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción adicional sobre la evaluación..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              disabled={loading}
              maxLength={500}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !nombre.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                'Crear Evaluación'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
