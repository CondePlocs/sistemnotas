'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SalonConAlumnos, AlumnoSalon } from '@/types/salon-alumnos';
import { Salon } from '@/types/salon';
import ModalAsignacionAlumnos from '@/components/modals/ModalAsignacionAlumnos';
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
}

export default function AlumnosPorSalonPage() {
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
    eliminandoAlumno: null
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserGroupIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {salon.grado} - {salon.seccion}
                  </h1>
                  <p className="text-gray-600">
                    {salon.nivel} • {estadisticas.totalAlumnos} alumno{estadisticas.totalAlumnos !== 1 ? 's' : ''} asignado{estadisticas.totalAlumnos !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={abrirModalAsignacion}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Asignar Alumnos
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Alumnos</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.totalAlumnos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Capacidad</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round((estadisticas.totalAlumnos / 30) * 100)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Edad Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {asignaciones.length > 0 
                    ? Math.round(asignaciones.reduce((sum: number, a: any) => sum + (a.alumno.edad || 0), 0) / asignaciones.length)
                    : 0
                  } años
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={estado.busqueda}
                  onChange={(e) => setEstado(prev => ({ ...prev, busqueda: e.target.value }))}
                  placeholder="Buscar alumno por nombre, apellido o DNI..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {alumnosFiltrados.length} de {estadisticas.totalAlumnos} alumnos
            </div>
          </div>
        </div>

        {/* Lista de alumnos */}
        <div className="bg-white rounded-lg shadow-sm">
          {alumnosFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {estadisticas.totalAlumnos === 0 ? 'No hay alumnos asignados' : 'No se encontraron alumnos'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {estadisticas.totalAlumnos === 0 
                  ? 'Comienza asignando alumnos a este salón'
                  : 'Prueba ajustando los filtros de búsqueda'
                }
              </p>
              {estadisticas.totalAlumnos === 0 && (
                <button
                  onClick={abrirModalAsignacion}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Asignar Alumnos
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alumno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DNI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Edad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Asignación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asignado por
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {alumnosFiltrados.map((asignacion) => (
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
          )}
        </div>
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
    </div>
  );
}
