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
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl max-w-md w-full mx-4 border-2 border-[#E9E1C9]">
        {/* Header con paleta corporativa */}
        <div className="flex items-center justify-between p-6 border-b border-[#E9E1C9] bg-gradient-to-r from-[#8D2C1D] to-[#D96924] rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Nueva Evaluación
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-300 disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50/95 backdrop-blur-sm border-2 border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Fecha de evaluación (solo lectura) */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#333333] mb-2">
              <CalendarIcon className="h-4 w-4 inline mr-2 text-[#8D2C1D]" />
              Fecha de Evaluación
            </label>
            <input
              type="date"
              value={fechaActual}
              readOnly
              className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-xl bg-[#FCE0C1]/30 text-[#666666] cursor-not-allowed font-medium"
            />
            <p className="text-xs text-[#666666] mt-2 font-medium">
              ℹ️ La fecha se establece automáticamente al día actual
            </p>
          </div>

          {/* Nombre de la evaluación */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#333333] mb-2">
              <DocumentTextIcon className="h-4 w-4 inline mr-2 text-[#8D2C1D]" />
              Nombre de la Evaluación *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Examen Parcial, Práctica Calificada, etc."
              className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-300 font-medium"
              disabled={loading}
              required
              maxLength={100}
            />
          </div>

          {/* Descripción (opcional) */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#333333] mb-2">
              📝 Descripción (opcional)
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción adicional sobre la evaluación..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] resize-none transition-all duration-300 font-medium"
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
              className="flex-1 bg-white/80 hover:bg-white text-[#8D2C1D] px-4 py-3 rounded-xl transition-all duration-300 font-semibold border-2 border-[#E9E1C9] hover:border-[#8D2C1D] shadow-sm hover:shadow-md disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !nombre.trim()}
              className="flex-1 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] hover:from-[#7A2518] hover:to-[#C55A1F] text-white px-4 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
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
