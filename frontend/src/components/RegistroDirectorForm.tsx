'use client';

import { useState, useEffect } from 'react';
import { DirectorFormData, OPCIONES_SEXO, OPCIONES_ESTADO_CIVIL, OPCIONES_GRADO_ACADEMICO } from '@/types/director';
import { Colegio } from '@/types/colegio';

interface RegistroDirectorFormProps {
  onSubmit: (data: DirectorFormData) => void;
  colegios: Colegio[];
  loading?: boolean;
  colegioPreseleccionado?: number;
}

export default function RegistroDirectorForm({ 
  onSubmit, 
  colegios, 
  loading = false,
  colegioPreseleccionado 
}: RegistroDirectorFormProps) {
  const [formData, setFormData] = useState<DirectorFormData>({
    // Datos básicos del usuario
    email: '',
    password: '',
    dni: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    
    // Datos específicos del director
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
    
    // Colegio
    colegioId: colegioPreseleccionado || 0
  });

  useEffect(() => {
    if (colegioPreseleccionado) {
      setFormData(prev => ({ ...prev, colegioId: colegioPreseleccionado }));
    }
  }, [colegioPreseleccionado]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'colegioId' ? parseInt(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Registrar Nuevo Director</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección: Datos Básicos del Usuario */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Datos Básicos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">
                DNI
              </label>
              <input
                type="text"
                id="dni"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                maxLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-1">
                Nombres
              </label>
              <input
                type="text"
                id="nombres"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos
              </label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Sección: Asignación de Colegio */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Asignación de Colegio</h3>
          <div>
            <label htmlFor="colegioId" className="block text-sm font-medium text-gray-700 mb-1">
              Colegio *
            </label>
            <select
              id="colegioId"
              name="colegioId"
              value={formData.colegioId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Seleccionar colegio</option>
              {colegios.map((colegio) => (
                <option key={colegio.id} value={colegio.id}>
                  {colegio.nombre} 
                  {colegio.codigoModular ? ` (${colegio.codigoModular})` : ''} 
                  {colegio.ugel ? ` - ${colegio.ugel.nombre}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sección: Datos Personales */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Datos Personales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

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
              >
                <option value="">Seleccionar</option>
                {OPCIONES_SEXO.map((opcion) => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="estadoCivil" className="block text-sm font-medium text-gray-700 mb-1">
                Estado Civil
              </label>
              <select
                id="estadoCivil"
                name="estadoCivil"
                value={formData.estadoCivil}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar</option>
                {OPCIONES_ESTADO_CIVIL.map((opcion) => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
            </div>

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
                placeholder="Ej: Peruana"
              />
            </div>

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
              />
            </div>


            <div>
              <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                id="fechaInicio"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Sección: Formación Académica */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Formación Académica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="gradoAcademico" className="block text-sm font-medium text-gray-700 mb-1">
                Grado Académico
              </label>
              <select
                id="gradoAcademico"
                name="gradoAcademico"
                value={formData.gradoAcademico}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar</option>
                {OPCIONES_GRADO_ACADEMICO.map((opcion) => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="carrera" className="block text-sm font-medium text-gray-700 mb-1">
                Carrera
              </label>
              <input
                type="text"
                id="carrera"
                name="carrera"
                value={formData.carrera}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Educación Primaria"
              />
            </div>

            <div>
              <label htmlFor="especializacion" className="block text-sm font-medium text-gray-700 mb-1">
                Especialización
              </label>
              <input
                type="text"
                id="especializacion"
                name="especializacion"
                value={formData.especializacion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="institucionEgreso" className="block text-sm font-medium text-gray-700 mb-1">
                Institución de Egreso
              </label>
              <input
                type="text"
                id="institucionEgreso"
                name="institucionEgreso"
                value={formData.institucionEgreso}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Botón Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || !formData.email.trim() || !formData.password.trim() || formData.colegioId === 0}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Registrando Director...' : 'Registrar Director'}
          </button>
        </div>
      </form>
    </div>
  );
}
