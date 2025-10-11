"use client";

import React, { useState, useEffect } from 'react';
import { Alumno, AlumnoFormData, SexoAlumno } from '@/types/alumno';

interface ModalAlumnoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: AlumnoFormData) => void;
  alumno?: Alumno | null;
  title?: string;
}

export default function ModalAlumno({ 
  isOpen, 
  onClose, 
  onSubmit, 
  alumno = null, 
  title = "Nuevo Alumno" 
}: ModalAlumnoProps) {
  const [formData, setFormData] = useState<AlumnoFormData>({
    dni: '',
    codigoAlumno: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    sexo: '',
    nacionalidad: 'Peruana',
    direccion: '',
    distrito: '',
    numeroContacto: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Cargar datos del alumno si está editando
  useEffect(() => {
    if (alumno) {
      setFormData({
        dni: alumno.dni || '',
        codigoAlumno: alumno.codigoAlumno || '',
        nombres: alumno.nombres || '',
        apellidos: alumno.apellidos || '',
        fechaNacimiento: alumno.fechaNacimiento || '',
        sexo: alumno.sexo || '',
        nacionalidad: alumno.nacionalidad || 'Peruana',
        direccion: alumno.direccion || '',
        distrito: alumno.distrito || '',
        numeroContacto: alumno.numeroContacto || '',
      });
    } else {
      // Reset form para nuevo alumno
      setFormData({
        dni: '',
        codigoAlumno: '',
        nombres: '',
        apellidos: '',
        fechaNacimiento: '',
        sexo: '',
        nacionalidad: 'Peruana',
        direccion: '',
        distrito: '',
        numeroContacto: '',
      });
    }
    setErrors({});
  }, [alumno, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones obligatorias
    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son obligatorios';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios';
    }

    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio';
    } else if (formData.dni.length !== 8) {
      newErrors.dni = 'El DNI debe tener 8 dígitos';
    }

    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
    } else {
      const fechaNac = new Date(formData.fechaNacimiento);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNac.getFullYear();
      
      if (edad < 3 || edad > 25) {
        newErrors.fechaNacimiento = 'La edad debe estar entre 3 y 25 años';
      }
    }

    if (!formData.sexo) {
      newErrors.sexo = 'El sexo es obligatorio';
    }

    // Validación de número de contacto
    if (formData.numeroContacto && formData.numeroContacto.length < 9) {
      newErrors.numeroContacto = 'El número de contacto debe tener al menos 9 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9] p-4 rounded-xl">
              <h3 className="text-lg font-semibold text-[#8D2C1D] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Información Personal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DNI */}
                <div>
                  <label htmlFor="dni" className="block text-sm font-medium text-[#8D2C1D] mb-1">
                    DNI *
                  </label>
                  <input
                    type="text"
                    id="dni"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    maxLength={8}
                    pattern="[0-9]*"
                    className={`w-full px-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] transition-all duration-200 ${
                      errors.dni ? 'border-red-500' : 'border-[#E9E1C9] focus:border-[#8D2C1D]'
                    }`}
                    placeholder="12345678"
                    disabled={loading}
                  />
                  {errors.dni && <p className="mt-1 text-sm text-red-600">{errors.dni}</p>}
                </div>

                {/* Código de Alumno */}
                <div>
                  <label htmlFor="codigoAlumno" className="block text-sm font-medium text-[#8D2C1D] mb-1">
                    Código de Alumno (Opcional)
                  </label>
                  <input
                    type="text"
                    id="codigoAlumno"
                    name="codigoAlumno"
                    value={formData.codigoAlumno}
                    onChange={handleChange}
                    maxLength={20}
                    className={`w-full px-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] transition-all duration-200 ${
                      errors.codigoAlumno ? 'border-red-500' : 'border-[#E9E1C9] focus:border-[#8D2C1D]'
                    }`}
                    placeholder="EST2024001 o ALU-001-2024"
                    disabled={loading}
                  />
                  {errors.codigoAlumno && <p className="mt-1 text-sm text-red-600">{errors.codigoAlumno}</p>}
                  <p className="mt-1 text-xs text-[#666666]">
                    Código para integración con SIAGIE u otros sistemas
                  </p>
                </div>

                {/* Nombres */}
                <div>
                  <label htmlFor="nombres" className="block text-sm font-medium text-[#8D2C1D] mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    id="nombres"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] transition-all duration-200 ${
                      errors.nombres ? 'border-red-500' : 'border-[#E9E1C9] focus:border-[#8D2C1D]'
                    }`}
                    placeholder="Juan Carlos"
                    disabled={loading}
                  />
                  {errors.nombres && <p className="mt-1 text-sm text-red-600">{errors.nombres}</p>}
                </div>

                {/* Apellidos */}
                <div>
                  <label htmlFor="apellidos" className="block text-sm font-medium text-[#8D2C1D] mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    id="apellidos"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] transition-all duration-200 ${
                      errors.apellidos ? 'border-red-500' : 'border-[#E9E1C9] focus:border-[#8D2C1D]'
                    }`}
                    placeholder="García López"
                    disabled={loading}
                  />
                  {errors.apellidos && <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>}
                </div>

                {/* Fecha de Nacimiento */}
                <div>
                  <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-[#8D2C1D] mb-1">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    id="fechaNacimiento"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] transition-all duration-200 ${
                      errors.fechaNacimiento ? 'border-red-500' : 'border-[#E9E1C9] focus:border-[#8D2C1D]'
                    }`}
                    disabled={loading}
                  />
                  {errors.fechaNacimiento && <p className="mt-1 text-sm text-red-600">{errors.fechaNacimiento}</p>}
                </div>

                {/* Sexo */}
                <div>
                  <label htmlFor="sexo" className="block text-sm font-medium text-[#8D2C1D] mb-1">
                    Sexo *
                  </label>
                  <select
                    id="sexo"
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] transition-all duration-200 ${
                      errors.sexo ? 'border-red-500' : 'border-[#E9E1C9] focus:border-[#8D2C1D]'
                    }`}
                    disabled={loading}
                  >
                    <option value="">Seleccionar</option>
                    <option value={SexoAlumno.masculino}>Masculino</option>
                    <option value={SexoAlumno.femenino}>Femenino</option>
                  </select>
                  {errors.sexo && <p className="mt-1 text-sm text-red-600">{errors.sexo}</p>}
                </div>

                {/* Nacionalidad */}
                <div className="md:col-span-2">
                  <label htmlFor="nacionalidad" className="block text-sm font-medium text-[#8D2C1D] mb-1">
                    Nacionalidad
                  </label>
                  <input
                    type="text"
                    id="nacionalidad"
                    name="nacionalidad"
                    value={formData.nacionalidad}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200"
                    placeholder="Peruana"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="bg-gradient-to-r from-[#E9E1C9] to-[#D4C5A9] p-4 rounded-xl">
              <h3 className="text-lg font-semibold text-[#8D2C1D] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Información de Contacto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dirección */}
                <div>
                  <label htmlFor="direccion" className="block text-sm font-medium text-[#8D2C1D] mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200"
                    placeholder="Av. Los Olivos 123"
                    disabled={loading}
                  />
                </div>

                {/* Distrito */}
                <div>
                  <label htmlFor="distrito" className="block text-sm font-medium text-[#8D2C1D] mb-1">
                    Distrito
                  </label>
                  <input
                    type="text"
                    id="distrito"
                    name="distrito"
                    value={formData.distrito}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200"
                    placeholder="San Juan de Lurigancho"
                    disabled={loading}
                  />
                </div>

                {/* Número de Contacto */}
                <div className="md:col-span-2">
                  <label htmlFor="numeroContacto" className="block text-sm font-medium text-[#8D2C1D] mb-1">
                    Número de Contacto
                  </label>
                  <input
                    type="tel"
                    id="numeroContacto"
                    name="numeroContacto"
                    value={formData.numeroContacto}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] transition-all duration-200 ${
                      errors.numeroContacto ? 'border-red-500' : 'border-[#E9E1C9] focus:border-[#8D2C1D]'
                    }`}
                    placeholder="987654321"
                    disabled={loading}
                  />
                  {errors.numeroContacto && <p className="mt-1 text-sm text-red-600">{errors.numeroContacto}</p>}
                </div>
              </div>
            </div>

            {/* Información importante */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Información importante</h3>
                  <div className="mt-1 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Los campos marcados con (*) son obligatorios</li>
                      <li>El DNI debe ser único y tener 8 dígitos</li>
                      <li>La edad debe estar entre 3 y 25 años</li>
                      <li>El código de alumno es útil para integración con SIAGIE</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer con botones */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border-2 border-[#E9E1C9] text-[#666666] rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] transition-all duration-200"
              disabled={loading}
            >
              Cancelar
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white rounded-xl hover:from-[#D96924] hover:to-[#8D2C1D] focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {alumno ? 'Actualizando...' : 'Registrando...'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {alumno ? 'Actualizar Alumno' : 'Registrar Alumno'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
