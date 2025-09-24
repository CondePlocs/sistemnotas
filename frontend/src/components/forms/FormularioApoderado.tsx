"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApoderadoFormData, AlumnoConParentesco } from '@/types/apoderado';
import SelectorAlumnos from './SelectorAlumnos';

interface FormularioApoderadoProps {
  onSuccess?: () => void;
  redirectPath?: string;
}

export default function FormularioApoderado({ onSuccess, redirectPath = '/director/dashboard' }: FormularioApoderadoProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ApoderadoFormData>({
    email: '',
    password: '',
    alumnos: [],
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación: debe tener al menos un alumno seleccionado
    if (formData.alumnos.length === 0) {
      alert('Debe seleccionar al menos un alumno para el apoderado');
      return;
    }

    // Validación: debe tener al menos un apoderado principal
    const tienePrincipal = formData.alumnos.some(item => item.esPrincipal);
    if (!tienePrincipal) {
      alert('Debe marcar al menos un alumno como "Apoderado Principal"');
      return;
    }

    setLoading(true);

    try {
      // Transformar los datos para el backend
      const dataParaEnviar = {
        ...formData,
        alumnos: formData.alumnos.map(item => ({
          alumnoId: item.alumno.id,
          parentesco: item.parentesco,
          esPrincipal: item.esPrincipal
        }))
      };

      const response = await fetch('/api/apoderados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataParaEnviar),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al crear apoderado');
      }

      const result = await response.json();
      alert('Apoderado creado exitosamente');
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectPath);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error al crear apoderado');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Información del Apoderado</h2>
        <p className="text-sm text-gray-600">Complete los datos del nuevo apoderado</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Datos básicos del usuario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="apoderado@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contraseña temporal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DNI
            </label>
            <input
              type="text"
              name="dni"
              value={formData.dni || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="12345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombres
            </label>
            <input
              type="text"
              name="nombres"
              value={formData.nombres || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="María Elena"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellidos
            </label>
            <input
              type="text"
              name="apellidos"
              value={formData.apellidos || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Rodríguez Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="987654321"
            />
          </div>
        </div>

        {/* Relación con los Estudiantes */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Relación con los Estudiantes</h3>
          <p className="text-sm text-gray-600 mb-4">
            Selecciona los alumnos de los cuales será apoderado y define el tipo de parentesco para cada uno.
          </p>
          
          <SelectorAlumnos
            alumnosSeleccionados={formData.alumnos}
            onAlumnosChange={(alumnos) => setFormData(prev => ({ ...prev, alumnos }))}
            disabled={loading}
          />
        </div>

        {/* Datos específicos del apoderado */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Datos Personales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sexo
              </label>
              <select
                name="sexo"
                value={formData.sexo || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado Civil
              </label>
              <select
                name="estadoCivil"
                value={formData.estadoCivil || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar</option>
                <option value="soltero">Soltero(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="divorciado">Divorciado(a)</option>
                <option value="viudo">Viudo(a)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nacionalidad
              </label>
              <input
                type="text"
                name="nacionalidad"
                value={formData.nacionalidad || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                value={formData.direccion || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Jr. Los Olivos 456, Lima"
              />
            </div>
          </div>
        </div>

        {/* Datos laborales */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Datos Laborales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ocupación
              </label>
              <input
                type="text"
                name="ocupacion"
                value={formData.ocupacion || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contador, Ingeniero, Comerciante, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Centro de Trabajo
              </label>
              <input
                type="text"
                name="centroTrabajo"
                value={formData.centroTrabajo || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                value={formData.telefonoTrabajo || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="01-1234567"
              />
            </div>

          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creando...' : 'Crear Apoderado'}
          </button>
        </div>
      </form>
    </div>
  );
}
