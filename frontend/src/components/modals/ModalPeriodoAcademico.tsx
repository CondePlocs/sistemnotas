'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { 
  PeriodoAcademico,
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
  periodo?: PeriodoAcademico | null;
  title?: string;
  loading?: boolean;
}

export default function ModalPeriodoAcademico({ 
  isOpen, 
  onClose, 
  onSubmit,
  periodo = null,
  title = 'Nuevo Período Académico',
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

  // Cargar datos del período si es edición
  useEffect(() => {
    if (periodo && isOpen) {
      setFormData({
        nombre: periodo.nombre,
        tipo: periodo.tipo,
        anioAcademico: periodo.anioAcademico,
        orden: periodo.orden,
        fechaInicio: periodo.fechaInicio.split('T')[0],
        fechaFin: periodo.fechaFin.split('T')[0]
      });
    } else if (!periodo && isOpen) {
      // Reset para nuevo período
      setFormData({
        nombre: 'I',
        tipo: TipoPeriodo.BIMESTRE,
        anioAcademico: anioActual,
        orden: 1,
        fechaInicio: '',
        fechaFin: ''
      });
    }
  }, [periodo, isOpen, anioActual]);

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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
            
            {/* Header con gradiente */}
            <div className="relative bg-gradient-to-r from-[#8D2C1D] to-[#D96924] px-6 py-8 text-white">
              <button
                onClick={handleClose}
                disabled={loading}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <CalendarIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold">{title}</h2>
                  <p className="text-white/80 mt-1">Configura el período académico</p>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-[#8D2C1D] mb-3">
                    Nombre del Período *
                  </label>
                  <select
                    value={formData.nombre}
                    onChange={(e) => {
                      const nombre = e.target.value;
                      const orden = convertirRomanoAOrden(nombre);
                      setFormData(prev => ({ ...prev, nombre, orden }));
                    }}
                    className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 text-[#333333] bg-white/90"
                    required
                  >
                    {NUMEROS_ROMANOS.map(num => (
                      <option key={num.value} value={num.value}>
                        {num.label}
                      </option>
                    ))}
                  </select>
                  {errors.nombre && (
                    <p className="text-red-600 text-sm mt-2 font-medium">{errors.nombre}</p>
                  )}
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-semibold text-[#8D2C1D] mb-3">
                    Tipo de Período *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as TipoPeriodo }))}
                    className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 text-[#333333] bg-white/90"
                    required
                  >
                    {TIPOS_PERIODO.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                  {errors.tipo && (
                    <p className="text-red-600 text-sm mt-2 font-medium">{errors.tipo}</p>
                  )}
                </div>

                {/* Año Académico */}
                <div>
                  <label className="block text-sm font-semibold text-[#8D2C1D] mb-3">
                    Año Académico *
                  </label>
                  <input
                    type="number"
                    value={formData.anioAcademico}
                    onChange={(e) => setFormData(prev => ({ ...prev, anioAcademico: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 text-[#333333] bg-white/90"
                    min={2020}
                    max={2030}
                    required
                  />
                  {errors.anioAcademico && (
                    <p className="text-red-600 text-sm mt-2 font-medium">{errors.anioAcademico}</p>
                  )}
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#8D2C1D] mb-3">
                      Fecha Inicio *
                    </label>
                    <input
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 text-[#333333] bg-white/90"
                      required
                    />
                    {errors.fechaInicio && (
                      <p className="text-red-600 text-sm mt-2 font-medium">{errors.fechaInicio}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#8D2C1D] mb-3">
                      Fecha Fin *
                    </label>
                    <input
                      type="date"
                      value={formData.fechaFin}
                      onChange={(e) => setFormData(prev => ({ ...prev, fechaFin: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 text-[#333333] bg-white/90"
                      required
                    />
                    {errors.fechaFin && (
                      <p className="text-red-600 text-sm mt-2 font-medium">{errors.fechaFin}</p>
                    )}
                  </div>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="px-6 py-3 text-[#666666] bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] hover:from-[#D96924] hover:to-[#8D2C1D] text-white rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                  >
                    {loading && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    )}
                    {loading ? 'Guardando...' : (periodo ? 'Actualizar Período' : 'Crear Período')}
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
