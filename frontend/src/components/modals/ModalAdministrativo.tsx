import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ModalAdministrativoProps, AdministrativoFormData, SEXO_OPTIONS, ESTADO_CIVIL_OPTIONS, CARGO_OPTIONS, CONDICION_LABORAL_OPTIONS } from '@/types/administrativo';

const ModalAdministrativo: React.FC<ModalAdministrativoProps> = ({
  isOpen,
  onClose,
  onSubmit,
  administrativo,
  isEditing = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AdministrativoFormData>({
    email: '',
    password: '',
    cargo: ''
  });

  const totalSteps = 3;

  useEffect(() => {
    if (isEditing && administrativo) {
      setFormData({
        email: administrativo.usuarioRol.usuario.email,
        dni: administrativo.usuarioRol.usuario.dni || '',
        nombres: administrativo.usuarioRol.usuario.nombres || '',
        apellidos: administrativo.usuarioRol.usuario.apellidos || '',
        telefono: administrativo.usuarioRol.usuario.telefono || '',
        fechaNacimiento: administrativo.fechaNacimiento ? administrativo.fechaNacimiento.split('T')[0] : '',
        sexo: administrativo.sexo || '',
        estadoCivil: administrativo.estadoCivil || '',
        nacionalidad: administrativo.nacionalidad || '',
        direccion: administrativo.direccion || '',
        cargo: administrativo.cargo,
        fechaIngreso: administrativo.fechaIngreso ? administrativo.fechaIngreso.split('T')[0] : '',
        condicionLaboral: administrativo.condicionLaboral || ''
      });
    } else {
      setFormData({
        email: '',
        password: '',
        cargo: ''
      });
    }
    setCurrentStep(1);
  }, [isEditing, administrativo, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevenir que Enter envíe el formulario en pasos 1 y 2
    if (e.key === 'Enter' && currentStep < totalSteps) {
      e.preventDefault();
      if (isStepValid()) {
        nextStep();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Solo procesar si estamos en el último paso
    if (currentStep !== totalSteps) {
      return;
    }
    
    setLoading(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error al procesar administrativo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error al procesar administrativo:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.email && (isEditing || formData.password);
      case 2:
        return true; // Datos personales son opcionales
      case 3:
        return formData.cargo;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Básicos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="ejemplo@correo.com"
                />
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password || ''}
                    onChange={handleInputChange}
                    required={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-transparent text-gray-900 placeholder-gray-500"
                    placeholder="Contraseña"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DNI
                </label>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni || ''}
                  onChange={handleInputChange}
                  maxLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombres
                </label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Nombres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Apellidos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="987654321"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Personales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sexo
                </label>
                <select
                  name="sexo"
                  value={formData.sexo || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-transparent text-gray-900"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado Civil
                </label>
                <select
                  name="estadoCivil"
                  value={formData.estadoCivil || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-transparent text-gray-900"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nacionalidad
                </label>
                <input
                  type="text"
                  name="nacionalidad"
                  value={formData.nacionalidad || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Ej: Peruana"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Dirección completa"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Laborales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo *
                </label>
                <select
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-transparent text-gray-900"
                >
                  <option value="">Seleccionar</option>
                  {CARGO_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Ingreso
                </label>
                <input
                  type="date"
                  name="fechaIngreso"
                  value={formData.fechaIngreso || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condición Laboral
                </label>
                <select
                  name="condicionLaboral"
                  value={formData.condicionLaboral || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-transparent text-gray-900"
                >
                  <option value="">Seleccionar</option>
                  {CONDICION_LABORAL_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  {isEditing ? 'Editar Administrativo' : 'Nuevo Administrativo'}
                </Dialog.Title>

                {/* Indicador de pasos */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step === currentStep
                            ? 'bg-[#8D2C1D] text-white'
                            : step < currentStep
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {step < currentStep ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            step
                          )}
                        </div>
                        {step < totalSteps && (
                          <div className={`flex-1 h-1 mx-2 ${
                            step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-600">
                    <span>Datos Básicos</span>
                    <span>Datos Personales</span>
                    <span>Datos Laborales</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                  {renderStepContent()}

                  <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                    <div>
                      {currentStep > 1 && (
                        <button
                          type="button"
                          onClick={prevStep}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8D2C1D]"
                        >
                          Anterior
                        </button>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8D2C1D]"
                      >
                        Cancelar
                      </button>

                      {currentStep < totalSteps ? (
                        <button
                          type="button"
                          onClick={nextStep}
                          disabled={!isStepValid()}
                          className="px-4 py-2 text-sm font-medium text-white bg-[#8D2C1D] border border-transparent rounded-lg hover:bg-[#A0522D] focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Siguiente
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleFinalSubmit}
                          disabled={loading || !isStepValid()}
                          className="px-4 py-2 text-sm font-medium text-white bg-[#8D2C1D] border border-transparent rounded-lg hover:bg-[#A0522D] focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Procesando...' : (isEditing ? 'Actualizar' : 'Registrar')}
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ModalAdministrativo;
