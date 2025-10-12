'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { NivelEducativo } from '@/types/colegio';

interface NivelDisponible {
  id: number;
  nombre: string;
  puedeCrearSalones: boolean;
}

interface ModalSeleccionNivelProps {
  isOpen: boolean;
  onClose: () => void;
  niveles: NivelDisponible[];
  onSeleccionarNivel: (nivel: NivelEducativo) => void;
}

function NivelCard({ nivel, onSeleccionar }: { 
  nivel: NivelDisponible; 
  onSeleccionar: (nivel: NivelEducativo) => void;
}) {
  const getCardInfo = (nombreNivel: string) => {
    switch (nombreNivel) {
      case 'INICIAL':
        return {
          icon: '👶',
          titulo: 'Inicial',
          descripcion: 'Crear salones de 3, 4 y 5 años',
          color: 'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 hover:from-pink-100 hover:to-pink-200',
          buttonColor: 'bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800'
        };
      case 'PRIMARIA':
        return {
          icon: '📚',
          titulo: 'Primaria',
          descripcion: 'Crear salones de 1° a 6° grado',
          color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200',
          buttonColor: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
        };
      case 'SECUNDARIA':
        return {
          icon: '🎓',
          titulo: 'Secundaria',
          descripcion: 'Crear salones de 1° a 5° año',
          color: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200',
          buttonColor: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
        };
      default:
        return {
          icon: '🏫',
          titulo: nombreNivel,
          descripcion: 'Crear salones para este nivel',
          color: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:from-gray-100 hover:to-gray-200',
          buttonColor: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
        };
    }
  };

  const info = getCardInfo(nivel.nombre);

  return (
    <div className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${info.color}`}>
      <div className="text-center">
        <div className="text-5xl mb-4">{info.icon}</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{info.titulo}</h3>
        <p className="text-gray-600 mb-6">{info.descripcion}</p>
        
        <button
          onClick={() => onSeleccionar(nivel.nombre as NivelEducativo)}
          className={`w-full text-white py-3 px-6 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl ${info.buttonColor}`}
        >
          Seleccionar {info.titulo}
        </button>
      </div>
    </div>
  );
}

export default function ModalSeleccionNivel({ 
  isOpen, 
  onClose, 
  niveles, 
  onSeleccionarNivel 
}: ModalSeleccionNivelProps) {
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
                      <span className="text-3xl">🏫</span>
                    </div>
                    <div className="text-left">
                      <h2 className="text-2xl font-bold">Crear Salones</h2>
                      <p className="text-white/80 mt-1">Selecciona el nivel educativo para crear salones</p>
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                  {niveles.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🏫</div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        No hay niveles disponibles
                      </h3>
                      <p className="text-gray-600">
                        Contacta al administrador para configurar los niveles educativos de tu colegio.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Niveles Educativos Disponibles
                        </h3>
                        <p className="text-gray-600">
                          Selecciona un nivel para proceder con la creación de salones
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {niveles.map((nivel) => (
                          <NivelCard
                            key={nivel.id}
                            nivel={nivel}
                            onSeleccionar={onSeleccionarNivel}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
                  <div className="flex justify-end">
                    <button
                      onClick={onClose}
                      className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                    >
                      Cancelar
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
