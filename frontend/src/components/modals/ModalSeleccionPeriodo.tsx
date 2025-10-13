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
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl max-w-md w-full mx-4 border-2 border-[#E9E1C9]">
        {/* Header con paleta de marca */}
        <div className="flex items-center justify-between p-6 border-b border-[#E9E1C9] bg-gradient-to-r from-[#8D2C1D] to-[#D96924] rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Seleccionar Período Académico
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {asignacion && (
            <div className="mb-4 p-4 bg-gradient-to-br from-[#FCE0C1] to-[#E9E1C9] rounded-xl border border-[#E9E1C9]">
              <h4 className="font-bold text-[#8D2C1D] mb-1">
                {asignacion.curso.nombre}
              </h4>
              <p className="text-sm text-[#666666] font-medium">
                Salón: {asignacion.salon.grado}° {asignacion.salon.seccion}
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8D2C1D]"></div>
              <span className="ml-2 text-[#666666] font-medium">Cargando períodos...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2 text-lg">⚠️ Error</div>
              <p className="text-red-700 mb-4 font-medium">{error}</p>
              <button
                onClick={cargarPeriodos}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                Reintentar
              </button>
            </div>
          ) : periodos.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-16 w-16 text-[#8D2C1D] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[#8D2C1D] mb-2">
                No hay períodos activos
              </h3>
              <p className="text-[#666666] font-medium">
                No se encontraron períodos académicos activos para este colegio.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[#666666] mb-4 font-medium">
                Selecciona el período académico para registrar notas:
              </p>
              {periodos.map((periodo) => (
                <button
                  key={periodo.id}
                  onClick={() => handleSeleccionarPeriodo(periodo)}
                  className="w-full p-4 text-left border-2 border-[#E9E1C9] rounded-xl hover:border-[#8D2C1D] hover:bg-[#FCE0C1] transition-all duration-300 group shadow-sm hover:shadow-lg transform hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#333333] group-hover:text-[#8D2C1D] transition-colors duration-300">
                        {periodo.nombre}
                      </h4>
                      <p className="text-sm text-[#666666] font-medium">
                        {periodo.tipo} - {periodo.anioAcademico}
                      </p>
                    </div>
                    <div className="text-[#8D2C1D] opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E9E1C9] bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9] rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full bg-white/80 hover:bg-white text-[#8D2C1D] px-4 py-3 rounded-xl transition-all duration-300 font-semibold border-2 border-[#E9E1C9] hover:border-[#8D2C1D] shadow-sm hover:shadow-md"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
