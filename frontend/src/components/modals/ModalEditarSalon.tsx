'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Salon } from '@/types/salon';

interface ModalEditarSalonProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon | null;
  onSuccess: (salon: Salon, formData: any) => void;
}

export default function ModalEditarSalon({ isOpen, onClose, salon, onSuccess }: ModalEditarSalonProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    grado: '',
    seccion: '',
    turno: 'MAÑANA'
  });

  // Cargar datos del salón cuando se abre el modal
  useEffect(() => {
    if (salon) {
      setFormData({
        grado: salon.grado,
        seccion: salon.seccion,
        turno: salon.turno
      });
    }
  }, [salon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salon) return;

    // En lugar de hacer la petición directamente, llamamos a onSuccess con los datos
    // para que el componente padre maneje la confirmación de contraseña
    onSuccess(salon, formData);
    onClose();
  };

  if (!salon) return null;

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                
                {/* Header */}
                <div className="relative bg-gradient-to-r from-[#8D2C1D] to-[#D96924] px-6 py-6 text-white">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      <span className="text-2xl">✏️</span>
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-bold">Editar Salón</h2>
                      <p className="text-white/80 text-sm">Modifica los datos del salón</p>
                    </div>
                  </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="space-y-4">
                    
                    {/* Grado */}
                    <div>
                      <label className="block text-sm font-semibold text-[#8D2C1D] mb-2">
                        Grado
                      </label>
                      <input
                        type="text"
                        value={formData.grado}
                        onChange={(e) => setFormData(prev => ({ ...prev, grado: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 text-[#333333] placeholder-[#999999]"
                        placeholder="Ej: 1° Primaria"
                        required
                      />
                    </div>

                    {/* Sección */}
                    <div>
                      <label className="block text-sm font-semibold text-[#8D2C1D] mb-2">
                        Sección
                      </label>
                      <input
                        type="text"
                        value={formData.seccion}
                        onChange={(e) => setFormData(prev => ({ ...prev, seccion: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 text-[#333333] placeholder-[#999999]"
                        placeholder="Ej: A"
                        required
                      />
                    </div>

                    {/* Turno */}
                    <div>
                      <label className="block text-sm font-semibold text-[#8D2C1D] mb-2">
                        Turno
                      </label>
                      <select
                        value={formData.turno}
                        onChange={(e) => setFormData(prev => ({ ...prev, turno: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 text-[#333333]"
                        required
                      >
                        <option value="MAÑANA">Mañana</option>
                        <option value="TARDE">Tarde</option>
                        <option value="NOCHE">Noche</option>
                      </select>
                    </div>

                  </div>

                  {/* Botones */}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white rounded-xl hover:from-[#D96924] hover:to-[#8D2C1D] focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
