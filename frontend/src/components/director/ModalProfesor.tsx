'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  ModalProfesorProps, 
  ProfesorFormData,
  SEXO_OPTIONS,
  ESTADO_CIVIL_OPTIONS,
  GRADO_ACADEMICO_OPTIONS,
  CONDICION_LABORAL_OPTIONS
} from '@/types/profesor';
import ModalConfirmarPassword from '@/components/modals/ModalConfirmarPassword';

export default function ModalProfesor({ isOpen, onClose, onSuccess, profesor }: ModalProfesorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingData, setPendingData] = useState<ProfesorFormData | null>(null);

  const [formData, setFormData] = useState<ProfesorFormData>({
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
    especialidad: '',
    gradoAcademico: '',
    institucionEgreso: '',
    fechaIngreso: '',
    condicionLaboral: ''
  });

  const isEditMode = !!profesor;

  // Cargar datos del profesor si es edición
  useEffect(() => {
    if (profesor && isOpen) {
      setFormData({
        email: profesor.usuarioRol.usuario.email,
        dni: profesor.usuarioRol.usuario.dni || '',
        nombres: profesor.usuarioRol.usuario.nombres || '',
        apellidos: profesor.usuarioRol.usuario.apellidos || '',
        telefono: profesor.usuarioRol.usuario.telefono || '',
        fechaNacimiento: profesor.fechaNacimiento ? profesor.fechaNacimiento.split('T')[0] : '',
        sexo: profesor.sexo || '',
        estadoCivil: profesor.estadoCivil || '',
        nacionalidad: profesor.nacionalidad || 'Peruana',
        direccion: profesor.direccion || '',
        especialidad: profesor.especialidad || '',
        gradoAcademico: profesor.gradoAcademico || '',
        institucionEgreso: profesor.institucionEgreso || '',
        fechaIngreso: profesor.fechaIngreso ? profesor.fechaIngreso.split('T')[0] : '',
        condicionLaboral: profesor.condicionLaboral || ''
      });
    } else if (!profesor && isOpen) {
      // Reset para nuevo profesor
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
        especialidad: '',
        gradoAcademico: '',
        institucionEgreso: '',
        fechaIngreso: '',
        condicionLaboral: ''
      });
    }
  }, [profesor, isOpen]);

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
    
    // Limpiar errores al escribir
    if (errores.length > 0) {
      setErrores([]);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: string[] = [];

    if (step === 1) {
      if (!formData.email) newErrors.push('El email es requerido');
      if (!isEditMode && !formData.password) newErrors.push('La contraseña es requerida');
      if (!formData.nombres) newErrors.push('Los nombres son requeridos');
      if (!formData.apellidos) newErrors.push('Los apellidos son requeridos');
    }

    if (step === 2) {
      // Validaciones opcionales para datos personales
      if (formData.fechaNacimiento) {
        const fecha = new Date(formData.fechaNacimiento);
        const hoy = new Date();
        if (fecha > hoy) {
          newErrors.push('La fecha de nacimiento no puede ser futura');
        }
      }
    }

    if (step === 3) {
      // Validaciones opcionales para datos académicos
      if (formData.fechaIngreso) {
        const fecha = new Date(formData.fechaIngreso);
        const hoy = new Date();
        if (fecha > hoy) {
          newErrors.push('La fecha de ingreso no puede ser futura');
        }
      }
    }

    setErrores(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    if (isEditMode) {
      setPendingData(formData);
      setShowPasswordModal(true);
      return;
    }

    await submitData(formData);
  };

  const submitData = async (dataToSend: ProfesorFormData) => {
    setLoading(true);
    try {
      const url = isEditMode 
        ? `http://localhost:3001/api/profesores/${profesor!.id}`
        : 'http://localhost:3001/api/profesores';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el profesor');
      }

      alert(isEditMode ? 'Profesor actualizado exitosamente' : 'Profesor registrado exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar el profesor');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordConfirm = async (password: string) => {
    try {
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

      setShowPasswordModal(false);
      await submitData(pendingData!);
      setPendingData(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al verificar la contraseña');
    }
  };

  const steps = [
    { number: 1, title: 'Datos Básicos' },
    { number: 2, title: 'Datos Personales' },
    { number: 3, title: 'Datos Académicos' }
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
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title as="h3" className="text-2xl font-bold text-[#8D2C1D]">
                      {isEditMode ? 'Editar Profesor' : 'Nuevo Profesor'}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Indicador de pasos */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between">
                      {steps.map((step, index) => (
                        <div key={step.number} className="flex items-center flex-1">
                          <div className="flex flex-col items-center flex-1">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                                currentStep >= step.number
                                  ? 'bg-[#8D2C1D] text-white'
                                  : 'bg-[#E9E1C9] text-[#666666]'
                              }`}
                            >
                              {step.number}
                            </div>
                            <span
                              className={`mt-2 text-sm font-medium ${
                                currentStep >= step.number ? 'text-[#8D2C1D]' : 'text-[#666666]'
                              }`}
                            >
                              {step.title}
                            </span>
                          </div>
                          {index < steps.length - 1 && (
                            <div
                              className={`h-1 flex-1 mx-2 rounded transition-all ${
                                currentStep > step.number ? 'bg-[#8D2C1D]' : 'bg-[#E9E1C9]'
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Errores */}
                  {errores.length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <h3 className="text-sm font-medium text-red-800">
                          Se encontraron errores:
                        </h3>
                      </div>
                      <ul className="list-disc list-inside text-sm text-red-700">
                        {errores.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Contenido del paso */}
                  <div className="min-h-[400px]">
                    
                    {/* Paso 1: Datos Básicos */}
                    {currentStep === 1 && (
                      <div className="bg-[#FCE0C1] p-6 rounded-xl">
                        <h4 className="text-lg font-bold text-[#8D2C1D] mb-4">Datos Básicos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          <div>
                            <label className="block text-sm font-medium text-[#333333] mb-2">
                              Email *
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="profesor@colegio.edu.pe"
                              className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all text-[#333333] placeholder:text-[#999999]"
                              disabled={isEditMode}
                            />
                          </div>

                          {!isEditMode && (
                            <div>
                              <label className="block text-sm font-medium text-[#333333] mb-2">
                                Contraseña *
                              </label>
                              <input
                                type="password"
                                name="password"
                                value={formData.password || ''}
                                onChange={handleInputChange}
                                placeholder="Contraseña temporal"
                                className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all text-[#333333] placeholder:text-[#999999]"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-[#333333] mb-2">
                              DNI
                            </label>
                            <input
                              type="text"
                              name="dni"
                              value={formData.dni}
                              onChange={handleInputChange}
                              placeholder="12345678"
                              maxLength={8}
                              className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all text-[#333333] placeholder:text-[#999999]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#333333] mb-2">
                              Nombres *
                            </label>
                            <input
                              type="text"
                              name="nombres"
                              value={formData.nombres}
                              onChange={handleInputChange}
                              placeholder="Juan Carlos"
                              className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all text-[#333333] placeholder:text-[#999999]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#333333] mb-2">
                              Apellidos *
                            </label>
                            <input
                              type="text"
                              name="apellidos"
                              value={formData.apellidos}
                              onChange={handleInputChange}
                              placeholder="García López"
                              className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all text-[#333333] placeholder:text-[#999999]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#333333] mb-2">
                              Teléfono
                            </label>
                            <input
                              type="tel"
                              name="telefono"
                              value={formData.telefono}
                              onChange={handleInputChange}
                              placeholder="987654321"
                              className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all text-[#333333] placeholder:text-[#999999]"
                            />
                          </div>

                        </div>
                      </div>
                    )}

                    {/* Paso 2: Datos Personales */}
                    {currentStep === 2 && (
                      <div className="bg-[#E9E1C9] p-6 rounded-xl">
                        <h4 className="text-lg font-bold text-[#8D2C1D] mb-4">Datos Personales</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          <div>
                            <label className="block text-sm font-medium text-[#333333] mb-2">
                              Fecha de Nacimiento
                            </label>
                            <input
                              type="date"
                              name="fechaNacimiento"
                              value={formData.fechaNacimiento}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all text-[#333333] bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#333333] mb-2">
                              Sexo
                            </label>
                            <select
                              name="sexo"
                              value={formData.sexo}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all text-[#333333] bg-white"
                            >
                              <option value="">Seleccionar</option>
                              {SEXO_OPTIONS.map(option => (
                                <option key={option.value} value={option.value} className="text-[#333333]">
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#333333] mb-2">
                              Estado Civil
                            </label>
                            <select
                              name="estadoCivil"
                              value={formData.estadoCivil}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all text-[#333333] bg-white"
                            >
                              <option value="">Seleccionar</option>
                              {ESTADO_CIVIL_OPTIONS.map(option => (
                                <option key={option.value} value={option.value} className="text-[#333333]">
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#333333] mb-2">
                              Nacionalidad
                            </label>
                            <input
                              type="text"
                              name="nacionalidad"
                              value={formData.nacionalidad}
                              onChange={handleInputChange}
                              placeholder="Peruana"
                              className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all text-[#333333] placeholder:text-[#999999]"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-[#333333] mb-2">
                              Dirección
                            </label>
                            <input
                              type="text"
                              name="direccion"
                              value={formData.direccion}
                              onChange={handleInputChange}
                              placeholder="Av. Principal 123, Distrito, Provincia"
                              className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all text-[#333333] placeholder:text-[#999999]"
                            />
                          </div>

                        </div>
                      </div>
                    )}

                    {/* Paso 3: Datos Académicos y Laborales */}
                    {currentStep === 3 && (
                      <div className="bg-[#FCE0C1] p-6 rounded-xl">
                        <h4 className="text-lg font-bold text-[#8D2C1D] mb-4">Datos Académicos y Laborales</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          <div>
                            <label className="block text-sm font-medium text-[#333333] mb-2">
                              Especialidad
                            </label>
                            <input
                              type="text"
                              name="especialidad"
                              value={formData.especialidad}
                              onChange={handleInputChange}
                              placeholder="Matemáticas, Comunicación, etc."
                              className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all text-[#333333] placeholder:text-[#999999]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#333333] mb-2">
                              Grado Académico
                            </label>
                            <select
                              name="gradoAcademico"
                              value={formData.gradoAcademico}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all text-[#333333] bg-white"
                            >
                              <option value="">Seleccionar</option>
                              {GRADO_ACADEMICO_OPTIONS.map(option => (
                                <option key={option.value} value={option.value} className="text-[#333333]">
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#333333] mb-2">
                              Institución de Egreso
                            </label>
                            <input
                              type="text"
                              name="institucionEgreso"
                              value={formData.institucionEgreso}
                              onChange={handleInputChange}
                              placeholder="Universidad Nacional, Instituto Superior, etc."
                              className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all text-[#333333] placeholder:text-[#999999]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#333333] mb-2">
                              Fecha de Ingreso
                            </label>
                            <input
                              type="date"
                              name="fechaIngreso"
                              value={formData.fechaIngreso}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all text-[#333333] bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#333333] mb-2">
                              Condición Laboral
                            </label>
                            <select
                              name="condicionLaboral"
                              value={formData.condicionLaboral}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all text-[#333333] bg-white"
                            >
                              <option value="">Seleccionar</option>
                              {CONDICION_LABORAL_OPTIONS.map(option => (
                                <option key={option.value} value={option.value} className="text-[#333333]">
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                        </div>
                      </div>
                    )}

                  </div>

                  {/* Botones de navegación */}
                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#E9E1C9]">
                    <div>
                      {currentStep > 1 && (
                        <button
                          onClick={handlePrevious}
                          className="px-6 py-3 bg-white border-2 border-[#E9E1C9] text-[#666666] rounded-lg hover:border-[#8D2C1D] hover:text-[#8D2C1D] transition-colors font-medium"
                        >
                          Anterior
                        </button>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={onClose}
                        className="px-6 py-3 bg-white border-2 border-[#E9E1C9] text-[#666666] rounded-lg hover:border-[#8D2C1D] hover:text-[#8D2C1D] transition-colors font-medium"
                      >
                        Cancelar
                      </button>
                      
                      {currentStep < 3 ? (
                        <button
                          onClick={handleNext}
                          className="px-6 py-3 bg-[#8D2C1D] hover:bg-[#84261A] text-white rounded-lg transition-colors font-medium"
                        >
                          Siguiente
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmit}
                          disabled={loading}
                          className="px-6 py-3 bg-[#8D2C1D] hover:bg-[#84261A] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Guardando...' : (isEditMode ? 'Actualizar Profesor' : 'Registrar Profesor')}
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
          title="Confirmar Edición"
          message="Para editar este profesor, confirma tu contraseña por seguridad."
        />
      )}
    </>
  );
}
