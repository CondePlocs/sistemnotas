'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Curso, obtenerColorCurso, NIVELES_EDUCATIVOS } from '@/types/curso';

interface ModalCompetenciasCursoProps {
  isOpen: boolean;
  onClose: () => void;
  cursoId: number;
}

export default function ModalCompetenciasCurso({ isOpen, onClose, cursoId }: ModalCompetenciasCursoProps) {
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && cursoId) {
      cargarCurso();
    }
  }, [isOpen, cursoId]);

  const cargarCurso = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/cursos/${cursoId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al cargar curso');
      const data = await response.json();
      setCurso(data.curso);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar los datos del curso');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const nivelInfo = NIVELES_EDUCATIVOS.find(n => n.valor === curso?.nivel?.nombre);

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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D] mx-auto"></div>
                    <p className="mt-4 text-[#666666]">Cargando datos...</p>
                  </div>
                ) : curso ? (
                  <>
                    {/* Header con color del curso */}
                    <div 
                      className="px-8 py-6 text-white"
                      style={{ backgroundColor: obtenerColorCurso(curso.color) }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Dialog.Title
                            as="h3"
                            className="text-2xl font-bold mb-2"
                            style={{ fontFamily: 'var(--font-poppins)' }}
                          >
                            {curso.nombre}
                          </Dialog.Title>
                          <div className="flex items-center gap-4 text-white/90 text-sm">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                              </svg>
                              {nivelInfo?.label}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              {curso.competencias?.length || 0} competencias
                            </span>
                          </div>
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
                      {/* Descripción */}
                      {curso.descripcion && (
                        <div className="mb-6 p-4 bg-[#FCE0C1] rounded-xl">
                          <h4 className="text-sm font-bold text-[#8D2C1D] mb-2">Descripción</h4>
                          <p className="text-[#333333]">{curso.descripcion}</p>
                        </div>
                      )}

                      {/* Información del curso */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-[#E9E1C9] rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-[#8D2C1D]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-semibold text-[#666666]">Fecha de Creación</span>
                          </div>
                          <p className="text-[#333333] font-medium">
                            {new Date(curso.creadoEn).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>

                        <div className="bg-[#E9E1C9] rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-[#8D2C1D]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-semibold text-[#666666]">Última Actualización</span>
                          </div>
                          <p className="text-[#333333] font-medium">
                            {new Date(curso.actualizadoEn).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Competencias */}
                      <div className="bg-gradient-to-br from-[#FCE0C1] to-[#E9E1C9] rounded-xl p-6">
                        <h4 className="text-lg font-bold text-[#8D2C1D] mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                          </svg>
                          Competencias del Curso
                        </h4>
                        
                        {curso.competencias && curso.competencias.length > 0 ? (
                          <div className="space-y-3">
                            {curso.competencias
                              .sort((a, b) => a.orden - b.orden)
                              .map((competencia, index) => (
                                <div
                                  key={competencia.id}
                                  className="bg-white p-4 rounded-lg border-2 border-[#E9E1C9] hover:border-[#8D2C1D] transition-all"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                      <div className="w-8 h-8 rounded-full bg-[#8D2C1D] text-white flex items-center justify-center font-bold text-sm">
                                        {index + 1}
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-[#333333] font-medium leading-relaxed">
                                        {competencia.nombre}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-[#666666] text-center py-8">
                            Este curso no tiene competencias definidas
                          </p>
                        )}
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
