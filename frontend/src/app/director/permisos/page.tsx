"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { 
  AdministrativoConPermisos, 
  Permisos as PermisosType, 
  PermisosBatchUpdate,
  PermisosBatchResponse 
} from '@/types/permisos';

function PermisosContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [administrativos, setAdministrativos] = useState<AdministrativoConPermisos[]>([]);
  const [permisos, setPermisos] = useState<Record<number, PermisosType>>({});
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const administrativosPorPagina = 10;

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
      const permisosIniciales: Record<number, PermisosType> = {};
      data.forEach((admin: AdministrativoConPermisos) => {
        permisosIniciales[admin.id] = {
          registrarApoderados: admin.permisos?.puedeRegistrarApoderados || false,
          registrarProfesores: admin.permisos?.puedeRegistrarProfesores || false,
          registrarAdministrativos: admin.permisos?.puedeRegistrarAdministrativos || false,
          registrarAlumnos: admin.permisos?.puedeRegistrarAlumnos || false,
          gestionarSalones: admin.permisos?.puedeGestionarSalones || false,
          asignarProfesores: admin.permisos?.puedeAsignarProfesores || false,
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

  const handlePermisoChange = (administrativoId: number, permiso: keyof PermisosType, valor: boolean) => {
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
        puedeGestionarSalones: permisos.gestionarSalones,
        puedeAsignarProfesores: permisos.asignarProfesores,
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

  // Filtrar administrativos
  const administrativosFiltrados = administrativos.filter(admin => {
    const termino = busqueda.toLowerCase();
    const nombres = admin.usuarioRol.usuario.nombres?.toLowerCase() || '';
    const apellidos = admin.usuarioRol.usuario.apellidos?.toLowerCase() || '';
    const email = admin.usuarioRol.usuario.email.toLowerCase();
    const dni = admin.usuarioRol.usuario.dni?.toLowerCase() || '';
    const cargo = admin.cargo?.toLowerCase() || '';
    
    return nombres.includes(termino) || 
           apellidos.includes(termino) || 
           email.includes(termino) || 
           dni.includes(termino) || 
           cargo.includes(termino);
  });

  // Paginación
  const totalPaginas = Math.ceil(administrativosFiltrados.length / administrativosPorPagina);
  const indiceInicio = (paginaActual - 1) * administrativosPorPagina;
  const indiceFin = indiceInicio + administrativosPorPagina;
  const administrativosPaginados = administrativosFiltrados.slice(indiceInicio, indiceFin);

  // Reset página cuando cambia la búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D] mx-auto"></div>
          <p className="mt-4 text-[#666666]">Cargando personal administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9]">
      <DashboardHeader 
        title="Gestión de Permisos Administrativos"
        onLogout={logout}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-3 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg border-2 border-[#E9E1C9] hover:border-[#8D2C1D] transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 text-[#8D2C1D]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[#8D2C1D]">Gestión de Permisos</h1>
              <p className="mt-2 text-[#666666]">
                Asigna permisos específicos al personal administrativo de tu institución
              </p>
            </div>
          </div>
        </div>

        {/* Búsqueda con Botón Guardar */}
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-2 border-[#E9E1C9] mb-6">
          <label className="block text-sm font-semibold text-[#8D2C1D] mb-3">
            Buscar personal administrativo
          </label>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nombre, apellido, email, DNI o cargo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 text-[#333333] placeholder-[#999999] bg-white/90"
              />
            </div>
            {administrativosFiltrados.length > 0 && (
              <button
                onClick={guardarCambios}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white font-semibold rounded-xl hover:from-[#15803D] hover:to-[#16A34A] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 whitespace-nowrap"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden sm:inline">Guardando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="hidden sm:inline">Guardar Cambios</span>
                    <span className="sm:hidden">Guardar</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#E9E1C9] overflow-hidden">
          {administrativosFiltrados.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-16 w-16 text-[#8D2C1D]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-[#8D2C1D]">
                {busqueda ? 'No se encontraron resultados' : 'No hay personal administrativo'}
              </h3>
              <p className="mt-2 text-[#666666]">
                {busqueda 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Registra personal administrativo primero para poder asignar permisos.'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Información de resultados */}
              <div className="px-6 py-4 bg-gradient-to-r from-[#8D2C1D]/5 to-[#D96924]/5 border-b border-[#E9E1C9]">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#666666]">
                    Mostrando {indiceInicio + 1} - {Math.min(indiceFin, administrativosFiltrados.length)} de {administrativosFiltrados.length} administrativos
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#8D2C1D] font-medium">
                    <div className="w-2 h-2 bg-[#16A34A] rounded-full"></div>
                    Activo
                    <div className="w-2 h-2 bg-[#EF4444] rounded-full ml-3"></div>
                    Inactivo
                  </div>
                </div>
              </div>

              {/* Tabla responsive */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Personal Administrativo
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold">
                        Apoderados
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold">
                        Profesores
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold">
                        Administrativos
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold">
                        Alumnos
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold">
                        Salones
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold">
                        Asignar Prof.
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E1C9]">
                    {administrativosPaginados.map((admin, index) => {
                      const isEven = index % 2 === 0;
                      return (
                        <tr 
                          key={admin.id} 
                          className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-[#8D2C1D]/5 hover:to-[#D96924]/5 ${
                            isEven ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                        >
                          <td className="px-6 py-6">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#8D2C1D] to-[#D96924] flex items-center justify-center shadow-lg">
                                  <span className="text-sm font-bold text-white">
                                    {admin.usuarioRol.usuario.nombres?.charAt(0) || admin.usuarioRol.usuario.email.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-[#333333]">
                                  {admin.usuarioRol.usuario.nombres && admin.usuarioRol.usuario.apellidos
                                    ? `${admin.usuarioRol.usuario.nombres} ${admin.usuarioRol.usuario.apellidos}`
                                    : admin.usuarioRol.usuario.email
                                  }
                                </div>
                                <div className="text-sm text-[#666666]">
                                  {admin.usuarioRol.usuario.email}
                                </div>
                                <div className="flex items-center gap-4 mt-1">
                                  {admin.usuarioRol.usuario.dni && (
                                    <span className="text-xs text-[#8D2C1D] font-medium">
                                      DNI: {admin.usuarioRol.usuario.dni}
                                    </span>
                                  )}
                                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-[#8D2C1D]/10 to-[#D96924]/10 text-[#8D2C1D] capitalize">
                                    {admin.cargo}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Checkboxes modernos */}
                          {[
                            { key: 'registrarApoderados', color: 'from-[#16A34A] to-[#15803D]' },
                            { key: 'registrarProfesores', color: 'from-[#2563EB] to-[#1D4ED8]' },
                            { key: 'registrarAdministrativos', color: 'from-[#7C3AED] to-[#6D28D9]' },
                            { key: 'registrarAlumnos', color: 'from-[#EA580C] to-[#DC2626]' },
                            { key: 'gestionarSalones', color: 'from-[#0891B2] to-[#0E7490]' },
                            { key: 'asignarProfesores', color: 'from-[#BE185D] to-[#A21CAF]' }
                          ].map(({ key, color }) => (
                            <td key={key} className="px-4 py-6 text-center">
                              <label className="relative inline-flex items-center cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={permisos[admin.id]?.[key as keyof PermisosType] || false}
                                  onChange={(e) => handlePermisoChange(admin.id, key as keyof PermisosType, e.target.checked)}
                                  className="sr-only"
                                />
                                <div className={`relative w-6 h-6 rounded-lg border-2 transition-all duration-300 ${
                                  permisos[admin.id]?.[key as keyof PermisosType] 
                                    ? `bg-gradient-to-r ${color} border-transparent shadow-lg transform scale-110` 
                                    : 'border-gray-300 bg-white group-hover:border-gray-400 group-hover:shadow-md'
                                }`}>
                                  {permisos[admin.id]?.[key as keyof PermisosType] && (
                                    <svg 
                                      className="w-4 h-4 text-white absolute top-0.5 left-0.5 animate-in zoom-in duration-200" 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </label>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="px-6 py-4 bg-gradient-to-r from-[#8D2C1D]/5 to-[#D96924]/5 border-t border-[#E9E1C9]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#666666]">
                      Página {paginaActual} de {totalPaginas}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                        disabled={paginaActual === 1}
                        className="px-3 py-2 rounded-lg bg-white border-2 border-[#E9E1C9] text-[#8D2C1D] hover:border-[#8D2C1D] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                        .filter(page => 
                          page === 1 || 
                          page === totalPaginas || 
                          Math.abs(page - paginaActual) <= 1
                        )
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-[#666666]">...</span>
                            )}
                            <button
                              onClick={() => setPaginaActual(page)}
                              className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                                paginaActual === page
                                  ? 'bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white border-transparent shadow-lg'
                                  : 'bg-white border-[#E9E1C9] text-[#8D2C1D] hover:border-[#8D2C1D]'
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        ))
                      }
                      
                      <button
                        onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                        disabled={paginaActual === totalPaginas}
                        className="px-3 py-2 rounded-lg bg-white border-2 border-[#E9E1C9] text-[#8D2C1D] hover:border-[#8D2C1D] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
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
