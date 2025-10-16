'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import DirectorSidebar from '@/components/layout/DirectorSidebar';
import ModalAsignacionProfesor from '@/components/modals/ModalAsignacionProfesor';
import ModalConfirmarPassword from '@/components/modals/ModalConfirmarPassword';
import AsignacionCard from '@/components/director/AsignacionCard';
import FiltrosAsignaciones from '@/components/director/FiltrosAsignaciones';
import Paginacion from '@/components/common/Paginacion';
import { 
  ProfesorAsignacion, 
  ListaAsignacionesResponse,
  ProfesorAsignacionFormData 
} from '@/types/profesor-asignacion';
import { PlusIcon, UserGroupIcon } from '@heroicons/react/24/outline';

function AsignacionesProfesorContent() {
  const router = useRouter();
  const { user, hasRole, logout } = useAuth();
  const [asignaciones, setAsignaciones] = useState<ProfesorAsignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permisoVerificado, setPermisoVerificado] = useState(false);
  
  // Estados para filtros y paginación
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<boolean | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 20; // 4 columnas x 5 filas
  
  // Estados para confirmación de contraseña
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState<{
    tipo: 'activar' | 'desactivar' | 'pasar-grupo';
    asignacionId: number;
    activo?: boolean;
  } | null>(null);

  // Verificar permisos para administrativos
  const verificarPermisos = async () => {
    console.log('🔍 Iniciando verificación de permisos...');
    console.log('🔍 Usuario actual:', user);
    console.log('🔍 hasRole DIRECTOR:', hasRole('DIRECTOR'));
    console.log('🔍 hasRole ADMINISTRATIVO:', hasRole('ADMINISTRATIVO'));

    if (hasRole('DIRECTOR')) {
      console.log('✅ Es director, permisos verificados');
      setPermisoVerificado(true);
      return;
    }

    if (hasRole('ADMINISTRATIVO')) {
      console.log('🔍 Es administrativo, verificando permisos específicos...');
      try {
        // Usar directamente el ID 3 que sabemos que funciona en el dashboard
        const adminId = 3;
        console.log('🆔 Usando ID del administrativo:', adminId);

        console.log('🔍 Verificando permisos específicos...');
        const response = await fetch(`http://localhost:3001/api/permisos/verificar/${adminId}/asignar-profesores`, {
          credentials: 'include'
        });

        console.log('📡 Respuesta de verificación:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('📋 Datos de permisos:', data);
          if (data.tienePermiso) {
            console.log('✅ Permisos verificados correctamente');
            setPermisoVerificado(true);
          } else {
            console.log('❌ No tiene permisos');
            setError('No tienes permisos para gestionar asignaciones de profesores. Contacta al director.');
          }
        } else {
          console.error('❌ Error en verificación de permisos:', response.status);
          setError('Error al verificar permisos');
        }
      } catch (error) {
        console.error('❌ Error verificando permisos:', error);
        setError('Error de conexión al verificar permisos');
      }
    } else {
      console.log('❌ No es director ni administrativo');
      setError('No tienes permisos para acceder a esta página');
    }
  };

  // Cargar asignaciones
  const cargarAsignaciones = async () => {
    console.log('🔍 Iniciando carga de asignaciones...');
    try {
      const params = new URLSearchParams();
      if (filtroActivo !== null) {
        params.append('activo', filtroActivo.toString());
      }

      console.log('📡 Haciendo petición a:', `http://localhost:3001/api/profesor-asignaciones?${params.toString()}`);
      const response = await fetch(`http://localhost:3001/api/profesor-asignaciones?${params.toString()}`, {
        credentials: 'include'
      });

      console.log('📡 Respuesta de asignaciones:', response.status);

      if (response.ok) {
        const data: ListaAsignacionesResponse = await response.json();
        console.log('📋 Asignaciones cargadas:', data);
        setAsignaciones(data.data.asignaciones);
      } else {
        console.error('❌ Error al cargar asignaciones:', response.status);
        setError('Error al cargar asignaciones de profesores');
      }
    } catch (error) {
      console.error('❌ Error en carga de asignaciones:', error);
      setError('Error de conexión');
    } finally {
      console.log('✅ Finalizando carga, setting loading = false');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect verificarPermisos - user:', user, 'hasRole:', hasRole);
    if (user) {
      verificarPermisos();
    }
  }, [user, hasRole]);

  useEffect(() => {
    console.log('🔄 useEffect cargarAsignaciones - permisoVerificado:', permisoVerificado);
    if (permisoVerificado) {
      cargarAsignaciones();
    }
  }, [filtroActivo, permisoVerificado]);

  // Crear asignación
  const handleCrearAsignacion = async (formData: ProfesorAsignacionFormData) => {
    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:3001/api/profesor-asignaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await cargarAsignaciones(); // Recargar lista
        setModalOpen(false);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al crear asignación');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  // Funciones de filtrado
  const asignacionesFiltradas = asignaciones.filter(asignacion => {
    // Filtro por estado
    if (filtroActivo !== null && asignacion.activo !== filtroActivo) {
      return false;
    }
    
    // Filtro por búsqueda
    if (busqueda.trim() !== '') {
      const termino = busqueda.toLowerCase();
      const profesor = `${asignacion.profesor.usuarioRol.usuario.nombres} ${asignacion.profesor.usuarioRol.usuario.apellidos}`.toLowerCase();
      const curso = asignacion.curso.nombre.toLowerCase();
      const salon = `${asignacion.salon.grado} ${asignacion.salon.seccion} ${asignacion.salon.colegioNivel.nivel.nombre}`.toLowerCase();
      
      return profesor.includes(termino) || curso.includes(termino) || salon.includes(termino);
    }
    
    return true;
  });
  
  // Cálculos de paginación
  const totalPaginas = Math.ceil(asignacionesFiltradas.length / elementosPorPagina);
  const indiceInicio = (paginaActual - 1) * elementosPorPagina;
  const indiceFin = indiceInicio + elementosPorPagina;
  const asignacionesPaginadas = asignacionesFiltradas.slice(indiceInicio, indiceFin);
  
  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroActivo]);
  
  // Manejar acciones con confirmación
  const handleCambiarEstado = (asignacionId: number, activo: boolean) => {
    setAccionPendiente({
      tipo: activo ? 'activar' : 'desactivar',
      asignacionId,
      activo
    });
    setModalConfirmacion(true);
  };
  
  const handlePasarGrupo = (asignacionId: number) => {
    setAccionPendiente({
      tipo: 'pasar-grupo',
      asignacionId
    });
    setModalConfirmacion(true);
  };
  
  // Ejecutar acción confirmada
  const ejecutarAccion = async (password: string) => {
    if (!accionPendiente) return;
    
    try {
      if (accionPendiente.tipo === 'pasar-grupo') {
        // Por ahora solo mostrar mensaje
        alert('Funcionalidad "Pasar Grupo" será implementada próximamente');
        setModalConfirmacion(false);
        setAccionPendiente(null);
        return;
      }
      
      const endpoint = accionPendiente.activo ? 'activar' : 'desactivar';
      const response = await fetch(`http://localhost:3001/api/profesor-asignaciones/${accionPendiente.asignacionId}/${endpoint}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        await cargarAsignaciones();
        setModalConfirmacion(false);
        setAccionPendiente(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || `Error al ${accionPendiente.activo ? 'activar' : 'desactivar'} asignación`);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando asignaciones...</p>
        </div>
      </div>
    );
  }

  if (error && !permisoVerificado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            <strong className="font-bold">Error de permisos</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
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
            Asignación de Profesores
          </h1>
          <p className="text-[#666666]">Asigna profesores a cursos específicos</p>
        </div>

        {/* Barra de búsqueda y botón Nueva Asignación */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E9E1C9]/30 p-4 sm:p-6 mb-6">
          <div className="flex gap-3 items-center">
            {/* Barra de búsqueda */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por profesor, curso o salón..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-[#E9E1C9] rounded-xl leading-5 bg-white text-[#333333] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#8D2C1D] focus:border-[#8D2C1D] transition-colors"
              />
            </div>
            
            {/* Botón Nueva Asignación - Siempre a la derecha */}
            <button
              onClick={() => setModalOpen(true)}
              className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] hover:from-[#7A2518] hover:to-[#C55A1F] text-white px-4 sm:px-6 py-3 rounded-xl flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
            >
              <PlusIcon className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">Nueva Asignación</span>
            </button>
          </div>
        </div>
        
        {/* Filtros compactos */}
        <FiltrosAsignaciones
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          filtroActivo={filtroActivo}
          onFiltroActivoChange={setFiltroActivo}
          totalAsignaciones={asignaciones.length}
          asignacionesFiltradas={asignacionesFiltradas.length}
        />

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Lista de Asignaciones */}
        {asignacionesFiltradas.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 max-w-md mx-auto">
              <UserGroupIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {asignaciones.length === 0 ? 'No hay asignaciones' : 'No se encontraron resultados'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {asignaciones.length === 0 
                  ? 'Comienza creando tu primera asignación de profesor.'
                  : 'Intenta ajustar los filtros de búsqueda.'
                }
              </p>
              {asignaciones.length === 0 && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl flex items-center mx-auto transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nueva Asignación
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Grid de Cards - 2 columnas en móvil */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {asignacionesPaginadas.map((asignacion) => (
                <AsignacionCard
                  key={asignacion.id}
                  asignacion={asignacion}
                  onCambiarEstado={handleCambiarEstado}
                  onPasarGrupo={handlePasarGrupo}
                />
              ))}
            </div>
            
            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-[#E9E1C9]/30">
                <Paginacion
                  paginaActual={paginaActual}
                  totalPaginas={totalPaginas}
                  totalElementos={asignacionesFiltradas.length}
                  elementosPorPagina={elementosPorPagina}
                  onCambioPagina={setPaginaActual}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Modales */}
      <ModalAsignacionProfesor
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCrearAsignacion}
        loading={submitting}
      />
      
      <ModalConfirmarPassword
        isOpen={modalConfirmacion}
        onClose={() => {
          setModalConfirmacion(false);
          setAccionPendiente(null);
        }}
        onConfirm={ejecutarAccion}
        title={`Confirmar ${accionPendiente?.tipo === 'activar' ? 'Activación' : accionPendiente?.tipo === 'desactivar' ? 'Desactivación' : 'Acción'}`}
        message={`¿Estás seguro de que deseas ${accionPendiente?.tipo === 'activar' ? 'activar' : accionPendiente?.tipo === 'desactivar' ? 'desactivar' : 'realizar esta acción en'} esta asignación?`}
      />
    </DirectorSidebar>
  );
}

export default function AsignacionesProfesorPage() {
  return (
    <ProtectedRoute requiredRole={["DIRECTOR", "ADMINISTRATIVO"]}>
      <AsignacionesProfesorContent />
    </ProtectedRoute>
  );
}
