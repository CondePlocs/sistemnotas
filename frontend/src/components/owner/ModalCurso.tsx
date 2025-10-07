'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  CursoFormData, 
  CompetenciaFormData, 
  COLORES_CURSO, 
  validarCursoFormData 
} from '@/types/curso';
import SelectorCompetencias from '../forms/SelectorCompetencias';
import ColorSelector from '../forms/ColorSelector';
import ModalConfirmarPassword from '../modals/ModalConfirmarPassword';

interface Nivel {
  id: number;
  nombre: string;
  activo: boolean;
}

interface ModalCursoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cursoId?: number;
}

export default function ModalCurso({ isOpen, onClose, onSuccess, cursoId }: ModalCursoProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [loadingNiveles, setLoadingNiveles] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);
  const [errores, setErrores] = useState<string[]>([]);

  const [formData, setFormData] = useState<CursoFormData>({
    nombre: '',
    descripcion: '',
    nivelId: 0,
    color: COLORES_CURSO[0].valor,
    competencias: []
  });

  const isEditMode = !!cursoId;

  useEffect(() => {
    if (isOpen) {
      cargarNiveles();
      if (isEditMode) {
        cargarDatosCurso();
      } else {
        resetForm();
      }
    }
  }, [isOpen, cursoId]);

  const cargarNiveles = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/ubicacion/niveles', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const nivelesActivos = data.filter((nivel: Nivel) => nivel.activo);
        setNiveles(nivelesActivos);
        
        if (formData.nivelId === 0 && nivelesActivos.length > 0) {
          setFormData(prev => ({
            ...prev,
            nivelId: nivelesActivos[0].id
          }));
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingNiveles(false);
    }
  };

  const cargarDatosCurso = async () => {
    setLoadingData(true);
    try {
      const response = await fetch(`http://localhost:3001/api/cursos/${cursoId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al cargar curso');
      const data = await response.json();
      
      setFormData({
        nombre: data.curso.nombre || '',
        descripcion: data.curso.descripcion || '',
        nivelId: data.curso.nivelId,
        color: data.curso.color || COLORES_CURSO[0].valor,
        competencias: data.curso.competencias?.map((c: any) => ({
          id: c.id,
          nombre: c.nombre
        })) || []
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar los datos del curso');
    } finally {
      setLoadingData(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      nivelId: niveles.length > 0 ? niveles[0].id : 0,
      color: COLORES_CURSO[0].valor,
      competencias: []
    });
    setErrores([]);
    setCurrentStep(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const finalValue = name === 'nivelId' ? parseInt(value, 10) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
    
    if (errores.length > 0) {
      setErrores([]);
    }
  };

  const handleCompetenciasChange = (competencias: CompetenciaFormData[]) => {
    setFormData(prev => ({
      ...prev,
      competencias
    }));
    
    if (errores.length > 0) {
      setErrores([]);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: string[] = [];

    if (step === 1) {
      if (!formData.nombre.trim() || formData.nombre.trim().length < 3) {
        newErrors.push('El nombre del curso debe tener al menos 3 caracteres');
      }
      if (!formData.nivelId || formData.nivelId === 0) {
        newErrors.push('Debe seleccionar un nivel educativo');
      }
    }

    if (step === 2) {
      if (formData.competencias.length === 0) {
        newErrors.push('Debe agregar al menos una competencia');
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

  const submitData = async (dataToSend: any) => {
    setLoading(true);
    try {
      const url = isEditMode
        ? `http://localhost:3001/api/cursos/${cursoId}`
        : 'http://localhost:3001/api/cursos';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el curso');
      }

      alert(isEditMode ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente');
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar el curso');
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
    { number: 1, title: 'Información Básica' },
    { number: 2, title: 'Competencias' }
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
                          {isEditMode ? 'Editar Curso' : 'Crear Nuevo Curso'}
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

                      {/* Contenido del formulario */}
                      <div className="min-h-[400px]">
                        {/* Paso 1: Información Básica */}
                        {currentStep === 1 && (
                          <div className="space-y-6">
                            <div className="bg-[#FCE0C1] p-6 rounded-xl">
                              <h4 className="text-lg font-bold text-[#8D2C1D] mb-4">Datos del Curso</h4>
                              
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-[#333333] mb-2">
                                    Nombre del Curso *
                                  </label>
                                  <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Matemática, Comunicación, Personal Social"
                                    className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all placeholder:text-[#999999] text-[#333333]"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[#333333] mb-2">
                                    Nivel Educativo *
                                  </label>
                                  {loadingNiveles ? (
                                    <div className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg bg-gray-100">
                                      Cargando niveles...
                                    </div>
                                  ) : (
                                    <select
                                      name="nivelId"
                                      value={formData.nivelId}
                                      onChange={handleInputChange}
                                      className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D2C1D]/20 focus:border-[#8D2C1D] transition-all text-[#333333] font-medium"
                                      required
                                      disabled={niveles.length === 0}
                                    >
                                      <option value={0} disabled className="text-[#999999]">
                                        Selecciona un nivel educativo
                                      </option>
                                      {niveles.map((nivel) => (
                                        <option key={nivel.id} value={nivel.id} className="text-[#333333] font-medium">
                                          {nivel.nombre}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[#333333] mb-2">
                                  </label>
                                  <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Descripción del curso y sus objetivos..."
                                    className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all placeholder:text-[#999999] text-[#333333]"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="bg-[#E9E1C9] p-6 rounded-xl">
                              <ColorSelector
                                value={formData.color || '#3B82F6'}
                                onChange={(color) => setFormData(prev => ({ ...prev, color }))}
                                disabled={loading}
                                showPresets={true}
                                showCustomPicker={true}
                                label="Color del curso"
                                placeholder="Seleccionar color para el curso"
                              />
                            </div>
                          </div>
                        )}

                        {/* Paso 2: Competencias */}
                        {currentStep === 2 && (
                          <div className="space-y-4">
                            <div className="bg-[#FCE0C1] p-6 rounded-xl">
                              <h4 className="text-lg font-bold text-[#8D2C1D] mb-2">Competencias del Curso</h4>
                              <p className="text-sm text-[#666666] mb-4">
                                Define las competencias que los estudiantes deben desarrollar en este curso
                              </p>
                              
                              <SelectorCompetencias
                                competencias={formData.competencias}
                                onChange={handleCompetenciasChange}
                                disabled={loading}
                              />
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
                            {loading ? 'Guardando...' : isEditMode ? 'Actualizar Curso' : 'Crear Curso'}
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
        message="Por seguridad, ingresa tu contraseña para confirmar los cambios al curso."
      />
    </>
  );
}
