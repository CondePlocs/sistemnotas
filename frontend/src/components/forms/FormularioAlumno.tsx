'use client';

import { useState } from 'react';
import { AlumnoFormData, SexoAlumno } from '@/types/alumno';

interface FormularioAlumnoProps {
  onSubmit: (data: AlumnoFormData) => Promise<void>;
  loading?: boolean;
  initialData?: Partial<AlumnoFormData>;
  title?: string;
}

export default function FormularioAlumno({ 
  onSubmit, 
  loading = false, 
  initialData = {},
  title = "Registrar Alumno"
}: FormularioAlumnoProps) {
  const [formData, setFormData] = useState<AlumnoFormData>({
    dni: initialData.dni || '',
    nombres: initialData.nombres || '',
    apellidos: initialData.apellidos || '',
    fechaNacimiento: initialData.fechaNacimiento || '',
    sexo: initialData.sexo || '',
    nacionalidad: initialData.nacionalidad || 'Peruana',
    direccion: initialData.direccion || '',
    distrito: initialData.distrito || '',
    numeroContacto: initialData.numeroContacto || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

    // Validación de DNI (opcional pero si se proporciona debe ser válido)
    if (formData.dni && formData.dni.length !== 8) {
      newErrors.dni = 'El DNI debe tener 8 dígitos';
    }

    // Validación de fecha de nacimiento
    if (formData.fechaNacimiento) {
      const fechaNac = new Date(formData.fechaNacimiento);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNac.getFullYear();
      
      if (edad < 3 || edad > 25) {
        newErrors.fechaNacimiento = 'La edad debe estar entre 3 y 25 años';
      }
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

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Personal */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Información Personal</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DNI */}
            <div>
              <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">
                DNI (Opcional)
              </label>
              <input
                type="text"
                id="dni"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                maxLength={8}
                pattern="[0-9]*"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dni ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="12345678"
                disabled={loading}
              />
              {errors.dni && <p className="mt-1 text-sm text-red-600">{errors.dni}</p>}
            </div>

            {/* Nombres */}
            <div>
              <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-1">
                Nombres *
              </label>
              <input
                type="text"
                id="nombres"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nombres ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Juan Carlos"
                disabled={loading}
              />
              {errors.nombres && <p className="mt-1 text-sm text-red-600">{errors.nombres}</p>}
            </div>

            {/* Apellidos */}
            <div>
              <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos *
              </label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.apellidos ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="García López"
                disabled={loading}
              />
              {errors.apellidos && <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>}
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                id="fechaNacimiento"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fechaNacimiento ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.fechaNacimiento && <p className="mt-1 text-sm text-red-600">{errors.fechaNacimiento}</p>}
            </div>

            {/* Sexo */}
            <div>
              <label htmlFor="sexo" className="block text-sm font-medium text-gray-700 mb-1">
                Sexo
              </label>
              <select
                id="sexo"
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Seleccionar</option>
                <option value={SexoAlumno.masculino}>Masculino</option>
                <option value={SexoAlumno.femenino}>Femenino</option>
              </select>
            </div>

            {/* Nacionalidad */}
            <div>
              <label htmlFor="nacionalidad" className="block text-sm font-medium text-gray-700 mb-1">
                Nacionalidad
              </label>
              <input
                type="text"
                id="nacionalidad"
                name="nacionalidad"
                value={formData.nacionalidad}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Peruana"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Información de Contacto</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dirección */}
            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Av. Los Olivos 123"
                disabled={loading}
              />
            </div>

            {/* Distrito */}
            <div>
              <label htmlFor="distrito" className="block text-sm font-medium text-gray-700 mb-1">
                Distrito
              </label>
              <input
                type="text"
                id="distrito"
                name="distrito"
                value={formData.distrito}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="San Juan de Lurigancho"
                disabled={loading}
              />
            </div>

            {/* Número de Contacto */}
            <div className="md:col-span-2">
              <label htmlFor="numeroContacto" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Contacto
              </label>
              <input
                type="tel"
                id="numeroContacto"
                name="numeroContacto"
                value={formData.numeroContacto}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.numeroContacto ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="987654321"
                disabled={loading}
              />
              {errors.numeroContacto && <p className="mt-1 text-sm text-red-600">{errors.numeroContacto}</p>}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registrando...' : 'Registrar Alumno'}
          </button>
        </div>
      </form>
    </div>
  );
}
