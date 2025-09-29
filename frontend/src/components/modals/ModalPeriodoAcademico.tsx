'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { 
  PeriodoAcademicoFormData, 
  TipoPeriodo, 
  TIPOS_PERIODO, 
  NUMEROS_ROMANOS, 
  obtenerAnioAcademicoActual,
  convertirRomanoAOrden
} from '@/types/periodo-academico';

interface ModalPeriodoAcademicoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PeriodoAcademicoFormData) => Promise<void>;
  loading?: boolean;
}

export default function ModalPeriodoAcademico({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading = false 
}: ModalPeriodoAcademicoProps) {
  const anioActual = obtenerAnioAcademicoActual();
  
  const [formData, setFormData] = useState<PeriodoAcademicoFormData>({
    nombre: 'I',
    tipo: TipoPeriodo.BIMESTRE,
    anioAcademico: anioActual,
    orden: 1,
    fechaInicio: '',
    fechaFin: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    if (!formData.fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es obligatoria';
    }
    
    if (!formData.fechaFin) {
      newErrors.fechaFin = 'La fecha de fin es obligatoria';
    }
    
    if (formData.fechaInicio && formData.fechaFin) {
      if (new Date(formData.fechaFin) <= new Date(formData.fechaInicio)) {
        newErrors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      try {
        // Calcular orden automáticamente del nombre romano
        const dataConOrden = {
          ...formData,
          orden: convertirRomanoAOrden(formData.nombre)
        };
        
        await onSubmit(dataConOrden);
        
        // Reset form
        setFormData({
          nombre: 'I',
          tipo: TipoPeriodo.BIMESTRE,
          anioAcademico: anioActual,
          orden: 1,
          fechaInicio: '',
          fechaFin: ''
        });
        setErrors({});
      } catch (error) {
        console.error('Error al crear período:', error);
      }
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setErrors({});
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/25" />
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <CalendarIcon className="h-6 w-6 text-blue-600 mr-2" />
                <Dialog.Title className="text-lg font-medium text-gray-900">
                  Agregar Período Académico
                </Dialog.Title>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Nombre (Número Romano) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Período
                </label>
                <select
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {NUMEROS_ROMANOS.map((numero) => (
                    <option key={numero.value} value={numero.value}>
                      {numero.label}
                    </option>
                  ))}
                </select>
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                )}
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Período
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoPeriodo })}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  {TIPOS_PERIODO.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Año Académico (Solo lectura) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año Académico
                </label>
                <input
                  type="text"
                  value={formData.anioAcademico}
                  disabled={true}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se asigna automáticamente el año actual
                </p>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      errors.fechaInicio ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.fechaInicio && (
                    <p className="text-red-500 text-sm mt-1">{errors.fechaInicio}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                      errors.fechaFin ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.fechaFin && (
                    <p className="text-red-500 text-sm mt-1">{errors.fechaFin}</p>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? 'Creando...' : 'Crear Período'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
