'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Colegio } from '@/types/colegio';

interface ModalDetallesColegioProps {
  isOpen: boolean;
  onClose: () => void;
  colegioId: number;
}

export default function ModalDetallesColegio({ isOpen, onClose, colegioId }: ModalDetallesColegioProps) {
  const [colegio, setColegio] = useState<Colegio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && colegioId) {
      cargarColegio();
    }
  }, [isOpen, colegioId]);

  const cargarColegio = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/colegios/${colegioId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al cargar colegio');
      const data = await response.json();
      setColegio(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar los datos del colegio');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getNiveles = () => {
    if (!colegio?.nivelesPermitidos || colegio.nivelesPermitidos.length === 0) {
      return 'Sin niveles autorizados';
    }
    return colegio.nivelesPermitidos
      .filter(n => n.nivel)
      .map(n => n.nivel!.nombre)
      .join(', ');
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
          <div className="fixed inset-0 bg-black/65 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D] mx-auto"></div>
                    <p className="mt-4 text-[#666666]">Cargando datos...</p>
                  </div>
                ) : colegio ? (
                  <>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] px-8 py-6 text-white">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Dialog.Title
                            as="h3"
                            className="text-2xl font-bold mb-2"
                            style={{ fontFamily: 'var(--font-poppins)' }}
                          >
                            {colegio.nombre}
                          </Dialog.Title>
                          {colegio.codigoModular && (
                            <p className="text-white/90 text-sm">
                              Código Modular: {colegio.codigoModular}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={onClose}
                          className="text-white/80 hover:text-white transition-colors ml-4"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Ubicación Geográfica */}
                        <div className="bg-[#FCE0C1] rounded-xl p-5">
                          <h4 className="text-lg font-bold text-[#8D2C1D] mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Ubicación Geográfica
                          </h4>
                          <div className="space-y-3">
                            {colegio.distrito && (
                              <div>
                                <span className="text-sm font-semibold text-[#666666]">Distrito:</span>
                                <p className="text-[#333333] font-medium">{colegio.distrito}</p>
                              </div>
                            )}
                            {colegio.direccion && (
                              <div>
                                <span className="text-sm font-semibold text-[#666666]">Dirección:</span>
                                <p className="text-[#333333] font-medium">{colegio.direccion}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Ubicación Administrativa */}
                        <div className="bg-[#E9E1C9] rounded-xl p-5">
                          <h4 className="text-lg font-bold text-[#8D2C1D] mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Ubicación Administrativa
                          </h4>
                          <div className="space-y-3">
                            {colegio.ugel?.dre && (
                              <div>
                                <span className="text-sm font-semibold text-[#666666]">DRE:</span>
                                <p className="text-[#333333] font-medium">{colegio.ugel.dre.nombre}</p>
                              </div>
                            )}
                            {colegio.ugel && (
                              <div>
                                <span className="text-sm font-semibold text-[#666666]">UGEL:</span>
                                <p className="text-[#333333] font-medium">{colegio.ugel.nombre}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Niveles Educativos */}
                        <div className="md:col-span-2 bg-gradient-to-br from-[#D96924]/10 to-[#8D2C1D]/10 rounded-xl p-5">
                          <h4 className="text-lg font-bold text-[#8D2C1D] mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Niveles Educativos Autorizados
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {colegio.nivelesPermitidos && colegio.nivelesPermitidos.length > 0 ? (
                              colegio.nivelesPermitidos
                                .filter(nivel => nivel.nivel)
                                .map((nivel) => (
                                  <div
                                    key={nivel.nivel!.id}
                                    className="bg-white px-4 py-2 rounded-lg border-2 border-[#8D2C1D] shadow-sm"
                                  >
                                    <span className="text-[#8D2C1D] font-semibold">{nivel.nivel!.nombre}</span>
                                  </div>
                                ))
                            ) : (
                              <p className="text-[#666666]">Sin niveles autorizados</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botón cerrar */}
                      <div className="mt-8 flex justify-end">
                        <button
                          onClick={onClose}
                          className="px-6 py-3 bg-[#8D2C1D] hover:bg-[#84261A] text-white rounded-lg font-medium transition-colors"
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
