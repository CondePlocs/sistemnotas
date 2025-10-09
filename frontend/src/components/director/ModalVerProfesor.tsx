'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ModalVerProfesorProps } from '@/types/profesor';

export default function ModalVerProfesor({ isOpen, onClose, profesor }: ModalVerProfesorProps) {
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
      month: 'long',
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-xl font-bold text-white">
                          {profesor.usuarioRol.usuario.nombres} {profesor.usuarioRol.usuario.apellidos}
                        </Dialog.Title>
                        <p className="text-white/80 text-sm">
                          {profesor.especialidad || 'Profesor'} • {profesor.usuarioRol.colegio.nombre}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  
                  {/* Estado del usuario */}
                  <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-[#8D2C1D]">Estado del Usuario</h4>
                        <p className="text-sm text-[#666666]">Estado actual en el sistema</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        profesor.usuarioRol.usuario.estado === 'activo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {profesor.usuarioRol.usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Datos del Usuario */}
                    <div className="bg-white border-2 border-[#E9E1C9] rounded-xl p-6">
                      <h4 className="text-lg font-bold text-[#8D2C1D] mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                        Datos del Usuario
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-[#666666]">Email</label>
                          <p className="text-[#333333] font-medium">{profesor.usuarioRol.usuario.email}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-[#666666]">DNI</label>
                          <p className="text-[#333333] font-medium">{profesor.usuarioRol.usuario.dni || 'No especificado'}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-[#666666]">Teléfono</label>
                          <p className="text-[#333333] font-medium">{profesor.usuarioRol.usuario.telefono || 'No especificado'}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-[#666666]">Colegio</label>
                          <p className="text-[#333333] font-medium">{profesor.usuarioRol.colegio.nombre}</p>
                        </div>
                      </div>
                    </div>

                    {/* Datos Personales */}
                    <div className="bg-white border-2 border-[#E9E1C9] rounded-xl p-6">
                      <h4 className="text-lg font-bold text-[#8D2C1D] mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                        </svg>
                        Datos Personales
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-[#666666]">Fecha de Nacimiento</label>
                          <p className="text-[#333333] font-medium">{formatDate(profesor.fechaNacimiento)}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-[#666666]">Sexo</label>
                          <p className="text-[#333333] font-medium">
                            {profesor.sexo ? (profesor.sexo === 'masculino' ? 'Masculino' : 'Femenino') : 'No especificado'}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-[#666666]">Estado Civil</label>
                          <p className="text-[#333333] font-medium">
                            {profesor.estadoCivil ? 
                              profesor.estadoCivil.charAt(0).toUpperCase() + profesor.estadoCivil.slice(1) + 
                              (profesor.estadoCivil === 'soltero' ? '(a)' : profesor.estadoCivil === 'casado' ? '(a)' : 
                               profesor.estadoCivil === 'divorciado' ? '(a)' : profesor.estadoCivil === 'viudo' ? '(a)' : '')
                              : 'No especificado'
                            }
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-[#666666]">Nacionalidad</label>
                          <p className="text-[#333333] font-medium">{profesor.nacionalidad || 'No especificado'}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-[#666666]">Dirección</label>
                          <p className="text-[#333333] font-medium">{profesor.direccion || 'No especificado'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Datos Académicos y Laborales */}
                    <div className="bg-white border-2 border-[#E9E1C9] rounded-xl p-6 lg:col-span-2">
                      <h4 className="text-lg font-bold text-[#8D2C1D] mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                        Datos Académicos y Laborales
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-[#666666]">Especialidad</label>
                          <p className="text-[#333333] font-medium">{profesor.especialidad || 'No especificado'}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-[#666666]">Grado Académico</label>
                          <p className="text-[#333333] font-medium">
                            {profesor.gradoAcademico ? 
                              profesor.gradoAcademico.charAt(0).toUpperCase() + profesor.gradoAcademico.slice(1)
                              : 'No especificado'
                            }
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-[#666666]">Institución de Egreso</label>
                          <p className="text-[#333333] font-medium">{profesor.institucionEgreso || 'No especificado'}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-[#666666]">Fecha de Ingreso</label>
                          <p className="text-[#333333] font-medium">{formatDate(profesor.fechaIngreso)}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-[#666666]">Condición Laboral</label>
                          <p className="text-[#333333] font-medium">
                            {profesor.condicionLaboral ? 
                              profesor.condicionLaboral.charAt(0).toUpperCase() + profesor.condicionLaboral.slice(1)
                              : 'No especificado'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Datos de Auditoría del Usuario */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Auditoría - Datos de Usuario
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-blue-700">Creado en</label>
                          <p className="text-blue-900 font-medium">{formatDateTime(profesor.usuarioRol.usuario.creado_en)}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-blue-700">Actualizado en</label>
                          <p className="text-blue-900 font-medium">{formatDateTime(profesor.usuarioRol.usuario.actualizado_en)}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-blue-700">Rol asignado en</label>
                          <p className="text-blue-900 font-medium">{formatDateTime(profesor.usuarioRol.hecho_en)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Datos de Auditoría del Profesor */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Auditoría - Datos de Profesor
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-green-700">Perfil creado en</label>
                          <p className="text-green-900 font-medium">{formatDateTime(profesor.creadoEn)}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-green-700">Perfil actualizado en</label>
                          <p className="text-green-900 font-medium">{formatDateTime(profesor.actualizadoEn)}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-[#8D2C1D] hover:bg-[#84261A] text-white rounded-lg transition-colors font-medium"
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
