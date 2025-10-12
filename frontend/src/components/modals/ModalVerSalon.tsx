'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, AcademicCapIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Salon } from '@/types/salon';

interface ModalVerSalonProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon | null;
}

export default function ModalVerSalon({ isOpen, onClose, salon }: ModalVerSalonProps) {
  if (!salon) return null;

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

  const getNivelInfo = (nivel: string) => {
    switch (nivel) {
      case 'INICIAL':
        return { icon: '👶', titulo: 'Inicial', color: 'pink' };
      case 'PRIMARIA':
        return { icon: '📚', titulo: 'Primaria', color: 'blue' };
      case 'SECUNDARIA':
        return { icon: '🎓', titulo: 'Secundaria', color: 'green' };
      default:
        return { icon: '🏫', titulo: 'General', color: 'gray' };
    }
  };

  const nivelInfo = getNivelInfo(salon.colegioNivel?.nivel?.nombre || 'GENERAL');

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
                      <span className="text-3xl">{nivelInfo.icon}</span>
                    </div>
                    <div className="text-left">
                      <h2 className="text-2xl font-bold">Detalles del Salón</h2>
                      <p className="text-white/80 mt-1">{salon.grado} - {salon.seccion}</p>
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                  {/* Información Principal */}
                  <div className="bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9] rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-[#8D2C1D]">{salon.grado} - {salon.seccion}</h3>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                        salon.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <AcademicCapIcon className="w-4 h-4" />
                        {salon.activo ? 'Salón Activo' : 'Salón Inactivo'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/60 p-4 rounded-xl">
                        <span className="text-[#666666] font-medium block mb-1">Nivel Educativo:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{nivelInfo.icon}</span>
                          <span className="font-semibold text-[#333333]">{nivelInfo.titulo}</span>
                        </div>
                      </div>
                      
                      <div className="bg-white/60 p-4 rounded-xl">
                        <span className="text-[#666666] font-medium block mb-1">Turno:</span>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-[#666666]" />
                          <span className="font-semibold text-[#333333]">{salon.turno}</span>
                        </div>
                      </div>
                      
                      <div className="bg-white/60 p-4 rounded-xl">
                        <span className="text-[#666666] font-medium block mb-1">Grado:</span>
                        <span className="font-semibold text-[#333333]">{salon.grado}</span>
                      </div>
                      
                      <div className="bg-white/60 p-4 rounded-xl">
                        <span className="text-[#666666] font-medium block mb-1">Sección:</span>
                        <span className="font-semibold text-[#333333]">{salon.seccion}</span>
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas de Alumnos */}
                  <div className="bg-blue-50 rounded-2xl p-6 mb-6">
                    <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                      <UserGroupIcon className="w-5 h-5" />
                      Alumnos Asignados
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/80 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-blue-800">{salon._count?.alumnos || 0}</div>
                        <div className="text-blue-600 font-medium">Total de Alumnos</div>
                      </div>
                      
                      <div className="bg-white/80 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {salon.alumnos?.filter(a => a.activo).length || 0}
                        </div>
                        <div className="text-green-600 font-medium">Alumnos Activos</div>
                      </div>
                      
                      <div className="bg-white/80 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {salon._count?.cursos || 0}
                        </div>
                        <div className="text-orange-600 font-medium">Cursos Asignados</div>
                      </div>
                    </div>
                  </div>

                  {/* Información de Auditoría */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="text-lg font-bold text-gray-700 mb-4">Información de Registro</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/60 p-4 rounded-xl">
                        <span className="text-[#666666] font-medium block mb-1">Fecha de Creación:</span>
                        <span className="font-semibold text-[#333333]">{formatDate(salon.creadoEn)}</span>
                      </div>
                      
                      <div className="bg-white/60 p-4 rounded-xl">
                        <span className="text-[#666666] font-medium block mb-1">Última Actualización:</span>
                        <span className="font-semibold text-[#333333]">{formatDate(salon.actualizadoEn)}</span>
                      </div>

                      <div className="bg-white/60 p-4 rounded-xl">
                        <span className="text-[#666666] font-medium block mb-1">Creado Por:</span>
                        <span className="font-semibold text-[#333333]">
                          {salon.creador ? 
                            `${salon.creador.nombres} ${salon.creador.apellidos}` : 
                            'Información no disponible'
                          }
                        </span>
                      </div>

                      <div className="bg-white/60 p-4 rounded-xl">
                        <span className="text-[#666666] font-medium block mb-1">Colegio:</span>
                        <span className="font-semibold text-[#333333]">
                          {salon.colegio?.nombre || 'Información no disponible'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
                  <div className="flex justify-end">
                    <button
                      onClick={onClose}
                      className="px-6 py-2 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white rounded-xl hover:from-[#D96924] hover:to-[#8D2C1D] transition-all duration-200 font-semibold"
                    >
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
