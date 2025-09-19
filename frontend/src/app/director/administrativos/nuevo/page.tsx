"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

interface AdministrativoFormData {
  // Datos básicos del usuario
  email: string;
  password: string;
  dni?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;

  // Datos específicos del administrativo
  fechaNacimiento?: string;
  sexo?: string;
  estadoCivil?: string;
  nacionalidad?: string;
  direccion?: string;
  cargo: string;
  fechaIngreso?: string;
  condicionLaboral?: string;
}

function NuevoAdministrativoContent() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AdministrativoFormData>({
    email: '',
    password: '',
    cargo: '',
  });
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/administrativos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar el administrativo');
      }

      const administrativo = await response.json();
      console.log('Administrativo registrado:', administrativo);
      
      alert('Personal administrativo registrado exitosamente');
      router.push('/director/dashboard');
    } catch (error) {
      console.error('Error al registrar administrativo:', error);
      alert(error instanceof Error ? error.message : 'Error al registrar el personal administrativo');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Nuevo Personal Administrativo</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Datos Básicos */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Datos Básicos</h3>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DNI
                  </label>
                  <input
                    type="text"
                    name="dni"
                    value={formData.dni || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Datos Personales */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Datos Personales</h3>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="soltero">Soltero(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viudo">Viudo(a)</option>
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
                    placeholder="Ej: Peruana"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Datos Laborales */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Datos Laborales</h3>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="secretaria">Secretaria</option>
                    <option value="coordinador">Coordinador</option>
                    <option value="auxiliar">Auxiliar</option>
                    <option value="bibliotecario">Bibliotecario</option>
                    <option value="psicologo">Psicólogo</option>
                    <option value="enfermero">Enfermero</option>
                    <option value="conserje">Conserje</option>
                    <option value="vigilante">Vigilante</option>
                    <option value="otro">Otro</option>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="nombrado">Nombrado</option>
                    <option value="contratado">Contratado</option>
                    <option value="cas">CAS</option>
                    <option value="locacion">Locación de Servicios</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {loading ? 'Registrando...' : 'Registrar Administrativo'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function NuevoAdministrativo() {
  return (
    <ProtectedRoute requiredRole="DIRECTOR">
      <NuevoAdministrativoContent />
    </ProtectedRoute>
  );
}
