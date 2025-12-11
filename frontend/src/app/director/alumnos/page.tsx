"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DirectorSidebar from '@/components/layout/DirectorSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { usePermissionCheck } from '@/hooks/usePermissionCheck';
import AlumnoCard from '@/components/director/AlumnoCard';
import ModalAlumno from '@/components/modals/ModalAlumno';
import ModalVerAlumno from '@/components/modals/ModalVerAlumno';
import ModalConfirmarPassword from '@/components/modals/ModalConfirmarPassword';
import { Alumno, AlumnoFormData } from '@/types/alumno';

function AlumnosContent() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ alumno: Alumno; newStatus: 'activo' | 'inactivo' } | null>(null);
  const [pendingEdit, setPendingEdit] = useState<{ alumno: Alumno; formData: any } | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const alumnosPorPagina = 12;

  const router = useRouter();
  
  const { permisoVerificado, loading: permissionLoading } = usePermissionCheck({
    permissionType: 'alumnos'
  });

  useEffect(() => {
    if (permisoVerificado) {
      fetchAlumnos();
    }
  }, [permisoVerificado]);

  const fetchAlumnos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/alumnos', {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      setAlumnos(result.data || []);
    } catch (error) {
      console.error('Error al cargar alumnos:', error);
      alert(`Error al cargar la lista de alumnos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: AlumnoFormData) => {
    try {
      const response = await fetch('/api/alumnos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          dni: formData.dni || null,
          codigoAlumno: formData.codigoAlumno || null,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          fechaNacimiento: formData.fechaNacimiento || null,
          sexo: formData.sexo || null,
          nacionalidad: formData.nacionalidad || 'Peruana',
          direccion: formData.direccion || null,
          distrito: formData.distrito || null,
          numeroContacto: formData.numeroContacto || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el alumno');
      }

      await fetchAlumnos();
      setIsModalOpen(false);
      alert('¡Alumno registrado exitosamente!');
    } catch (error) {
      console.error('Error al crear alumno:', error);
      alert(`Error al registrar alumno: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleEdit = (alumno: Alumno, formData: AlumnoFormData) => {
    setPendingEdit({ alumno, formData });
    setIsPasswordModalOpen(true);
  };

  const handleStatusChange = (alumno: Alumno, newStatus: 'activo' | 'inactivo') => {
    setPendingStatusChange({ alumno, newStatus });
    setIsPasswordModalOpen(true);
  };

  const handlePasswordConfirm = async (password: string) => {
    try {
      if (pendingEdit) {
        const { alumno, formData } = pendingEdit;
        const response = await fetch(`/api/alumnos/${alumno.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            ...formData,
            password // Para confirmar la operación
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al actualizar el alumno');
        }

        await fetchAlumnos();
        alert('¡Alumno actualizado exitosamente!');
        setPendingEdit(null);
        // Cerrar modal de edición después de actualizar exitosamente
        setIsModalOpen(false);
        setSelectedAlumno(null);
        setIsEditing(false);
      }

      if (pendingStatusChange) {
        const { alumno, newStatus } = pendingStatusChange;
        const response = await fetch(`/api/alumnos/${alumno.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            activo: newStatus === 'activo',
            password // Para confirmar la operación
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al cambiar estado del alumno');
        }

        await fetchAlumnos();
        alert(`¡Alumno ${newStatus === 'activo' ? 'activado' : 'desactivado'} exitosamente!`);
        setPendingStatusChange(null);
      }

      setIsPasswordModalOpen(false);
    } catch (error) {
      console.error('Error en operación:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  // Filtrar alumnos
  const alumnosFiltrados = alumnos.filter(alumno => {
    const termino = busqueda.toLowerCase();
    const nombres = alumno.nombres?.toLowerCase() || '';
    const apellidos = alumno.apellidos?.toLowerCase() || '';
    const dni = alumno.dni?.toLowerCase() || '';
    const codigoAlumno = alumno.codigoAlumno?.toLowerCase() || '';
    
    return nombres.includes(termino) || 
           apellidos.includes(termino) || 
           dni.includes(termino) || 
           codigoAlumno.includes(termino);
  });

  // Paginación
  const totalPaginas = Math.ceil(alumnosFiltrados.length / alumnosPorPagina);
  const indiceInicio = (paginaActual - 1) * alumnosPorPagina;
  const indiceFin = indiceInicio + alumnosPorPagina;
  const alumnosPaginados = alumnosFiltrados.slice(indiceInicio, indiceFin);

  // Reset página cuando cambia la búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  if (permissionLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#E9E1C9] to-[#D4C5A9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D] mx-auto"></div>
          <p className="mt-4 text-[#666666]">Cargando alumnos...</p>
        </div>
      </div>
    );
  }

  return (
    <DirectorSidebar>
      <main className="flex-1 p-8 overflow-auto">
        {/* Header de la página */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold text-[#333333] mb-2" 
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Gestión de Alumnos
          </h1>
          <p className="text-[#666666]">Administra y registra estudiantes del colegio</p>
        </div>

        {/* Búsqueda y Nuevo Alumno */}
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-2 border-[#E9E1C9] mb-6">
          <label className="block text-sm font-semibold text-[#8D2C1D] mb-3">
            Buscar alumnos
          </label>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nombre, DNI, código de alumno..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 text-[#333333] placeholder-[#999999] bg-white/90"
              />
            </div>
            <button
              onClick={() => {
                setSelectedAlumno(null);
                setIsEditing(false);
                setIsModalOpen(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white font-semibold rounded-xl hover:from-[#D96924] hover:to-[#8D2C1D] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-3 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">Nuevo Alumno</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>
        </div>

        {/* Estadísticas - Una sola fila en móvil */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mb-6">
          <div className="bg-white/95 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border-2 border-[#E9E1C9] hover:border-[#8D2C1D] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center text-center sm:text-left">
              <div className="flex-shrink-0 mx-auto sm:mx-0 mb-2 sm:mb-0 sm:mr-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#8D2C1D] truncate">{alumnos.length}</p>
                <p className="text-xs sm:text-sm text-[#666666] truncate">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border-2 border-[#E9E1C9] hover:border-[#16A34A] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center text-center sm:text-left">
              <div className="flex-shrink-0 mx-auto sm:mx-0 mb-2 sm:mb-0 sm:mr-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-[#16A34A] to-[#15803D] rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#16A34A] truncate">{alumnos.filter(a => a.activo).length}</p>
                <p className="text-xs sm:text-sm text-[#666666] truncate">Activos</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border-2 border-[#E9E1C9] hover:border-[#DC2626] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center text-center sm:text-left">
              <div className="flex-shrink-0 mx-auto sm:mx-0 mb-2 sm:mb-0 sm:mr-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#DC2626] truncate">{alumnos.filter(a => !a.activo).length}</p>
                <p className="text-xs sm:text-sm text-[#666666] truncate">Inactivos</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border-2 border-[#E9E1C9] hover:border-[#2563EB] transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center text-center sm:text-left">
              <div className="flex-shrink-0 mx-auto sm:mx-0 mb-2 sm:mb-0 sm:mr-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2563EB] truncate">{alumnosFiltrados.length}</p>
                <p className="text-xs sm:text-sm text-[#666666] truncate">Filtrados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Alumnos */}
        {alumnosFiltrados.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#E9E1C9] px-6 py-12 text-center">
            <svg className="mx-auto h-16 w-16 text-[#8D2C1D]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-[#8D2C1D]">
              {busqueda ? 'No se encontraron alumnos' : 'No hay alumnos registrados'}
            </h3>
            <p className="mt-2 text-[#666666]">
              {busqueda 
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza registrando tu primer alumno'
              }
            </p>
            {!busqueda && (
              <button
                onClick={() => {
                  setSelectedAlumno(null);
                  setIsEditing(false);
                  setIsModalOpen(true);
                }}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white font-semibold rounded-xl hover:from-[#D96924] hover:to-[#8D2C1D] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Registrar Primer Alumno
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Grid de alumnos */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
              {alumnosPaginados.map((alumno) => (
                <AlumnoCard
                  key={alumno.id}
                  alumno={alumno}
                  onView={(alumno) => {
                    setSelectedAlumno(alumno);
                    setIsViewModalOpen(true);
                  }}
                  onEdit={(alumno) => {
                    setSelectedAlumno(alumno);
                    setIsEditing(true);
                    setIsModalOpen(true);
                  }}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#E9E1C9] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-[#666666]">
                    Mostrando {indiceInicio + 1} - {Math.min(indiceFin, alumnosFiltrados.length)} de {alumnosFiltrados.length} alumnos
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                      disabled={paginaActual === 1}
                      className="px-3 py-2 rounded-lg border border-[#E9E1C9] text-[#666666] hover:bg-[#8D2C1D] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {/* Números de página */}
                    {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                      let pageNum;
                      if (totalPaginas <= 5) {
                        pageNum = i + 1;
                      } else if (paginaActual <= 3) {
                        pageNum = i + 1;
                      } else if (paginaActual >= totalPaginas - 2) {
                        pageNum = totalPaginas - 4 + i;
                      } else {
                        pageNum = paginaActual - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPaginaActual(pageNum)}
                          className={`px-3 py-2 rounded-lg border transition-colors ${
                            paginaActual === pageNum
                              ? 'bg-[#8D2C1D] text-white border-[#8D2C1D]'
                              : 'border-[#E9E1C9] text-[#666666] hover:bg-[#8D2C1D] hover:text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                      disabled={paginaActual === totalPaginas}
                      className="px-3 py-2 rounded-lg border border-[#E9E1C9] text-[#666666] hover:bg-[#8D2C1D] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      </main>

      {/* Modales */}
      <ModalAlumno
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAlumno(null);
          setIsEditing(false);
        }}
        onSubmit={isEditing 
          ? (formData: AlumnoFormData) => handleEdit(selectedAlumno!, formData)
          : handleCreate
        }
        alumno={isEditing ? selectedAlumno : null}
        title={isEditing ? 'Editar Alumno' : 'Nuevo Alumno'}
      />

      <ModalVerAlumno
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedAlumno(null);
        }}
        alumno={selectedAlumno}
      />

      <ModalConfirmarPassword
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPendingStatusChange(null);
          setPendingEdit(null);
        }}
        onConfirm={handlePasswordConfirm}
        title={pendingEdit ? 'Confirmar Edición' : 'Confirmar Cambio de Estado'}
        message={pendingEdit 
          ? 'Para confirmar la actualización de los datos del alumno, ingresa tu contraseña.'
          : `¿Estás seguro de que deseas ${pendingStatusChange?.newStatus === 'activo' ? 'activar' : 'desactivar'} a este alumno? Esta acción requiere confirmación con tu contraseña.`
        }
      />
    </DirectorSidebar>
  );
}

export default function AlumnosPage() {
  return (
    <ProtectedRoute requiredRole={["DIRECTOR", "ADMINISTRATIVO"]}>
      <AlumnosContent />
    </ProtectedRoute>
  );
}
