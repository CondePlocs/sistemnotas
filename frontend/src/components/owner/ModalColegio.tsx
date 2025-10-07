'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ColegioFormData, DRE, UGEL, OPCIONES_NIVELES_EDUCATIVOS, NivelEducativo } from '@/types/colegio';
import ModalConfirmarPassword from '../modals/ModalConfirmarPassword';

interface ModalColegioProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  colegioId?: number;
}

export default function ModalColegio({ isOpen, onClose, onSuccess, colegioId }: ModalColegioProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [dres, setDres] = useState<DRE[]>([]);
  const [ugeles, setUgeles] = useState<UGEL[]>([]);
  const [selectedDre, setSelectedDre] = useState<number | null>(null);
  const [loadingUgeles, setLoadingUgeles] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);

  const [formData, setFormData] = useState<ColegioFormData>({
    nombre: '',
    codigoModular: '',
    distrito: '',
    direccion: '',
    ugelId: undefined,
    nivelesPermitidos: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!colegioId;

  useEffect(() => {
    if (isOpen) {
      cargarDres();
      if (isEditMode) {
        cargarDatosColegio();
      } else {
        resetForm();
      }
    }
  }, [isOpen, colegioId]);

  const cargarDres = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/ubicacion/dres', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al cargar DREs');
      const data = await response.json();
      setDres(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cargarDatosColegio = async () => {
    setLoadingData(true);
    try {
      const response = await fetch(`http://localhost:3001/api/colegios/${colegioId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al cargar colegio');
      const data = await response.json();
      
      // Cargar UGELs de la DRE del colegio
      if (data.ugel?.dreId) {
        setSelectedDre(data.ugel.dreId);
        await cargarUgeles(data.ugel.dreId);
      }

      setFormData({
        nombre: data.nombre || '',
        codigoModular: data.codigoModular || '',
        distrito: data.distrito || '',
        direccion: data.direccion || '',
        ugelId: data.ugelId,
        nivelesPermitidos: data.nivelesPermitidos
          ?.filter((n: any) => n.nivel)
          .map((n: any) => n.nivel.nombre) || []
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar los datos del colegio');
    } finally {
      setLoadingData(false);
    }
  };

  const cargarUgeles = async (dreId: number) => {
    setLoadingUgeles(true);
    try {
      const response = await fetch(`http://localhost:3001/api/ubicacion/ugeles/by-dre/${dreId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al cargar UGELs');
      const data = await response.json();
      setUgeles(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingUgeles(false);
    }
  };

  const handleDreChange = async (dreId: number) => {
    setSelectedDre(dreId);
    setFormData(prev => ({ ...prev, ugelId: undefined }));
    setUgeles([]);
    if (errors.ugelId) {
      setErrors(prev => ({ ...prev, ugelId: '' }));
    }
    
    if (dreId) {
      await cargarUgeles(dreId);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNivelChange = (nivel: NivelEducativo, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      nivelesPermitidos: checked 
        ? [...prev.nivelesPermitidos, nivel]
        : prev.nivelesPermitidos.filter(n => n !== nivel)
    }));
    if (errors.nivelesPermitidos) {
      setErrors(prev => ({ ...prev, nivelesPermitidos: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      codigoModular: '',
      distrito: '',
      direccion: '',
      ugelId: undefined,
      nivelesPermitidos: []
    });
    setSelectedDre(null);
    setUgeles([]);
    setErrors({});
    setCurrentStep(1);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
      if (!formData.codigoModular?.trim()) newErrors.codigoModular = 'El código modular es obligatorio';
      if (!formData.distrito?.trim()) newErrors.distrito = 'El distrito es obligatorio';
      if (!formData.direccion?.trim()) newErrors.direccion = 'La dirección es obligatoria';
    }

    if (step === 2) {
      if (!selectedDre) newErrors.dre = 'Debes seleccionar una DRE';
      if (!formData.ugelId) newErrors.ugelId = 'Debes seleccionar una UGEL';
    }

    if (step === 3) {
      if (formData.nivelesPermitidos.length === 0) {
        newErrors.nivelesPermitidos = 'Debes seleccionar al menos un nivel educativo';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const submitData = async (dataToSend: any) => {
    setLoading(true);
    try {
      const url = isEditMode
        ? `http://localhost:3001/api/colegios/${colegioId}`
        : 'http://localhost:3001/api/colegios';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el colegio');
      }

      alert(isEditMode ? 'Colegio actualizado exitosamente' : 'Colegio registrado exitosamente');
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar el colegio');
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
      await submitData(pendingData);
      setPendingData(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al verificar la contraseña');
    }
  };

  const steps = [
    { number: 1, title: 'Datos del Colegio' },
    { number: 2, title: 'Ubicación Administrativa' },
    { number: 3, title: 'Niveles Educativos' }
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
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-8 shadow-2xl transition-all">
                  {loadingData ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D] mx-auto"></div>
                      <p className="mt-4 text-[#666666]">Cargando datos...</p>
                    </div>
                  ) : (
                    <>
                      {/* Header */}
                      <div className="flex justify-between items-center mb-6">
                        <Dialog.Title
                          as="h3"
                          className="text-2xl font-bold text-[#8D2C1D]"
                          style={{ fontFamily: 'var(--font-poppins)' }}
                        >
                          {isEditMode ? 'Editar Colegio' : 'Registrar Nuevo Colegio'}
                        </Dialog.Title>
                        <button
                          onClick={onClose}
                          className="text-[#666666] hover:text-[#8D2C1D] transition-colors"
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

                      {/* Contenido del formulario */}
                      <div className="min-h-[400px]">
                        {/* Paso 1: Datos del Colegio */}
                        {currentStep === 1 && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-[#333333] mb-2">
                                Nombre del Colegio *
                              </label>
                              <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                  errors.nombre
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                    : 'border-[#E9E1C9] focus:border-[#8D2C1D] focus:ring-[#8D2C1D]/20'
                                }`}
                                placeholder="Ej: I.E. San Martín de Porres"
                              />
                              {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-[#333333] mb-2">
                                Código Modular *
                              </label>
                              <input
                                type="text"
                                name="codigoModular"
                                value={formData.codigoModular}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                  errors.codigoModular
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                    : 'border-[#E9E1C9] focus:border-[#8D2C1D] focus:ring-[#8D2C1D]/20'
                                }`}
                                placeholder="Ej: 0123456"
                              />
                              {errors.codigoModular && <p className="text-red-600 text-sm mt-1">{errors.codigoModular}</p>}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-[#333333] mb-2">
                                Distrito *
                              </label>
                              <input
                                type="text"
                                name="distrito"
                                value={formData.distrito}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                  errors.distrito
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                    : 'border-[#E9E1C9] focus:border-[#8D2C1D] focus:ring-[#8D2C1D]/20'
                                }`}
                                placeholder="Ej: San Juan de Lurigancho"
                              />
                              {errors.distrito && <p className="text-red-600 text-sm mt-1">{errors.distrito}</p>}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-[#333333] mb-2">
                                Dirección *
                              </label>
                              <input
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                  errors.direccion
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                    : 'border-[#E9E1C9] focus:border-[#8D2C1D] focus:ring-[#8D2C1D]/20'
                                }`}
                                placeholder="Ej: Av. Los Próceres 123"
                              />
                              {errors.direccion && <p className="text-red-600 text-sm mt-1">{errors.direccion}</p>}
                            </div>
                          </div>
                        )}

                        {/* Paso 2: Ubicación Administrativa */}
                        {currentStep === 2 && (
                          <div className="space-y-4">
                            <div className="bg-[#FCE0C1] p-6 rounded-xl">
                              <h4 className="text-lg font-bold text-[#8D2C1D] mb-4">Ubicación Administrativa</h4>
                              
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-[#333333] mb-2">
                                    DRE (Dirección Regional de Educación) *
                                  </label>
                                  <select
                                    value={selectedDre || ''}
                                    onChange={(e) => handleDreChange(parseInt(e.target.value) || 0)}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                      errors.dre
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-[#E9E1C9] focus:border-[#8D2C1D] focus:ring-[#8D2C1D]/20'
                                    }`}
                                  >
                                    <option value="">Seleccionar DRE</option>
                                    {dres.map((dre) => (
                                      <option key={dre.id} value={dre.id}>
                                        {dre.nombre}
                                      </option>
                                    ))}
                                  </select>
                                  {errors.dre && <p className="text-red-600 text-sm mt-1">{errors.dre}</p>}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[#333333] mb-2">
                                    UGEL (Unidad de Gestión Educativa Local) *
                                  </label>
                                  {loadingUgeles ? (
                                    <div className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg bg-gray-100">
                                      Cargando UGELs...
                                    </div>
                                  ) : (
                                    <select
                                      value={formData.ugelId || ''}
                                      onChange={(e) => {
                                        setFormData(prev => ({ ...prev, ugelId: parseInt(e.target.value) || undefined }));
                                        if (errors.ugelId) setErrors(prev => ({ ...prev, ugelId: '' }));
                                      }}
                                      disabled={!selectedDre}
                                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                        errors.ugelId
                                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                          : 'border-[#E9E1C9] focus:border-[#8D2C1D] focus:ring-[#8D2C1D]/20'
                                      }`}
                                    >
                                      <option value="">
                                        {selectedDre ? 'Seleccionar UGEL' : 'Primero selecciona una DRE'}
                                      </option>
                                      {ugeles.map((ugel) => (
                                        <option key={ugel.id} value={ugel.id}>
                                          {ugel.nombre}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                  {errors.ugelId && <p className="text-red-600 text-sm mt-1">{errors.ugelId}</p>}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Paso 3: Niveles Educativos */}
                        {currentStep === 3 && (
                          <div className="space-y-4">
                            <div className="bg-[#E9E1C9] p-6 rounded-xl">
                              <h4 className="text-lg font-bold text-[#8D2C1D] mb-2">Niveles Educativos Autorizados</h4>
                              <p className="text-sm text-[#666666] mb-4">
                                Selecciona los niveles que podrá gestionar este colegio
                              </p>
                              
                              <div className="space-y-3">
                                {OPCIONES_NIVELES_EDUCATIVOS.map((opcion) => (
                                  <div
                                    key={opcion.value}
                                    className="flex items-start space-x-3 p-4 bg-white border-2 border-[#E9E1C9] rounded-lg hover:border-[#8D2C1D] transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      id={`nivel-${opcion.value}`}
                                      checked={formData.nivelesPermitidos.includes(opcion.value)}
                                      onChange={(e) => handleNivelChange(opcion.value, e.target.checked)}
                                      className="mt-1 h-5 w-5 text-[#8D2C1D] focus:ring-[#8D2C1D] border-gray-300 rounded"
                                    />
                                    <div className="flex-1">
                                      <label htmlFor={`nivel-${opcion.value}`} className="flex items-center cursor-pointer">
                                        <span className="text-2xl mr-3">{opcion.icon}</span>
                                        <div>
                                          <div className="font-bold text-[#333333]">{opcion.label}</div>
                                          <div className="text-sm text-[#666666]">{opcion.descripcion}</div>
                                        </div>
                                      </label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {errors.nivelesPermitidos && (
                                <p className="text-red-600 text-sm mt-3">{errors.nivelesPermitidos}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Botones de navegación */}
                      <div className="flex justify-between mt-8">
                        <button
                          onClick={currentStep === 1 ? onClose : handlePrevious}
                          className="px-6 py-3 border-2 border-[#E9E1C9] text-[#333333] rounded-lg hover:border-[#8D2C1D] transition-colors font-medium"
                        >
                          {currentStep === 1 ? 'Cancelar' : 'Anterior'}
                        </button>

                        {currentStep < steps.length ? (
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
                            {loading ? 'Guardando...' : isEditMode ? 'Actualizar Colegio' : 'Registrar Colegio'}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de confirmación de contraseña */}
      <ModalConfirmarPassword
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingData(null);
        }}
        onConfirm={handlePasswordConfirm}
        title="Confirmar Edición"
        message="Por seguridad, ingresa tu contraseña para confirmar los cambios al colegio."
      />
    </>
  );
}
