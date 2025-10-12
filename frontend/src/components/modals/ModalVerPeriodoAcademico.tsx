'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PeriodoAcademico } from '@/types/periodo-academico';
import { CalendarIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ModalVerPeriodoAcademicoProps {
  isOpen: boolean;
  onClose: () => void;
  periodo: PeriodoAcademico | null;
}

export default function ModalVerPeriodoAcademico({ isOpen, onClose, periodo }: ModalVerPeriodoAcademicoProps) {
  if (!periodo) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                
                {/* Header con gradiente */}
                <div className="relative bg-gradient-to-r from-[#8D2C1D] to-[#D96924] px-6 py-8 text-white">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                  
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <CalendarIcon className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-2xl font-bold">Detalles del Período Académico</h2>
                      <p className="text-white/80 mt-1">Información completa del período</p>
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                  {/* Información Principal */}
                  <div className="bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9] rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-[#8D2C1D]">{periodo.nombre}</h3>
                      {periodo.activo && (
                        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                          <CheckCircleIcon className="w-4 h-4" />
                          Período Activo
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/60 p-4 rounded-xl">
                        <span className="text-[#666666] font-medium block mb-1">Tipo de Período:</span>
                        <span className="font-semibold text-[#333333]">{periodo.tipo}</span>
                      </div>
                      
                      <div className="bg-white/60 p-4 rounded-xl">
                        <span className="text-[#666666] font-medium block mb-1">Año Académico:</span>
                        <span className="font-semibold text-[#333333]">{periodo.anioAcademico}</span>
                      </div>
                      
                      <div className="bg-white/60 p-4 rounded-xl">
                        <span className="text-[#666666] font-medium block mb-1">Orden:</span>
                        <span className="font-semibold text-[#333333]">
                          {['I', 'II', 'III', 'IV', 'V', 'VI'][periodo.orden - 1]} ({periodo.orden}° período)
                        </span>
                      </div>
                      
                      <div className="bg-white/60 p-4 rounded-xl">
                        <span className="text-[#666666] font-medium block mb-1">Estado:</span>
                        <span className={`font-semibold ${periodo.activo ? 'text-green-600' : 'text-gray-600'}`}>
                          {periodo.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fechas del Período */}
                  <div className="bg-blue-50 rounded-2xl p-6 mb-6">
                    <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5" />
                      Duración del Período
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/80 p-4 rounded-xl">
                        <span className="text-blue-600 font-medium block mb-1">Fecha de Inicio:</span>
                        <span className="font-semibold text-blue-800">{formatDateOnly(periodo.fechaInicio)}</span>
                      </div>
                      
                      <div className="bg-white/80 p-4 rounded-xl">
                        <span className="text-blue-600 font-medium block mb-1">Fecha de Fin:</span>
                        <span className="font-semibold text-blue-800">{formatDateOnly(periodo.fechaFin)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Información de Auditoría */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="text-lg font-bold text-gray-700 mb-4">Información de Registro</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/60 p-4 rounded-xl">
                        <span className="text-[#666666] font-medium block mb-1">Fecha de Registro:</span>
                        <span className="font-semibold text-[#333333]">{formatDate(periodo.creadoEn)}</span>
                      </div>
                      
                      <div className="bg-white/60 p-4 rounded-xl">
                        <span className="text-[#666666] font-medium block mb-1">Última Actualización:</span>
                        <span className="font-semibold text-[#333333]">{formatDate(periodo.actualizadoEn)}</span>
                      </div>

                      <div className="bg-white/60 p-4 rounded-xl">
                        <span className="text-[#666666] font-medium block mb-1">Creado Por:</span>
                        <span className="font-semibold text-[#333333]">
                          {periodo.creador ? 
                            `${periodo.creador.nombres} ${periodo.creador.apellidos}` : 
                            'Información no disponible'
                          }
                        </span>
                      </div>

                      <div className="bg-white/60 p-4 rounded-xl">
                        <span className="text-[#666666] font-medium block mb-1">Colegio:</span>
                        <span className="font-semibold text-[#333333]">
                          {periodo.colegio?.nombre || 'Información no disponible'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-end">
                    <button
                      onClick={onClose}
                      className="px-8 py-3 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white rounded-xl hover:from-[#D96924] hover:to-[#8D2C1D] focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] transition-all duration-200 flex items-center gap-2 font-semibold"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      Cerrar
                    </button>
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
