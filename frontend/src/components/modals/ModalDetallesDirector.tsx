'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface Director {
  id: number;
  usuarioRol: {
    usuario: {
      id: number;
      email: string;
      dni: string;
      nombres: string;
      apellidos: string;
      telefono: string;
      estado: string;
      creado_en: string;
    };
    colegio: {
      id: number;
      nombre: string;
      codigoModular: string;
      distrito: string;
      direccion: string;
      ugel: {
        nombre: string;
        dre: {
          nombre: string;
        };
      };
    };
    hecho_en: string;
  };
  fechaNacimiento: string | null;
  sexo: string | null;
  estadoCivil: string | null;
  nacionalidad: string | null;
  direccion: string | null;
  gradoAcademico: string | null;
  carrera: string | null;
  especializacion: string | null;
  institucionEgreso: string | null;
  fechaInicio: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

interface ModalDetallesDirectorProps {
  isOpen: boolean;
  onClose: () => void;
  directorId: number;
}

export default function ModalDetallesDirector({ isOpen, onClose, directorId }: ModalDetallesDirectorProps) {
  const [director, setDirector] = useState<Director | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && directorId) {
      cargarDirector();
    }
  }, [isOpen, directorId]);

  const cargarDirector = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/directores/${directorId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al cargar director');
      const data = await response.json();
      setDirector(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar los detalles del director');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No registrado';
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
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
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D] mx-auto"></div>
                    <p className="mt-4 text-[#666666]">Cargando detalles...</p>
                  </div>
                ) : director ? (
                  <>
                    {/* Header con gradiente */}
                    <div className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] p-8 text-white">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold">
                            {director.usuarioRol.usuario.nombres?.charAt(0)}
                            {director.usuarioRol.usuario.apellidos?.charAt(0)}
                          </div>
                          <div>
                            <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-poppins)' }}>
                              {director.usuarioRol.usuario.nombres} {director.usuarioRol.usuario.apellidos}
                            </h2>
                            <p className="text-white/80">Director de Institución Educativa</p>
                            <div className="mt-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  director.usuarioRol.usuario.estado === 'activo'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-red-500 text-white'
                                }`}
                              >
                                {director.usuarioRol.usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
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
                    <div className="p-8 max-h-[600px] overflow-y-auto">
                      {/* Datos Básicos */}
                      <div className="mb-8">
                        <h3 className="text-xl font-bold text-[#8D2C1D] mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-poppins)' }}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Datos Básicos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FCE0C1] p-6 rounded-lg">
                          <InfoField label="Email" value={director.usuarioRol.usuario.email} />
                          <InfoField label="DNI" value={director.usuarioRol.usuario.dni || 'No registrado'} />
                          <InfoField label="Teléfono" value={director.usuarioRol.usuario.telefono || 'No registrado'} />
                          <InfoField label="ID de Usuario" value={`#${director.usuarioRol.usuario.id}`} />
                        </div>
                      </div>

                      {/* Colegio Asignado */}
                      <div className="mb-8">
                        <h3 className="text-xl font-bold text-[#8D2C1D] mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-poppins)' }}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Colegio Asignado
                        </h3>
                        <div className="bg-gradient-to-br from-[#E9E1C9] to-[#F6CBA3] p-6 rounded-lg border-2 border-[#8D2C1D]">
                          <h4 className="text-xl font-bold text-[#8D2C1D] mb-2">{director.usuarioRol.colegio.nombre}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <InfoField label="Código Modular" value={director.usuarioRol.colegio.codigoModular} />
                            <InfoField label="Distrito" value={director.usuarioRol.colegio.distrito || 'No registrado'} />
                            <InfoField label="UGEL" value={director.usuarioRol.colegio.ugel.nombre} />
                            <InfoField label="DRE" value={director.usuarioRol.colegio.ugel.dre.nombre} />
                            <div className="md:col-span-2">
                              <InfoField label="Dirección" value={director.usuarioRol.colegio.direccion || 'No registrada'} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Datos Personales */}
                      <div className="mb-8">
                        <h3 className="text-xl font-bold text-[#8D2C1D] mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-poppins)' }}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Datos Personales
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FCE0C1] p-6 rounded-lg">
                          <InfoField label="Fecha de Nacimiento" value={formatDate(director.fechaNacimiento)} />
                          <InfoField label="Sexo" value={director.sexo || 'No registrado'} />
                          <InfoField label="Estado Civil" value={director.estadoCivil || 'No registrado'} />
                          <InfoField label="Nacionalidad" value={director.nacionalidad || 'No registrada'} />
                          <div className="md:col-span-2">
                            <InfoField label="Dirección" value={director.direccion || 'No registrada'} />
                          </div>
                        </div>
                      </div>

                      {/* Formación Académica */}
                      <div className="mb-8">
                        <h3 className="text-xl font-bold text-[#8D2C1D] mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-poppins)' }}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          </svg>
                          Formación Académica
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FCE0C1] p-6 rounded-lg">
                          <InfoField label="Grado Académico" value={director.gradoAcademico || 'No registrado'} />
                          <InfoField label="Carrera" value={director.carrera || 'No registrada'} />
                          <InfoField label="Especialización" value={director.especializacion || 'No registrada'} />
                          <InfoField label="Institución de Egreso" value={director.institucionEgreso || 'No registrada'} />
                          <InfoField label="Fecha de Inicio" value={formatDate(director.fechaInicio)} />
                        </div>
                      </div>

                      {/* Auditoría */}
                      <div className="border-t-2 border-[#E9E1C9] pt-6">
                        <h3 className="text-xl font-bold text-[#8D2C1D] mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-poppins)' }}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Información de Auditoría
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#E9E1C9] p-6 rounded-lg">
                          <InfoField label="Registrado el" value={formatDateTime(director.creadoEn)} />
                          <InfoField label="Última actualización" value={formatDateTime(director.actualizadoEn)} />
                          <InfoField label="Asignado el" value={formatDateTime(director.usuarioRol.hecho_en)} />
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-[#F6CBA3] p-6 flex justify-end">
                      <button
                        onClick={onClose}
                        className="px-6 py-3 bg-[#8D2C1D] hover:bg-[#84261A] text-white rounded-lg transition-colors font-medium"
                      >
                        Cerrar
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-[#666666]">No se pudo cargar la información del director</p>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Componente auxiliar para mostrar campos de información
function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#666666] mb-1">{label}</p>
      <p className="text-sm text-[#333333] font-medium">{value}</p>
    </div>
  );
}
