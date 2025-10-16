'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SalonConAlumnos, AlumnoSalon } from '@/types/salon-alumnos';
import { Salon } from '@/types/salon';
import ModalAsignacionAlumnos from '@/components/modals/ModalAsignacionAlumnos';
import ProtectedRoute from '@/components/ProtectedRoute';
import DirectorSidebar from '@/components/layout/DirectorSidebar';
import { 
  ArrowLeftIcon,
  UserGroupIcon, 
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface EstadoPagina {
  datosCompletos: SalonConAlumnos | null;
  modalAsignacionAbierto: boolean;
  cargando: boolean;
  error: string | null;
  busqueda: string;
  eliminandoAlumno: number | null;
  // Paginación
  paginaActual: number;
  alumnosPorPagina: number;
}

function AlumnosPorSalonPageContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const salonId = parseInt(params.id as string);

  const [estado, setEstado] = useState<EstadoPagina>({
    datosCompletos: null,
    modalAsignacionAbierto: false,
    cargando: true,
    error: null,
    busqueda: '',
    eliminandoAlumno: null,
    // Paginación
    paginaActual: 1,
    alumnosPorPagina: 20
  });

  useEffect(() => {
    if (salonId) {
      cargarDatosSalon();
    }
  }, [salonId]);

  const cargarDatosSalon = async () => {
    try {
      setEstado(prev => ({ ...prev, cargando: true, error: null }));

      const response = await fetch(`http://localhost:3001/api/salones/${salonId}/alumnos`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar datos del salón');
      }

      const data = await response.json();
      setEstado(prev => ({
        ...prev,
        datosCompletos: data.data,
        cargando: false
      }));
    } catch (error) {
      console.error('Error:', error);
      setEstado(prev => ({
        ...prev,
        error: 'Error al cargar los datos del salón',
        cargando: false
      }));
    }
  };

  const removerAlumno = async (alumnoId: number) => {
    if (!confirm('¿Estás seguro de que quieres remover este alumno del salón?')) {
      return;
    }

    try {
      setEstado(prev => ({ ...prev, eliminandoAlumno: alumnoId }));

      const response = await fetch(`http://localhost:3001/api/salones/${salonId}/alumnos/${alumnoId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al remover alumno');
      }

      const result = await response.json();
      console.log('✅ Alumno removido exitosamente:', result);

      // Recargar datos
      await cargarDatosSalon();
      
      // Mostrar mensaje de éxito
      alert(result.message || 'Alumno removido exitosamente');
    } catch (error: any) {
      console.error('❌ Error al remover alumno:', error);
      alert(`Error: ${error?.message || 'Error desconocido'}`);
    } finally {
      setEstado(prev => ({ ...prev, eliminandoAlumno: null }));
    }
  };

  const abrirModalAsignacion = () => {
    setEstado(prev => ({ ...prev, modalAsignacionAbierto: true }));
  };

  const cerrarModalAsignacion = () => {
    setEstado(prev => ({ ...prev, modalAsignacionAbierto: false }));
  };

  const onAsignacionExitosa = () => {
    cargarDatosSalon();
    cerrarModalAsignacion();
  };

  // Filtrar alumnos por búsqueda
  const alumnosFiltrados = estado.datosCompletos?.asignaciones?.filter(asignacion =>
    !estado.busqueda ||
    asignacion.alumno.nombres.toLowerCase().includes(estado.busqueda.toLowerCase()) ||
    asignacion.alumno.apellidos.toLowerCase().includes(estado.busqueda.toLowerCase()) ||
    (asignacion.alumno.dni && asignacion.alumno.dni.includes(estado.busqueda))
  ) || [];

  // Paginación
  const totalPaginas = Math.ceil(alumnosFiltrados.length / estado.alumnosPorPagina);
  const indiceInicio = (estado.paginaActual - 1) * estado.alumnosPorPagina;
  const indiceFin = indiceInicio + estado.alumnosPorPagina;
  const alumnosPaginados = alumnosFiltrados.slice(indiceInicio, indiceFin);

  // Funciones de paginación
  const cambiarPagina = (nuevaPagina: number) => {
    setEstado(prev => ({ ...prev, paginaActual: nuevaPagina }));
  };

  const paginaAnterior = () => {
    if (estado.paginaActual > 1) {
      cambiarPagina(estado.paginaActual - 1);
    }
  };

  const paginaSiguiente = () => {
    if (estado.paginaActual < totalPaginas) {
      cambiarPagina(estado.paginaActual + 1);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const obtenerIniciales = (nombres: string, apellidos: string) => {
    return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
  };

  if (estado.cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos del salón...</p>
        </div>
      </div>
    );
  }

  if (estado.error || !estado.datosCompletos) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{estado.error || 'No se encontraron datos'}</p>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  const { salon, asignaciones, estadisticas } = estado.datosCompletos;

  return (
    <DirectorSidebar>
      <main className="flex-1 p-8 overflow-auto">
        {/* Header de la página */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-3 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg border-2 border-[#E9E1C9] hover:border-[#8D2C1D] transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 text-[#8D2C1D]"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 
                className="text-3xl font-bold text-[#333333] mb-2" 
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                Alumnos del Salón {salon.grado} - {salon.seccion}
              </h1>
              <p className="text-[#666666]">
                {salon.nivel} • {estadisticas.totalAlumnos} alumno{estadisticas.totalAlumnos !== 1 ? 's' : ''} asignado{estadisticas.totalAlumnos !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div>
        {/* Estadísticas mejoradas - 3 en 1 fila móvil */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-6 border border-[#E9E1C9] shadow-lg">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left">
              <div className="p-1 sm:p-3 bg-blue-100 rounded-lg mb-1 sm:mb-0">
                <UserGroupIcon className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="sm:ml-4">
                <p className="text-xs sm:text-sm font-semibold text-gray-600">Total</p>
                <p className="text-lg sm:text-3xl font-bold text-[#8D2C1D]">{estadisticas.totalAlumnos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-6 border border-[#E9E1C9] shadow-lg">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left">
              <div className="p-1 sm:p-3 bg-green-100 rounded-lg mb-1 sm:mb-0">
                <CalendarIcon className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="sm:ml-4">
                <p className="text-xs sm:text-sm font-semibold text-gray-600">Capacidad</p>
                <p className="text-lg sm:text-3xl font-bold text-[#8D2C1D]">{Math.round((estadisticas.totalAlumnos / 30) * 100)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 sm:p-6 border border-[#E9E1C9] shadow-lg">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left">
              <div className="p-1 sm:p-3 bg-purple-100 rounded-lg mb-1 sm:mb-0">
                <UserIcon className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="sm:ml-4">
                <p className="text-xs sm:text-sm font-semibold text-gray-600">Edad Prom.</p>
                <p className="text-lg sm:text-3xl font-bold text-[#8D2C1D]">
                  {asignaciones.length > 0 
                    ? Math.round(asignaciones.reduce((sum: number, a: any) => sum + (a.alumno.edad || 0), 0) / asignaciones.length)
                    : 0
                  } años
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda mejorados */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 border border-[#E9E1C9] shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[#8D2C1D] mb-2">
                Buscar Alumno
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#666666]" />
                <input
                  type="text"
                  value={estado.busqueda}
                  onChange={(e) => setEstado(prev => ({ ...prev, busqueda: e.target.value }))}
                  placeholder="Buscar por nombre, apellido o DNI..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#E9E1C9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-all duration-200 bg-white/90 text-[#333333] placeholder-[#999999]"
                />
              </div>
            </div>
            
            {/* Botón Asignar Alumnos movido aquí */}
            <div className="flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={abrirModalAsignacion}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white font-semibold rounded-xl hover:from-[#D96924] hover:to-[#8D2C1D] focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Asignar Alumnos</span>
              </button>
            </div>
            
            <div className="text-xs sm:text-sm font-medium text-[#8D2C1D] bg-white/50 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-[#E9E1C9] text-center">
              Mostrando {indiceInicio + 1} - {Math.min(indiceFin, alumnosFiltrados.length)} de {alumnosFiltrados.length} alumnos
            </div>
          </div>
        </div>

        {/* Lista de alumnos mejorada */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#E9E1C9] shadow-lg overflow-hidden">
          {alumnosFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <div className="p-4 bg-[#8D2C1D]/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <UserGroupIcon className="h-10 w-10 text-[#8D2C1D]" />
              </div>
              <h3 className="text-xl font-bold text-[#8D2C1D] mb-2">
                {estadisticas.totalAlumnos === 0 ? 'No hay alumnos asignados' : 'No se encontraron alumnos'}
              </h3>
              <p className="text-[#666666] mb-4">
                {estadisticas.totalAlumnos === 0 
                  ? 'Comienza asignando alumnos a este salón'
                  : 'Prueba ajustando los filtros de búsqueda'
                }
              </p>
              {estadisticas.totalAlumnos === 0 && (
                <button
                  onClick={abrirModalAsignacion}
                  className="px-6 py-3 bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white font-semibold rounded-xl hover:from-[#D96924] hover:to-[#8D2C1D] transition-all duration-300 shadow-lg flex items-center gap-2 mx-auto"
                >
                  <PlusIcon className="h-5 w-5" />
                  Asignar Alumnos
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Vista Desktop - Tabla */}
              <div className="hidden sm:block overflow-hidden">
                <table className="min-w-full divide-y divide-[#E9E1C9]">
                  <thead className="bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#8D2C1D] uppercase tracking-wider">
                        Alumno
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#8D2C1D] uppercase tracking-wider">
                        DNI
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#8D2C1D] uppercase tracking-wider">
                        Edad
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#8D2C1D] uppercase tracking-wider">
                        Fecha Asignación
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#8D2C1D] uppercase tracking-wider">
                        Asignado por
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-[#8D2C1D] uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {alumnosPaginados.map((asignacion) => (
                      <tr key={asignacion.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-800">
                                  {obtenerIniciales(asignacion.alumno.nombres, asignacion.alumno.apellidos)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {asignacion.alumno.apellidos}, {asignacion.alumno.nombres}
                              </div>
                              {asignacion.alumno.numeroContacto && (
                                <div className="text-sm text-gray-500">
                                  {asignacion.alumno.numeroContacto}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {asignacion.alumno.dni || 'No registrado'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {asignacion.alumno.edad ? `${asignacion.alumno.edad} años` : 'No registrada'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatearFecha(asignacion.fechaAsignacion)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {asignacion.asignador.nombres} {asignacion.asignador.apellidos}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => removerAlumno(asignacion.alumno.id)}
                            disabled={estado.eliminandoAlumno === asignacion.alumno.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 p-1"
                            title="Remover del salón"
                          >
                            {estado.eliminandoAlumno === asignacion.alumno.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <TrashIcon className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vista Móvil - Cards */}
              <div className="sm:hidden space-y-3 p-4">
                {alumnosPaginados.map((asignacion) => (
                  <div key={asignacion.id} className="bg-white rounded-xl border border-[#E9E1C9] p-4 shadow-sm">
                    {/* Header del alumno */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-800">
                            {obtenerIniciales(asignacion.alumno.nombres, asignacion.alumno.apellidos)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#8D2C1D] text-sm">
                            {asignacion.alumno.apellidos}, {asignacion.alumno.nombres}
                          </h3>
                          <p className="text-xs text-gray-500">
                            DNI: {asignacion.alumno.dni || 'No registrado'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removerAlumno(asignacion.alumno.id)}
                        disabled={estado.eliminandoAlumno === asignacion.alumno.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        title="Remover del salón"
                      >
                        {estado.eliminandoAlumno === asignacion.alumno.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Información del alumno */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="font-medium text-gray-600">Edad:</span>
                        <p className="text-[#8D2C1D] font-semibold">
                          {asignacion.alumno.edad ? `${asignacion.alumno.edad} años` : 'No registrada'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Contacto:</span>
                        <p className="text-[#8D2C1D] font-semibold">
                          {asignacion.alumno.numeroContacto || 'No registrado'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Asignado:</span>
                        <p className="text-[#8D2C1D] font-semibold">
                          {formatearFecha(asignacion.fechaAsignacion)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Por:</span>
                        <p className="text-[#8D2C1D] font-semibold">
                          {asignacion.asignador.nombres} {asignacion.asignador.apellidos}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-[#E9E1C9] shadow-lg mt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Información de paginación */}
              <div className="text-sm text-[#666666]">
                Página {estado.paginaActual} de {totalPaginas} - {alumnosFiltrados.length} alumnos total
              </div>

              {/* Controles de paginación */}
              <div className="flex items-center gap-2">
                <button
                  onClick={paginaAnterior}
                  disabled={estado.paginaActual === 1}
                  className="px-3 py-2 text-sm font-medium text-[#8D2C1D] bg-white border-2 border-[#E9E1C9] rounded-lg hover:bg-[#8D2C1D] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Anterior
                </button>

                {/* Números de página */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numeroPagina => (
                    <button
                      key={numeroPagina}
                      onClick={() => cambiarPagina(numeroPagina)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        estado.paginaActual === numeroPagina
                          ? 'bg-gradient-to-r from-[#8D2C1D] to-[#D96924] text-white'
                          : 'text-[#8D2C1D] bg-white border-2 border-[#E9E1C9] hover:bg-[#8D2C1D] hover:text-white'
                      }`}
                    >
                      {numeroPagina}
                    </button>
                  ))}
                </div>

                <button
                  onClick={paginaSiguiente}
                  disabled={estado.paginaActual === totalPaginas}
                  className="px-3 py-2 text-sm font-medium text-[#8D2C1D] bg-white border-2 border-[#E9E1C9] rounded-lg hover:bg-[#8D2C1D] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Modal de asignación */}
        {estado.modalAsignacionAbierto && (
          <ModalAsignacionAlumnos
            salon={salon as any}
            isOpen={estado.modalAsignacionAbierto}
            onClose={cerrarModalAsignacion}
            onSuccess={onAsignacionExitosa}
          />
        )}
      </main>
    </DirectorSidebar>
  );
}

export default function AlumnosPorSalonPage() {
  return (
    <ProtectedRoute requiredRole={["DIRECTOR", "ADMINISTRATIVO"]}>
      <AlumnosPorSalonPageContent />
    </ProtectedRoute>
  );
}
