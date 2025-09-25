'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';

interface PermisosAdministrativo {
  puedeRegistrarProfesores: boolean;
  puedeRegistrarApoderados: boolean;
  puedeRegistrarAdministrativos: boolean;
  puedeRegistrarAlumnos: boolean;
  puedeGestionarSalones: boolean;
}

interface AdministrativoInfo {
  id: number;
  cargo: string;
  usuarioRol: {
    usuario: {
      nombres: string;
      apellidos: string;
      email: string;
    };
    colegio: {
      nombre: string;
    };
  };
}

function AdministrativoDashboardContent() {
  const [loading, setLoading] = useState(true);
  const [permisos, setPermisos] = useState<PermisosAdministrativo | null>(null);
  const [adminInfo, setAdminInfo] = useState<AdministrativoInfo | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    cargarDatosAdministrativo();
  }, []);

  const cargarDatosAdministrativo = async () => {
    try {
      // Obtener información del administrativo actual
      const response = await fetch('http://localhost:3001/auth/me', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener información del usuario');
      }

      const responseData = await response.json();
      const userData = responseData.user; // ← Aquí estaba el problema!
      console.log('🔍 Datos del usuario:', userData);
      console.log('🔍 Roles del usuario:', userData.roles);
      
      // Buscar el rol de administrativo
      const rolSimple = userData.roles?.find((rol: any) => rol.rol === 'ADMINISTRATIVO');
      let rolAdministrativo = null;
      
      if (rolSimple) {
        console.log('✅ Rol encontrado en estructura simplificada');
        // Crear estructura compatible
        rolAdministrativo = {
          rol: { nombre: 'ADMINISTRATIVO' },
          administrativo: { id: userData.id } // Usar el ID del usuario como fallback
        };
      }

      console.log('🎯 Rol administrativo encontrado:', rolAdministrativo);

      if (!rolAdministrativo) {
        console.error('❌ No se encontró rol de administrativo');
        console.error('Estructura de userData:', JSON.stringify(userData, null, 2));
        throw new Error('Usuario no es administrativo');
      }

      // Usar la información que ya tenemos del usuario
      const adminInfo = {
        id: userData.id,
        cargo: 'Administrativo', // Valor por defecto
        usuarioRol: {
          usuario: {
            nombres: userData.nombres,
            apellidos: userData.apellidos,
            email: userData.email,
          },
          colegio: {
            nombre: userData.roles[0]?.colegio_nombre || 'Sin Colegio Asignado'
          }
        }
      };
      
      setAdminInfo(adminInfo);
      console.log('✅ Información del administrativo establecida:', adminInfo);

      // Obtener el ID del administrativo desde la lista (ahora con el endpoint corregido)
      const adminListResponse = await fetch('http://localhost:3001/api/administrativos', {
        credentials: 'include',
      });
      
      let administrativoId = null;
      if (adminListResponse.ok) {
        const adminList = await adminListResponse.json();
        console.log('📋 Lista de administrativos recibida:', adminList);
        
        // Como ahora devuelve un array, buscar el que corresponde al usuario actual
        const adminMatch = adminList.find((admin: any) => admin.usuarioRol.usuario.id === userData.id);
        if (adminMatch) {
          administrativoId = adminMatch.id;
          console.log('✅ ID del administrativo encontrado:', administrativoId);
          // Actualizar la información con los datos completos
          setAdminInfo(adminMatch);
        }
      } else {
        console.error('❌ Error al obtener lista de administrativos:', adminListResponse.status);
      }

      console.log('🆔 ID del administrativo a usar:', administrativoId);

      // Obtener permisos del administrativo
      if (administrativoId) {
        const permisosResponse = await fetch(`http://localhost:3001/api/permisos/administrativo/${administrativoId}`, {
          credentials: 'include',
        });

        if (permisosResponse.ok) {
          const permisosData = await permisosResponse.json();
          console.log('✅ Permisos cargados:', permisosData);
          setPermisos(permisosData);
        } else {
          console.log('⚠️ No se encontraron permisos, usando valores por defecto');
          setPermisos({
            puedeRegistrarProfesores: false,
            puedeRegistrarApoderados: false,
            puedeRegistrarAdministrativos: false,
            puedeRegistrarAlumnos: false,
            puedeGestionarSalones: false,
          });
        }
      } else {
        console.log('⚠️ No se encontró ID del administrativo, usando permisos por defecto');
        setPermisos({
          puedeRegistrarProfesores: false,
          puedeRegistrarApoderados: false,
          puedeRegistrarAdministrativos: false,
          puedeRegistrarAlumnos: false,
          puedeGestionarSalones: false,
        });
      }

    } catch (error) {
      console.error('Error al cargar datos del administrativo:', error);
      alert('Error al cargar la información del administrativo');
    } finally {
      setLoading(false);
    }
  };

  const navegarA = (ruta: string) => {
    router.push(ruta);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel Administrativo</h1>
              <p className="text-sm text-gray-600">
                {adminInfo?.usuarioRol.usuario.nombres} {adminInfo?.usuarioRol.usuario.apellidos} - {adminInfo?.cargo}
              </p>
              <p className="text-xs text-gray-500">
                {adminInfo?.usuarioRol.colegio.nombre}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.nombres} {user?.apellidos}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={() => router.push('/auth/logout')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Funciones Disponibles</h2>
          <p className="text-gray-600">
            Estas son las funciones que tienes habilitadas según los permisos otorgados por el director.
          </p>
        </div>

        {/* Cards de Funciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card Registrar Profesores */}
          <div className={`bg-white rounded-lg shadow-md border-2 transition-all duration-200 ${
            permisos?.puedeRegistrarProfesores 
              ? 'border-green-200 hover:border-green-300 hover:shadow-lg cursor-pointer' 
              : 'border-gray-200 opacity-50 cursor-not-allowed'
          }`}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-full ${
                  permisos?.puedeRegistrarProfesores ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <svg className={`w-6 h-6 ${
                    permisos?.puedeRegistrarProfesores ? 'text-green-600' : 'text-gray-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Registrar Profesores</h3>
                  <p className="text-sm text-gray-600">Agregar nuevos profesores al sistema</p>
                </div>
              </div>
              
              {permisos?.puedeRegistrarProfesores ? (
                <button
                  onClick={() => navegarA('/administrativo/profesores/crear')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                >
                  Acceder
                </button>
              ) : (
                <div className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-md text-sm font-medium text-center">
                  Sin Permisos
                </div>
              )}
            </div>
          </div>

          {/* Card Registrar Apoderados */}
          <div className={`bg-white rounded-lg shadow-md border-2 transition-all duration-200 ${
            permisos?.puedeRegistrarApoderados 
              ? 'border-blue-200 hover:border-blue-300 hover:shadow-lg cursor-pointer' 
              : 'border-gray-200 opacity-50 cursor-not-allowed'
          }`}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-full ${
                  permisos?.puedeRegistrarApoderados ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <svg className={`w-6 h-6 ${
                    permisos?.puedeRegistrarApoderados ? 'text-blue-600' : 'text-gray-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Registrar Apoderados</h3>
                  <p className="text-sm text-gray-600">Agregar nuevos apoderados al sistema</p>
                </div>
              </div>
              
              {permisos?.puedeRegistrarApoderados ? (
                <button
                  onClick={() => navegarA('/administrativo/apoderados/crear')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                >
                  Acceder
                </button>
              ) : (
                <div className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-md text-sm font-medium text-center">
                  Sin Permisos
                </div>
              )}
            </div>
          </div>

          {/* Card Registrar Administrativos */}
          <div className={`bg-white rounded-lg shadow-md border-2 transition-all duration-200 ${
            permisos?.puedeRegistrarAdministrativos 
              ? 'border-purple-200 hover:border-purple-300 hover:shadow-lg cursor-pointer' 
              : 'border-gray-200 opacity-50 cursor-not-allowed'
          }`}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-full ${
                  permisos?.puedeRegistrarAdministrativos ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  <svg className={`w-6 h-6 ${
                    permisos?.puedeRegistrarAdministrativos ? 'text-purple-600' : 'text-gray-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6m8 0H8m0 0h-.01M12 15v.01" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Registrar Administrativos</h3>
                  <p className="text-sm text-gray-600">Agregar personal administrativo</p>
                </div>
              </div>
              
              {permisos?.puedeRegistrarAdministrativos ? (
                <button
                  onClick={() => navegarA('/administrativo/administrativos/crear')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                >
                  Acceder
                </button>
              ) : (
                <div className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-md text-sm font-medium text-center">
                  Sin Permisos
                </div>
              )}
            </div>
          </div>
          {/* Card Registrar Alumnos */}
          <div className={`bg-white rounded-lg shadow-md border-2 transition-all duration-200 ${
            permisos?.puedeRegistrarAlumnos 
              ? 'border-orange-200 hover:border-orange-300 hover:shadow-lg cursor-pointer' 
              : 'border-gray-200 opacity-50 cursor-not-allowed'
          }`}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-full ${
                  permisos?.puedeRegistrarAlumnos ? 'bg-orange-100' : 'bg-gray-100'
                }`}>
                  <svg className={`w-6 h-6 ${
                    permisos?.puedeRegistrarAlumnos ? 'text-orange-600' : 'text-gray-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Registrar Alumnos</h3>
                  <p className="text-sm text-gray-600">Agregar nuevos estudiantes al sistema</p>
                </div>
              </div>
              
              {permisos?.puedeRegistrarAlumnos ? (
                <button
                  onClick={() => navegarA('/administrativo/alumnos/crear')}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                >
                  Acceder
                </button>
              ) : (
                <div className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-md text-sm font-medium text-center">
                  Sin Permisos
                </div>
              )}
            </div>
          </div>

          {/* Card Gestionar Salones */}
          <div className={`bg-white rounded-lg shadow-md border-2 transition-all duration-200 ${
            permisos?.puedeGestionarSalones 
              ? 'border-indigo-200 hover:border-indigo-300 hover:shadow-lg cursor-pointer' 
              : 'border-gray-200 opacity-50 cursor-not-allowed'
          }`}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-full ${
                  permisos?.puedeGestionarSalones ? 'bg-indigo-100' : 'bg-gray-100'
                }`}>
                  <svg className={`w-6 h-6 ${
                    permisos?.puedeGestionarSalones ? 'text-indigo-600' : 'text-gray-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Gestionar Salones</h3>
                  <p className="text-sm text-gray-600">Asignar alumnos a salones</p>
                </div>
              </div>
              
              {permisos?.puedeGestionarSalones ? (
                <button
                  onClick={() => navegarA('/director/salones/gestion')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                >
                  Acceder
                </button>
              ) : (
                <div className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-md text-sm font-medium text-center">
                  Sin Permisos
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mensaje si no tiene permisos */}
        {permisos && !permisos.puedeRegistrarProfesores && !permisos.puedeRegistrarApoderados && !permisos.puedeRegistrarAdministrativos && !permisos.puedeRegistrarAlumnos && !permisos.puedeGestionarSalones && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-yellow-800">Sin Permisos Asignados</h3>
                <p className="text-yellow-700 mt-1">
                  Actualmente no tienes permisos para realizar ninguna función. 
                  Contacta al director para que te otorgue los permisos necesarios.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdministrativoDashboard() {
  return (
    <ProtectedRoute requiredRole="ADMINISTRATIVO">
      <AdministrativoDashboardContent />
    </ProtectedRoute>
  );
}
