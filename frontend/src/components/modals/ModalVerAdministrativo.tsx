import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ModalVerAdministrativoProps } from '@/types/administrativo';

const ModalVerAdministrativo: React.FC<ModalVerAdministrativoProps> = ({
  isOpen,
  onClose,
  administrativo,
  onEdit
}) => {
  if (!administrativo) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCargoLabel = (cargo: string) => {
    const cargoMap: { [key: string]: string } = {
      'secretaria': 'Secretaria',
      'coordinador': 'Coordinador',
      'auxiliar': 'Auxiliar',
      'bibliotecario': 'Bibliotecario',
      'psicologo': 'Psicólogo',
      'enfermero': 'Enfermero',
      'conserje': 'Conserje',
      'vigilante': 'Vigilante',
      'otro': 'Otro'
    };
    return cargoMap[cargo] || cargo;
  };

  const getSexoLabel = (sexo?: string) => {
    if (!sexo) return 'No especificado';
    return sexo === 'masculino' ? 'Masculino' : 'Femenino';
  };

  const getEstadoCivilLabel = (estadoCivil?: string) => {
    if (!estadoCivil) return 'No especificado';
    const estadoMap: { [key: string]: string } = {
      'soltero': 'Soltero(a)',
      'casado': 'Casado(a)',
      'divorciado': 'Divorciado(a)',
      'viudo': 'Viudo(a)'
    };
    return estadoMap[estadoCivil] || estadoCivil;
  };

  const getCondicionLaboralLabel = (condicion?: string) => {
    if (!condicion) return 'No especificado';
    const condicionMap: { [key: string]: string } = {
      'nombrado': 'Nombrado',
      'contratado': 'Contratado',
      'cas': 'CAS',
      'locacion': 'Locación de Servicios'
    };
    return condicionMap[condicion] || condicion;
  };

  const isActive = administrativo.usuarioRol.usuario.estado === 'activo';

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
                <div className={`px-6 py-4 ${isActive ? 'bg-gradient-to-r from-[#8D2C1D] to-[#A0522D]' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-xl font-semibold text-white">
                          {administrativo.usuarioRol.usuario.nombres && administrativo.usuarioRol.usuario.apellidos
                            ? `${administrativo.usuarioRol.usuario.nombres} ${administrativo.usuarioRol.usuario.apellidos}`
                            : administrativo.usuarioRol.usuario.email
                          }
                        </Dialog.Title>
                        <p className="text-white/80">
                          {getCargoLabel(administrativo.cargo)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isActive ? 'Activo' : 'Inactivo'}
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
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Información Personal */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-5 h-5 text-[#8D2C1D] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Información Personal
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <span className="text-sm font-medium text-gray-600">Email:</span>
                              <p className="text-gray-900">{administrativo.usuarioRol.usuario.email}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">DNI:</span>
                              <p className="text-gray-900">{administrativo.usuarioRol.usuario.dni || 'No especificado'}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Teléfono:</span>
                              <p className="text-gray-900">{administrativo.usuarioRol.usuario.telefono || 'No especificado'}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Fecha de Nacimiento:</span>
                              <p className="text-gray-900">{formatDate(administrativo.fechaNacimiento)}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Sexo:</span>
                              <p className="text-gray-900">{getSexoLabel(administrativo.sexo)}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Estado Civil:</span>
                              <p className="text-gray-900">{getEstadoCivilLabel(administrativo.estadoCivil)}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Nacionalidad:</span>
                              <p className="text-gray-900">{administrativo.nacionalidad || 'No especificado'}</p>
                            </div>
                          </div>
                          {administrativo.direccion && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Dirección:</span>
                              <p className="text-gray-900">{administrativo.direccion}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Información Laboral */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-5 h-5 text-[#8D2C1D] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                          </svg>
                          Información Laboral
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <span className="text-sm font-medium text-gray-600">Cargo:</span>
                              <p className="text-gray-900 font-medium">{getCargoLabel(administrativo.cargo)}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Condición Laboral:</span>
                              <p className="text-gray-900">{getCondicionLaboralLabel(administrativo.condicionLaboral)}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Fecha de Ingreso:</span>
                              <p className="text-gray-900">{formatDate(administrativo.fechaIngreso)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Información del Sistema */}
                    <div className="space-y-6">
                      {/* Permisos */}
                      {administrativo.permisos && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <svg className="w-5 h-5 text-[#8D2C1D] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Permisos del Sistema
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-1 gap-2">
                              {[
                                { key: 'puedeRegistrarProfesores', label: 'Registrar Profesores' },
                                { key: 'puedeRegistrarAlumnos', label: 'Registrar Alumnos' },
                                { key: 'puedeRegistrarApoderados', label: 'Registrar Apoderados' },
                                { key: 'puedeRegistrarAdministrativos', label: 'Registrar Administrativos' },
                                { key: 'puedeGestionarSalones', label: 'Gestionar Salones' },
                                { key: 'puedeAsignarProfesores', label: 'Asignar Profesores' }
                              ].map(permiso => (
                                <div key={permiso.key} className="flex items-center justify-between">
                                  <span className="text-sm text-gray-700">{permiso.label}</span>
                                  <div className={`flex items-center ${
                                    administrativo.permisos![permiso.key as keyof typeof administrativo.permisos] 
                                      ? 'text-green-600' 
                                      : 'text-red-600'
                                  }`}>
                                    {administrativo.permisos![permiso.key as keyof typeof administrativo.permisos] ? (
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    ) : (
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Auditoría */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-5 h-5 text-[#8D2C1D] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Información del Sistema
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-600">Registrado:</span>
                            <p className="text-gray-900">{formatDateTime(administrativo.creadoEn)}</p>
                          </div>
                          {administrativo.usuarioRol.creadoPor && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Creado por:</span>
                              <p className="text-gray-900">
                                {administrativo.usuarioRol.creadoPor.nombres && administrativo.usuarioRol.creadoPor.apellidos
                                  ? `${administrativo.usuarioRol.creadoPor.nombres} ${administrativo.usuarioRol.creadoPor.apellidos}`
                                  : administrativo.usuarioRol.creadoPor.email
                                }
                              </p>
                            </div>
                          )}
                          {(administrativo as any).actualizadoEn && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Última actualización:</span>
                              <p className="text-gray-900">{formatDateTime((administrativo as any).actualizadoEn)}</p>
                            </div>
                          )}
                          {(administrativo as any).actualizadoPorUsuario && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Actualizado por:</span>
                              <p className="text-gray-900">
                                {(administrativo as any).actualizadoPorUsuario.nombres && (administrativo as any).actualizadoPorUsuario.apellidos
                                  ? `${(administrativo as any).actualizadoPorUsuario.nombres} ${(administrativo as any).actualizadoPorUsuario.apellidos}`
                                  : (administrativo as any).actualizadoPorUsuario.email
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#8D2C1D] border border-transparent rounded-lg hover:bg-[#A0522D] focus:outline-none focus:ring-2 focus:ring-[#8D2C1D]"
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
};

export default ModalVerAdministrativo;
