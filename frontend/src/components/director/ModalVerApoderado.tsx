'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ModalVerApoderadoProps } from '@/types/apoderado';

export default function ModalVerApoderado({ isOpen, onClose, apoderado }: ModalVerApoderadoProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          <div className="fixed inset-0 bg-black/65 backdrop-blur-sm" />
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
                
                {/* Header */}
                <div className="bg-gradient-to-r from-[#8D2C1D] to-[#A0522D] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <Dialog.Title className="text-xl font-bold text-white text-left">
                          {apoderado.usuarioRol.usuario.nombres} {apoderado.usuarioRol.usuario.apellidos}
                        </Dialog.Title>
                        <p className="text-orange-100 text-sm text-left">
                          {apoderado.ocupacion || 'Apoderado'} • {apoderado.usuarioRol.usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-orange-100 hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Datos del Usuario */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#8D2C1D]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Datos del Usuario
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-gray-900">{apoderado.usuarioRol.usuario.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">DNI</label>
                          <p className="text-gray-900">{apoderado.usuarioRol.usuario.dni || 'No especificado'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Teléfono</label>
                          <p className="text-gray-900">{apoderado.usuarioRol.usuario.telefono || 'No especificado'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Estado</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            apoderado.usuarioRol.usuario.estado === 'activo'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {apoderado.usuarioRol.usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Datos Personales */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#8D2C1D]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                        </svg>
                        Datos Personales
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
                          <p className="text-gray-900">{formatDate(apoderado.fechaNacimiento)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Sexo</label>
                          <p className="text-gray-900 capitalize">{apoderado.sexo || 'No especificado'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Estado Civil</label>
                          <p className="text-gray-900 capitalize">{apoderado.estadoCivil || 'No especificado'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Nacionalidad</label>
                          <p className="text-gray-900">{apoderado.nacionalidad || 'No especificado'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Dirección</label>
                          <p className="text-gray-900">{apoderado.direccion || 'No especificado'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Datos Laborales */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#8D2C1D]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        Datos Laborales
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Ocupación</label>
                          <p className="text-gray-900">{apoderado.ocupacion || 'No especificado'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Centro de Trabajo</label>
                          <p className="text-gray-900">{apoderado.centroTrabajo || 'No especificado'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Teléfono de Trabajo</label>
                          <p className="text-gray-900">{apoderado.telefonoTrabajo || 'No especificado'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Relaciones con Alumnos */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#8D2C1D]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Alumnos a Cargo ({apoderado.alumnos?.filter(rel => rel.activo)?.length || 0})
                      </h3>
                      <div className="space-y-3">
                        {apoderado.alumnos?.filter(rel => rel.activo)?.length > 0 ? (
                          apoderado.alumnos
                            ?.filter(rel => rel.activo)
                            ?.map((relacion, index) => (
                              <div key={index} className="bg-white p-3 rounded-lg border">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {relacion.alumno.nombres} {relacion.alumno.apellidos}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      DNI: {relacion.alumno.dni || 'No especificado'}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-[#8D2C1D] capitalize">
                                      {relacion.parentesco}
                                    </p>
                                    {relacion.esPrincipal && (
                                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-orange-100 text-[#8D2C1D] rounded-full">
                                        Principal
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">
                            No tiene alumnos asignados
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Auditoría */}
                    <div className="lg:col-span-2 bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#8D2C1D]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        Información de Auditoría
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Creado por</label>
                            <p className="text-gray-900">
                              {apoderado.usuarioRol.creadoPor 
                                ? `${apoderado.usuarioRol.creadoPor.nombres || ''} ${apoderado.usuarioRol.creadoPor.apellidos || ''}`.trim() || apoderado.usuarioRol.creadoPor.email
                                : 'Sistema'
                              }
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Fecha de creación</label>
                            <p className="text-gray-900">{formatDateTime(apoderado.usuarioRol.hecho_en)}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Usuario creado</label>
                            <p className="text-gray-900">{formatDateTime(apoderado.usuarioRol.usuario.creado_en)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Última actualización</label>
                            <p className="text-gray-900">
                              {formatDateTime(apoderado.usuarioRol.usuario.actualizado_en || apoderado.actualizadoEn)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-[#8D2C1D] text-white rounded-lg hover:bg-[#A0522D] transition-colors"
                  >
                    Cerrar
                  </button>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
