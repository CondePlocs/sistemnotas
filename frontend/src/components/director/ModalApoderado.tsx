'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  ModalApoderadoProps, 
  ApoderadoFormData,
  SEXO_OPTIONS,
  ESTADO_CIVIL_OPTIONS
} from '@/types/apoderado';
import SelectorAlumnos from '@/components/forms/SelectorAlumnos';
import ModalConfirmarPassword from '@/components/modals/ModalConfirmarPassword';

export default function ModalApoderado({ isOpen, onClose, onSuccess, apoderado }: ModalApoderadoProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingData, setPendingData] = useState<ApoderadoFormData | null>(null);

  const [formData, setFormData] = useState<ApoderadoFormData>({
    email: '',
    password: '',
    dni: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    fechaNacimiento: '',
    sexo: '',
    estadoCivil: '',
    nacionalidad: 'Peruana',
    direccion: '',
    ocupacion: '',
    centroTrabajo: '',
    telefonoTrabajo: '',
    alumnos: []
  });

  const isEditMode = !!apoderado;

  // Cargar datos del apoderado si es edición
  useEffect(() => {
    if (apoderado && isOpen) {
      setFormData({
        email: apoderado.usuarioRol.usuario.email,
        dni: apoderado.usuarioRol.usuario.dni || '',
        nombres: apoderado.usuarioRol.usuario.nombres || '',
        apellidos: apoderado.usuarioRol.usuario.apellidos || '',
        telefono: apoderado.usuarioRol.usuario.telefono || '',
        fechaNacimiento: apoderado.fechaNacimiento ? apoderado.fechaNacimiento.split('T')[0] : '',
        sexo: apoderado.sexo || '',
        estadoCivil: apoderado.estadoCivil || '',
        nacionalidad: apoderado.nacionalidad || 'Peruana',
        direccion: apoderado.direccion || '',
        ocupacion: apoderado.ocupacion || '',
        centroTrabajo: apoderado.centroTrabajo || '',
        telefonoTrabajo: apoderado.telefonoTrabajo || '',
        alumnos: apoderado.alumnos?.map(rel => ({
          alumno: rel.alumno,
          parentesco: rel.parentesco,
          esPrincipal: rel.esPrincipal
        })) || []
      });
    } else if (!apoderado && isOpen) {
      // Reset para nuevo apoderado
      setFormData({
        email: '',
        password: '',
        dni: '',
        nombres: '',
        apellidos: '',
        telefono: '',
        fechaNacimiento: '',
        sexo: '',
        estadoCivil: '',
        nacionalidad: 'Peruana',
        direccion: '',
        ocupacion: '',
        centroTrabajo: '',
        telefonoTrabajo: '',
        alumnos: []
      });
    }
  }, [apoderado, isOpen]);

  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setErrores([]);
      setShowPasswordModal(false);
      setPendingData(null);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrores: string[] = [];

    switch (step) {
      case 1: // Datos básicos
        if (!formData.email) newErrores.push('El email es obligatorio');
        if (!isEditMode && !formData.password) newErrores.push('La contraseña es obligatoria');
        if (!formData.nombres) newErrores.push('Los nombres son obligatorios');
        if (!formData.apellidos) newErrores.push('Los apellidos son obligatorios');
        break;
      case 2: // Relación con estudiantes
        if (formData.alumnos.length === 0) {
          newErrores.push('Debe seleccionar al menos un alumno');
        }
        if (!formData.alumnos.some(a => a.esPrincipal)) {
          newErrores.push('Debe marcar al menos un alumno como apoderado principal');
        }
        break;
    }

    setErrores(newErrores);
    return newErrores.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    setErrores([]);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    if (isEditMode) {
      setPendingData(formData);
      setShowPasswordModal(true);
    } else {
      await submitForm(formData);
    }
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!pendingData) return;

    try {
      // Verificar contraseña
      const verifyResponse = await fetch('http://localhost:3001/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      if (!verifyResponse.ok) {
        alert('Contraseña incorrecta');
        return;
      }

      await submitForm(pendingData);
      setShowPasswordModal(false);
      setPendingData(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al verificar la contraseña');
    }
  };

  const submitForm = async (data: ApoderadoFormData) => {
    setLoading(true);

    try {
      const url = isEditMode 
        ? `http://localhost:3001/api/apoderados/${apoderado!.id}`
        : 'http://localhost:3001/api/apoderados';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const dataToSend = {
        ...data,
        alumnos: data.alumnos.map(item => ({
          alumnoId: item.alumno.id,
          parentesco: item.parentesco,
          esPrincipal: item.esPrincipal
        }))
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `Error al ${isEditMode ? 'actualizar' : 'crear'} apoderado`);
      }

      alert(`Apoderado ${isEditMode ? 'actualizado' : 'creado'} exitosamente`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : `Error al ${isEditMode ? 'actualizar' : 'crear'} apoderado`);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Datos Básicos', description: 'Información personal del apoderado' },
    { number: 2, title: 'Relación con Estudiantes', description: 'Seleccionar alumnos a cargo' },
    { number: 3, title: 'Datos Personales', description: 'Información adicional' },
    { number: 4, title: 'Datos Laborales', description: 'Información profesional' }
  ];

  return (
    <>
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
                      <div>
                        <Dialog.Title className="text-xl font-bold text-white">
                          {isEditMode ? 'Editar Apoderado' : 'Nuevo Apoderado'}
                        </Dialog.Title>
                        <p className="text-orange-100 text-sm">
                          {steps[currentStep - 1]?.description}
                        </p>
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

                  {/* Progress Steps */}
                  <div className="px-6 py-4 bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                      {steps.map((step, index) => (
                        <div key={step.number} className="flex items-center">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                            currentStep >= step.number
                              ? 'bg-[#8D2C1D] text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {step.number}
                          </div>
                          <div className="ml-2 hidden sm:block">
                            <p className={`text-sm font-medium ${
                              currentStep >= step.number ? 'text-[#8D2C1D]' : 'text-gray-500'
                            }`}>
                              {step.title}
                            </p>
                          </div>
                          {index < steps.length - 1 && (
                            <div className={`w-12 h-0.5 mx-4 ${
                              currentStep > step.number ? 'bg-[#8D2C1D]' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-6 py-6 max-h-96 overflow-y-auto">
                    {/* Errores */}
                    {errores.length > 0 && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex">
                          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                              Corrige los siguientes errores:
                            </h3>
                            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                              {errores.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 1: Datos Básicos */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email *
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] text-gray-900 placeholder:text-gray-400"
                              placeholder="apoderado@ejemplo.com"
                            />
                          </div>

                          {!isEditMode && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña *
                              </label>
                              <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] text-gray-900 placeholder:text-gray-400"
                                placeholder="Contraseña temporal"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nombres *
                            </label>
                            <input
                              type="text"
                              name="nombres"
                              value={formData.nombres}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] text-gray-900 placeholder:text-gray-400"
                              placeholder="María Elena"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Apellidos *
                            </label>
                            <input
                              type="text"
                              name="apellidos"
                              value={formData.apellidos}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] text-gray-900 placeholder:text-gray-400"
                              placeholder="Rodríguez Pérez"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              DNI
                            </label>
                            <input
                              type="text"
                              name="dni"
                              value={formData.dni}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] text-gray-900 placeholder:text-gray-400"
                              placeholder="12345678"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Teléfono
                            </label>
                            <input
                              type="tel"
                              name="telefono"
                              value={formData.telefono}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] text-gray-900 placeholder:text-gray-400"
                              placeholder="987654321"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Relación con Estudiantes */}
                    {currentStep === 2 && (
                      <div>
                        <SelectorAlumnos
                          alumnosSeleccionados={formData.alumnos}
                          onAlumnosChange={(alumnos) => setFormData(prev => ({ ...prev, alumnos }))}
                          disabled={loading}
                        />
                      </div>
                    )}

                    {/* Step 3: Datos Personales */}
                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fecha de Nacimiento
                            </label>
                            <input
                              type="date"
                              name="fechaNacimiento"
                              value={formData.fechaNacimiento}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] text-gray-900 placeholder:text-gray-400"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Sexo
                            </label>
                            <select
                              name="sexo"
                              value={formData.sexo}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] text-gray-900 placeholder:text-gray-400"
                            >
                              <option value="">Seleccionar</option>
                              {SEXO_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Estado Civil
                            </label>
                            <select
                              name="estadoCivil"
                              value={formData.estadoCivil}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] text-gray-900 placeholder:text-gray-400"
                            >
                              <option value="">Seleccionar</option>
                              {ESTADO_CIVIL_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nacionalidad
                            </label>
                            <input
                              type="text"
                              name="nacionalidad"
                              value={formData.nacionalidad}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] text-gray-900 placeholder:text-gray-400"
                              placeholder="Peruana"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Dirección
                            </label>
                            <input
                              type="text"
                              name="direccion"
                              value={formData.direccion}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] text-gray-900 placeholder:text-gray-400"
                              placeholder="Jr. Los Olivos 456, Lima"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Datos Laborales */}
                    {currentStep === 4 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ocupación
                            </label>
                            <input
                              type="text"
                              name="ocupacion"
                              value={formData.ocupacion}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] text-gray-900 placeholder:text-gray-400"
                              placeholder="Contador, Ingeniero, etc."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Centro de Trabajo
                            </label>
                            <input
                              type="text"
                              name="centroTrabajo"
                              value={formData.centroTrabajo}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] text-gray-900 placeholder:text-gray-400"
                              placeholder="Empresa ABC S.A.C."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Teléfono de Trabajo
                            </label>
                            <input
                              type="tel"
                              name="telefonoTrabajo"
                              value={formData.telefonoTrabajo}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] text-gray-900 placeholder:text-gray-400"
                              placeholder="01-1234567"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
                    <button
                      type="button"
                      onClick={currentStep === 1 ? onClose : handlePrevious}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      {currentStep === 1 ? 'Cancelar' : 'Anterior'}
                    </button>

                    <div className="flex gap-2">
                      {currentStep < 4 ? (
                        <button
                          type="button"
                          onClick={handleNext}
                          className="px-6 py-2 bg-[#8D2C1D] text-white rounded-lg hover:bg-[#A0522D] transition-colors"
                        >
                          Siguiente
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={loading}
                          className="px-6 py-2 bg-[#8D2C1D] text-white rounded-lg hover:bg-[#A0522D] disabled:opacity-50 transition-colors"
                        >
                          {loading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear')} Apoderado
                        </button>
                      )}
                    </div>
                  </div>

                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de confirmación de contraseña */}
      {showPasswordModal && (
        <ModalConfirmarPassword
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setPendingData(null);
          }}
          onConfirm={handlePasswordConfirm}
          title="Confirmar Actualización"
          message="Para actualizar los datos del apoderado, ingresa tu contraseña por seguridad."
        />
      )}
    </>
  );
}
