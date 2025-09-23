"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

interface Administrativo {
  id: number;
  usuarioRol: {
    id: number;
    usuario: {
      id: number;
      nombres: string;
      apellidos: string;
      email: string;
      dni: string;
    };
    colegio: {
      id: number;
      nombre: string;
    };
  };
  cargo: string;
  fechaIngreso: string;
  condicionLaboral: string;
  permisos?: {
    puedeRegistrarApoderados: boolean;
    puedeRegistrarProfesores: boolean;
    puedeRegistrarAdministrativos: boolean;
    puedeRegistrarAlumnos: boolean;
  };
}

interface Permisos {
  registrarApoderados: boolean;
  registrarProfesores: boolean;
  registrarAdministrativos: boolean;
  registrarAlumnos: boolean;
}

function PermisosContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [administrativos, setAdministrativos] = useState<Administrativo[]>([]);
  const [permisos, setPermisos] = useState<Record<number, Permisos>>({});
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    cargarAdministrativos();
  }, []);

  const cargarAdministrativos = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/administrativos', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setAdministrativos(data);
      
      // Inicializar permisos con los datos existentes de la BD
      const permisosIniciales: Record<number, Permisos> = {};
      data.forEach((admin: Administrativo) => {
        permisosIniciales[admin.id] = {
          registrarApoderados: admin.permisos?.puedeRegistrarApoderados || false,
          registrarProfesores: admin.permisos?.puedeRegistrarProfesores || false,
          registrarAdministrativos: admin.permisos?.puedeRegistrarAdministrativos || false,
          registrarAlumnos: admin.permisos?.puedeRegistrarAlumnos || false,
        };
      });
      setPermisos(permisosIniciales);
      
    } catch (error) {
      console.error('Error al cargar administrativos:', error);
      alert(`Error al cargar la lista de personal administrativo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePermisoChange = (administrativoId: number, permiso: keyof Permisos, valor: boolean) => {
    setPermisos(prev => ({
      ...prev,
      [administrativoId]: {
        ...prev[administrativoId],
        [permiso]: valor
      }
    }));
  };

  const guardarCambios = async () => {
    setSaving(true);
    try {
      console.log('Permisos a guardar:', permisos);
      
      // Convertir el objeto de permisos al formato que espera el backend
      const permisosArray = Object.entries(permisos).map(([administrativoId, permisos]) => ({
        administrativoId: parseInt(administrativoId),
        puedeRegistrarProfesores: permisos.registrarProfesores,
        puedeRegistrarApoderados: permisos.registrarApoderados,
        puedeRegistrarAdministrativos: permisos.registrarAdministrativos,
        puedeRegistrarAlumnos: permisos.registrarAlumnos,
      }));

      const response = await fetch('http://localhost:3001/api/permisos/batch', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          permisos: permisosArray
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Resultado del guardado:', result);
      
      alert(`Permisos actualizados exitosamente. ${result.actualizados} administrativos actualizados.`);
      
      // Recargar los datos para mostrar los cambios
      await cargarAdministrativos();
      
    } catch (error) {
      console.error('Error al guardar permisos:', error);
      alert(`Error al guardar los permisos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando personal administrativo...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Permisos</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Personal Administrativo</h2>
            <p className="mt-1 text-sm text-gray-600">
              Asigna permisos al personal administrativo para que puedan registrar usuarios
            </p>
          </div>

          {administrativos.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay personal administrativo</h3>
              <p className="mt-1 text-sm text-gray-500">
                Registra personal administrativo primero para poder asignar permisos.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Personal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cargo
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrar Apoderados
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrar Profesores
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrar Administrativos
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrar Alumnos
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {administrativos.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-600">
                                {admin.usuarioRol.usuario.nombres?.charAt(0) || admin.usuarioRol.usuario.email.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {admin.usuarioRol.usuario.nombres && admin.usuarioRol.usuario.apellidos
                                ? `${admin.usuarioRol.usuario.nombres} ${admin.usuarioRol.usuario.apellidos}`
                                : admin.usuarioRol.usuario.email
                              }
                            </div>
                            <div className="text-sm text-gray-500">
                              {admin.usuarioRol.usuario.email}
                            </div>
                            {admin.usuarioRol.usuario.dni && (
                              <div className="text-xs text-gray-400">
                                DNI: {admin.usuarioRol.usuario.dni}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                          {admin.cargo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={permisos[admin.id]?.registrarApoderados || false}
                          onChange={(e) => handlePermisoChange(admin.id, 'registrarApoderados', e.target.checked)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={permisos[admin.id]?.registrarProfesores || false}
                          onChange={(e) => handlePermisoChange(admin.id, 'registrarProfesores', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={permisos[admin.id]?.registrarAdministrativos || false}
                          onChange={(e) => handlePermisoChange(admin.id, 'registrarAdministrativos', e.target.checked)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={permisos[admin.id]?.registrarAlumnos || false}
                          onChange={(e) => handlePermisoChange(admin.id, 'registrarAlumnos', e.target.checked)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer con botón guardar */}
          {administrativos.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={guardarCambios}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Permisos() {
  return (
    <ProtectedRoute requiredRole="DIRECTOR">
      <PermisosContent />
    </ProtectedRoute>
  );
}
