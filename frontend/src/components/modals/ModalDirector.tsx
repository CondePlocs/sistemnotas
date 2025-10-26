'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { DirectorFormData, OPCIONES_SEXO, OPCIONES_ESTADO_CIVIL, OPCIONES_GRADO_ACADEMICO } from '@/types/director';
import { Colegio } from '@/types/colegio';
import ModalConfirmarPassword from './ModalConfirmarPassword';

interface ModalDirectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  directorId?: number; // Si existe, es modo edición
}

export default function ModalDirector({ isOpen, onClose, onSuccess, directorId }: ModalDirectorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [colegios, setColegios] = useState<Colegio[]>([]);
  const [showColegioModal, setShowColegioModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);
  
  const [formData, setFormData] = useState<DirectorFormData>({
    email: '',
    password: '',
    dni: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    fechaNacimiento: '',
    sexo: '',
    estadoCivil: '',
    nacionalidad: '',
    direccion: '',
    gradoAcademico: '',
    carrera: '',
    especializacion: '',
    institucionEgreso: '',
    fechaInicio: '',
    colegioId: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!directorId;

  useEffect(() => {
    if (isOpen) {
      cargarColegios();
      if (directorId) {
        cargarDatosDirector();
      } else {
        resetForm();
      }
    }
  }, [isOpen, directorId]);

  const cargarColegios = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/colegios/sin-director', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al cargar colegios');
      const data = await response.json();
      setColegios(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cargarDatosDirector = async () => {
    setLoadingData(true);
    try {
      const response = await fetch(`http://localhost:3001/api/directores/${directorId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al cargar director');
      
      const director = await response.json();
      
      setFormData({
        email: director.usuarioRol.usuario.email || '',
        password: '', // No precargamos la contraseña
        dni: director.usuarioRol.usuario.dni || '',
        nombres: director.usuarioRol.usuario.nombres || '',
        apellidos: director.usuarioRol.usuario.apellidos || '',
        telefono: director.usuarioRol.usuario.telefono || '',
        fechaNacimiento: director.fechaNacimiento ? director.fechaNacimiento.split('T')[0] : '',
        sexo: director.sexo || '',
        estadoCivil: director.estadoCivil || '',
        nacionalidad: director.nacionalidad || '',
        direccion: director.direccion || '',
        gradoAcademico: director.gradoAcademico || '',
        carrera: director.carrera || '',
        especializacion: director.especializacion || '',
        institucionEgreso: director.institucionEgreso || '',
        fechaInicio: director.fechaInicio ? director.fechaInicio.split('T')[0] : '',
        colegioId: director.usuarioRol.colegio_id || 0
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar los datos del director');
    } finally {
      setLoadingData(false);
    }
  };

  const resetForm = () => {
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
      nacionalidad: '',
      direccion: '',
      gradoAcademico: '',
      carrera: '',
      especializacion: '',
      institucionEgreso: '',
      fechaInicio: '',
      colegioId: 0
    });
    setCurrentStep(1);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'colegioId' ? parseInt(value) : value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.email) newErrors.email = 'El email es obligatorio';
      if (!isEditMode && !formData.password) newErrors.password = 'La contraseña es obligatoria';
      if (!formData.dni) newErrors.dni = 'El DNI es obligatorio';
      if (!formData.nombres) newErrors.nombres = 'Los nombres son obligatorios';
      if (!formData.apellidos) newErrors.apellidos = 'Los apellidos son obligatorios';
    }

    if (step === 2) {
      if (!formData.colegioId || formData.colegioId === 0) {
        newErrors.colegioId = 'Debe seleccionar un colegio';
      }
    }

    if (step === 3) {
      if (!formData.fechaNacimiento) newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
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

    // Si es edición, pedir confirmación con contraseña
    if (isEditMode) {
      // Preparar datos para enviar después de confirmar
      const dataToSend: any = { ...formData };
      if (!dataToSend.password) {
        delete dataToSend.password;
      }
      setPendingData(dataToSend);
      setShowPasswordModal(true);
      return;
    }

    // Si es creación, enviar directamente
    await submitData(formData);
  };

  const submitData = async (dataToSend: any) => {
    setLoading(true);
    try {
      const url = isEditMode
        ? `http://localhost:3001/api/directores/${directorId}`
        : 'http://localhost:3001/api/directores';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el director');
      }

      alert(isEditMode ? 'Director actualizado exitosamente' : 'Director registrado exitosamente');
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar el director');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordConfirm = async (password: string) => {
    // Verificar la contraseña del owner actual
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

      // Si la contraseña es correcta, proceder con la actualización
      setShowPasswordModal(false);
      await submitData(pendingData);
      setPendingData(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al verificar la contraseña');
    }
  };

  const colegioSeleccionado = colegios.find(c => c.id === formData.colegioId);

  const steps = [
    { number: 1, title: 'Datos Básicos' },
    { number: 2, title: 'Asignación de Colegio' },
    { number: 3, title: 'Datos Personales' },
    { number: 4, title: 'Formación Académica' }
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
                          {isEditMode ? 'Editar Director' : 'Registrar Nuevo Director'}
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

                      {/* Stepper */}
                      <div className="mb-8">
                        <div className="flex justify-between">
                          {steps.map((step, index) => (
                            <div key={step.number} className="flex-1">
                              <div className="flex items-center">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                                    currentStep >= step.number
                                      ? 'bg-[#8D2C1D] text-white'
                                      : 'bg-[#E9E1C9] text-[#666666]'
                                  }`}
                                >
                                  {step.number}
                                </div>
                                {index < steps.length - 1 && (
                                  <div
                                    className={`flex-1 h-1 mx-2 transition-colors ${
                                      currentStep > step.number ? 'bg-[#8D2C1D]' : 'bg-[#E9E1C9]'
                                    }`}
                                  />
                                )}
                              </div>
                              <p className="text-xs mt-2 text-[#666666] text-center">{step.title}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Form Content */}
                      <div className="min-h-[400px]">
                        {/* Paso 1: Datos Básicos */}
                        {currentStep === 1 && (
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-[#333333] mb-4">Datos Básicos</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-[#333333] mb-2">
                                  Email *
                                </label>
                                <input
                                  type="email"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  
                                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                    errors.email
                                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                      : 'border-[#E9E1C9] focus:border-[#8D2C1D] focus:ring-[#8D2C1D]/20'
                                  }`}
                                />
                                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-[#333333] mb-2">
                                  Contraseña {!isEditMode && '*'}
                                </label>
                                <input
                                  type="password"
                                  name="password"
                                  value={formData.password}
                                  onChange={handleChange}
                                  placeholder={isEditMode ? 'Dejar vacío para no cambiar' : ''}
                                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                    errors.password
                                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                      : 'border-[#E9E1C9] focus:border-[#8D2C1D] focus:ring-[#8D2C1D]/20'
                                  }`}
                                />
                                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-[#333333] mb-2">
                                  DNI *
                                </label>
                                <input
                                  type="text"
                                  name="dni"
                                  value={formData.dni}
                                  onChange={handleChange}
                                  maxLength={8}
                                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                    errors.dni
                                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                      : 'border-[#E9E1C9] focus:border-[#8D2C1D] focus:ring-[#8D2C1D]/20'
                                  }`}
                                />
                                {errors.dni && <p className="text-red-600 text-sm mt-1">{errors.dni}</p>}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-[#333333] mb-2">
                                  Teléfono
                                </label>
                                <input
                                  type="text"
                                  name="telefono"
                                  value={formData.telefono}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all text-black"
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
                                  onChange={handleChange}
                                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                    errors.nombres
                                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                      : 'border-[#E9E1C9] focus:border-[#8D2C1D] focus:ring-[#8D2C1D]/20'
                                  }`}
                                />
                                {errors.nombres && <p className="text-red-600 text-sm mt-1">{errors.nombres}</p>}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-[#333333] mb-2">
                                  Apellidos *
                                </label>
                                <input
                                  type="text"
                                  name="apellidos"
                                  value={formData.apellidos}
                                  onChange={handleChange}
                                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                    errors.apellidos
                                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                      : 'border-[#E9E1C9] focus:border-[#8D2C1D] focus:ring-[#8D2C1D]/20'
                                  }`}
                                />
                                {errors.apellidos && <p className="text-red-600 text-sm mt-1">{errors.apellidos}</p>}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Paso 2: Asignación de Colegio */}
                        {currentStep === 2 && (
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-[#333333] mb-4">Asignación de Colegio</h4>
                            
                            <div>
                              <label className="block text-sm font-medium text-[#333333] mb-2">
                                Colegio Asignado *
                              </label>
                              
                              {colegioSeleccionado ? (
                                <div className="bg-[#E9E1C9] border-2 border-[#8D2C1D] rounded-lg p-4 mb-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h5 className="font-bold text-[#8D2C1D]">{colegioSeleccionado.nombre}</h5>
                                      <p className="text-sm text-[#666666]">Código: {colegioSeleccionado.codigoModular}</p>
                                      <p className="text-sm text-[#666666]">UGEL: {colegioSeleccionado.ugel?.nombre}</p>
                                      <p className="text-sm text-[#666666]">DRE: {colegioSeleccionado.ugel?.dre?.nombre}</p>
                                    </div>
                                    <button
                                      onClick={() => setShowColegioModal(true)}
                                      className="text-[#8D2C1D] hover:text-[#84261A] text-sm font-medium"
                                    >
                                      Cambiar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setShowColegioModal(true)}
                                  className="w-full border-2 border-dashed border-[#E9E1C9] hover:border-[#8D2C1D] rounded-lg p-8 text-center transition-colors"
                                >
                                  <svg className="w-12 h-12 text-[#D96924] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <p className="text-[#333333] font-medium">Seleccionar Colegio</p>
                                  <p className="text-sm text-[#666666]">Haz clic para elegir un colegio</p>
                                </button>
                              )}
                              
                              {errors.colegioId && <p className="text-red-600 text-sm mt-1">{errors.colegioId}</p>}
                            </div>
                          </div>
                        )}

                        {/* Paso 3: Datos Personales */}
                        {currentStep === 3 && (
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-[#333333] mb-4">Datos Personales</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-[#333333] mb-2">
                                  Fecha de Nacimiento *
                                </label>
                                <input
                                  type="date"
                                  name="fechaNacimiento"
                                  value={formData.fechaNacimiento}
                                  onChange={handleChange}
                                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                    errors.fechaNacimiento
                                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                      : 'border-[#E9E1C9] focus:border-[#8D2C1D] focus:ring-[#8D2C1D]/20'
                                  }`}
                                />
                                {errors.fechaNacimiento && <p className="text-red-600 text-sm mt-1">{errors.fechaNacimiento}</p>}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-[#333333] mb-2">
                                  Sexo
                                </label>
                                <select
                                  name="sexo"
                                  value={formData.sexo}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all"
                                >
                                  <option value="">Seleccionar...</option>
                                  {OPCIONES_SEXO.map(opcion => (
                                    <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
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
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all"
                                >
                                  <option value="">Seleccionar...</option>
                                  {OPCIONES_ESTADO_CIVIL.map(opcion => (
                                    <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
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
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all"
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
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Paso 4: Formación Académica */}
                        {currentStep === 4 && (
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-[#333333] mb-4">Formación Académica</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-[#333333] mb-2">
                                  Grado Académico
                                </label>
                                <select
                                  name="gradoAcademico"
                                  value={formData.gradoAcademico}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all"
                                >
                                  <option value="">Seleccionar...</option>
                                  {OPCIONES_GRADO_ACADEMICO.map(opcion => (
                                    <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-[#333333] mb-2">
                                  Carrera
                                </label>
                                <input
                                  type="text"
                                  name="carrera"
                                  value={formData.carrera}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-[#333333] mb-2">
                                  Especialización
                                </label>
                                <input
                                  type="text"
                                  name="especializacion"
                                  value={formData.especializacion}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-[#333333] mb-2">
                                  Institución de Egreso
                                </label>
                                <input
                                  type="text"
                                  name="institucionEgreso"
                                  value={formData.institucionEgreso}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-[#333333] mb-2">
                                  Fecha de Inicio
                                </label>
                                <input
                                  type="date"
                                  name="fechaInicio"
                                  value={formData.fechaInicio}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Botones de navegación */}
                      <div className="flex justify-between mt-8 pt-6 border-t-2 border-[#E9E1C9]">
                        <button
                          onClick={currentStep === 1 ? onClose : handlePrevious}
                          className="px-6 py-3 border-2 border-[#E9E1C9] text-[#333333] rounded-lg hover:border-[#8D2C1D] transition-colors font-medium"
                        >
                          {currentStep === 1 ? 'Cancelar' : 'Anterior'}
                        </button>

                        {currentStep < 4 ? (
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
                            className="px-6 py-3 bg-[#8D2C1D] hover:bg-[#84261A] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {loading && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            {isEditMode ? 'Actualizar Director' : 'Registrar Director'}
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

      {/* Modal de selección de colegio */}
      {showColegioModal && (
        <ModalSeleccionColegio
          isOpen={showColegioModal}
          onClose={() => setShowColegioModal(false)}
          colegios={colegios}
          onSelect={(colegioId) => {
            setFormData(prev => ({ ...prev, colegioId }));
            setShowColegioModal(false);
            if (errors.colegioId) {
              setErrors(prev => ({ ...prev, colegioId: '' }));
            }
          }}
        />
      )}

      {/* Modal de confirmación de contraseña */}
      <ModalConfirmarPassword
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingData(null);
        }}
        onConfirm={handlePasswordConfirm}
        title="Confirmar Edición"
        message="Por seguridad, ingresa tu contraseña para confirmar los cambios al director."
      />
    </>
  );
}

// Modal de selección de colegio (simplificado por ahora)
function ModalSeleccionColegio({
  isOpen,
  onClose,
  colegios,
  onSelect
}: {
  isOpen: boolean;
  onClose: () => void;
  colegios: Colegio[];
  onSelect: (id: number) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const colegiosFiltrados = colegios.filter(colegio => {
    const searchLower = searchTerm.toLowerCase();
    return (
      colegio.nombre.toLowerCase().includes(searchLower) ||
      colegio.codigoModular?.toLowerCase().includes(searchLower) ||
      colegio.ugel?.nombre.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-[2px]" />
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all">
                <Dialog.Title className="text-xl font-bold text-[#8D2C1D] mb-4">
                  Seleccionar Colegio
                </Dialog.Title>

                {/* Búsqueda */}
                <input
                  type="text"
                  placeholder="Buscar por nombre, código o UGEL..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 mb-4"
                />

                {/* Lista de colegios */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {colegiosFiltrados.map((colegio) => (
                    <button
                      key={colegio.id}
                      onClick={() => onSelect(colegio.id)}
                      className="w-full text-left p-4 border-2 border-[#E9E1C9] rounded-lg hover:border-[#8D2C1D] hover:bg-[#FCE0C1] transition-all"
                    >
                      <h4 className="font-bold text-[#333333]">{colegio.nombre}</h4>
                      <p className="text-sm text-[#666666]">Código: {colegio.codigoModular}</p>
                      <p className="text-sm text-[#666666]">UGEL: {colegio.ugel?.nombre}</p>
                      <p className="text-sm text-[#666666]">DRE: {colegio.ugel?.dre?.nombre}</p>
                    </button>
                  ))}
                </div>

                <button
                  onClick={onClose}
                  className="mt-4 w-full px-4 py-2 border-2 border-[#E9E1C9] text-[#333333] rounded-lg hover:border-[#8D2C1D] transition-colors"
                >
                  Cancelar
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
