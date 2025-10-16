'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import OwnerSidebar from '@/components/layout/OwnerSidebar';
import DashboardFooter from '@/components/layout/DashboardFooter';
import ModalDirector from '@/components/modals/ModalDirector';
import ModalDetallesDirector from '@/components/modals/ModalDetallesDirector';

interface Director {
  id: number;
  usuarioRol: {
    usuario: {
      id: number;
      email: string;
      dni: string;
      nombres: string;
      apellidos: string;
      telefono: string;
      estado: string;
      creado_en: string;
    };
    colegio: {
      id: number;
      nombre: string;
      codigoModular: string;
      ugel: {
        nombre: string;
        dre: {
          nombre: string;
        };
      };
    };
  };
  fechaNacimiento: string | null;
  sexo: string | null;
  gradoAcademico: string | null;
  creadoEn: string;
}

function GestionDirectoresContent() {
  const router = useRouter();
  const [directores, setDirectores] = useState<Director[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModalDirector, setShowModalDirector] = useState(false);
  const [showModalDetalles, setShowModalDetalles] = useState(false);
  const [directorSeleccionado, setDirectorSeleccionado] = useState<number | undefined>(undefined);
  const itemsPerPage = 12;

  useEffect(() => {
    cargarDirectores();
  }, []);

  const cargarDirectores = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/directores', {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Error al cargar directores');

      const data = await response.json();
      setDirectores(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar la lista de directores');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar directores por búsqueda
  const directoresFiltrados = directores.filter((director) => {
    const searchLower = searchTerm.toLowerCase();
    const nombreCompleto = `${director.usuarioRol.usuario.nombres} ${director.usuarioRol.usuario.apellidos}`.toLowerCase();
    const colegio = director.usuarioRol.colegio.nombre.toLowerCase();
    const dni = director.usuarioRol.usuario.dni || '';
    
    return (
      nombreCompleto.includes(searchLower) ||
      colegio.includes(searchLower) ||
      dni.includes(searchLower)
    );
  });

  // Paginación
  const totalPages = Math.ceil(directoresFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const directoresPaginados = directoresFiltrados.slice(startIndex, startIndex + itemsPerPage);

  return (
    <OwnerSidebar>
      <main className="flex-1 p-8 overflow-auto">
        {/* Header de la página */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold text-[#333333] mb-2" 
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Gestión de Directores
          </h1>
          <p className="text-[#666666]">Administra y registra directores del sistema educativo</p>
        </div>
        {/* Header con búsqueda y botón agregar */}
        <div className="mb-8 flex flex-row gap-3 justify-between items-center">
          {/* Barra de búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre, DNI o colegio..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 pl-12 border-2 border-[#E9E1C9] rounded-lg focus:outline-none focus:border-[#8D2C1D] focus:ring-2 focus:ring-[#8D2C1D]/20 transition-all bg-white text-[#333333] placeholder:text-[#999999]"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666] pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Botón agregar director */}
          <button
            onClick={() => {
              setDirectorSeleccionado(undefined);
              setShowModalDirector(true);
            }}
            className="
              bg-[#8D2C1D] hover:bg-[#84261A]
              text-white px-3 py-3 md:px-6 rounded-lg
              font-medium text-sm md:text-base
              transition-all duration-300
              shadow-md hover:shadow-lg
              hover:-translate-y-0.5
              active:scale-95
              flex items-center gap-2
              whitespace-nowrap
            "
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="hidden sm:inline">Registrar Nuevo Director</span>
            <span className="sm:hidden">Agregar</span>
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D] mx-auto"></div>
            <p className="mt-4 text-[#666666]">Cargando directores...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && directoresFiltrados.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-2 border-[#E9E1C9] max-w-md mx-auto">
              <svg
                className="w-16 h-16 text-[#D96924] mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="text-xl font-bold text-[#333333] mb-2">
                {searchTerm ? 'No se encontraron resultados' : 'No hay directores registrados'}
              </h3>
              <p className="text-[#666666] mb-4">
                {searchTerm
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza registrando tu primer director'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => {
                    setDirectorSeleccionado(undefined);
                    setShowModalDirector(true);
                  }}
                  className="bg-[#8D2C1D] hover:bg-[#84261A] text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Registrar Director
                </button>
              )}
            </div>
          </div>
        )}

        {/* Grid de directores */}
        {!loading && directoresPaginados.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {directoresPaginados.map((director) => (
                <DirectorCard 
                  key={director.id} 
                  director={director} 
                  onUpdate={cargarDirectores}
                  onVerDetalles={(id) => {
                    setDirectorSeleccionado(id);
                    setShowModalDetalles(true);
                  }}
                  onEditar={(id) => {
                    setDirectorSeleccionado(id);
                    setShowModalDirector(true);
                  }}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white border-2 border-[#E9E1C9] text-[#333333] disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#8D2C1D] transition-colors"
                >
                  Anterior
                </button>
                
                <span className="px-4 py-2 text-[#333333] font-medium">
                  Página {currentPage} de {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-white border-2 border-[#E9E1C9] text-[#333333] disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#8D2C1D] transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <DashboardFooter />
      </main>

      {/* Modales */}
      <ModalDirector
        isOpen={showModalDirector}
        onClose={() => {
          setShowModalDirector(false);
          setDirectorSeleccionado(undefined);
        }}
        onSuccess={() => {
          cargarDirectores();
          setShowModalDirector(false);
          setDirectorSeleccionado(undefined);
        }}
        directorId={directorSeleccionado}
      />

      {directorSeleccionado && (
        <ModalDetallesDirector
          isOpen={showModalDetalles}
          onClose={() => {
            setShowModalDetalles(false);
            setDirectorSeleccionado(undefined);
          }}
          directorId={directorSeleccionado}
        />
      )}
    </OwnerSidebar>
  );
}

// Componente de Card de Director
function DirectorCard({ 
  director, 
  onUpdate, 
  onVerDetalles, 
  onEditar 
}: { 
  director: Director; 
  onUpdate: () => void;
  onVerDetalles: (id: number) => void;
  onEditar: (id: number) => void;
}) {
  const [loading, setLoading] = useState(false);
  const estadoActivo = director.usuarioRol.usuario.estado === 'activo';

  const handleToggleEstado = async () => {
    if (!confirm(`¿Estás seguro de ${estadoActivo ? 'desactivar' : 'activar'} este director?`)) {
      return;
    }

    setLoading(true);
    try {
      const endpoint = estadoActivo ? 'desactivar' : 'activar';
      const response = await fetch(`http://localhost:3001/api/directores/${director.id}/${endpoint}`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Error al cambiar el estado');

      alert(`Director ${estadoActivo ? 'desactivado' : 'activado'} exitosamente`);
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cambiar el estado del director');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-[#E9E1C9] hover:border-[#D96924]/30 hover:-translate-y-1 p-6 relative">
      {/* Estado badge */}
      <div className="absolute top-4 right-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            estadoActivo
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {estadoActivo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8D2C1D] to-[#D96924] flex items-center justify-center text-white text-2xl font-bold">
          {director.usuarioRol.usuario.nombres?.charAt(0)}
          {director.usuarioRol.usuario.apellidos?.charAt(0)}
        </div>
      </div>

      {/* Información */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-[#333333] mb-1" style={{ fontFamily: 'var(--font-poppins)' }}>
          {director.usuarioRol.usuario.nombres} {director.usuarioRol.usuario.apellidos}
        </h3>
        <p className="text-sm text-[#666666] mb-2">
          DNI: {director.usuarioRol.usuario.dni || 'No registrado'}
        </p>
        <div className="bg-[#E9E1C9] rounded-lg p-2 mb-2">
          <p className="text-xs font-semibold text-[#8D2C1D]">
            {director.usuarioRol.colegio.nombre}
          </p>
          <p className="text-xs text-[#666666]">
            {director.usuarioRol.colegio.codigoModular}
          </p>
        </div>
        <p className="text-xs text-[#999999]">
          {director.usuarioRol.colegio.ugel.nombre}
        </p>
      </div>

      {/* Acciones */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => onVerDetalles(director.id)}
            className="flex-1 bg-[#3D73B9] hover:bg-[#2d5a94] text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          >
            Ver Detalles
          </button>
          <button
            onClick={() => onEditar(director.id)}
            className="flex-1 bg-[#D96924] hover:bg-[#C64925] text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          >
            Editar
          </button>
        </div>
        <button
          onClick={handleToggleEstado}
          disabled={loading}
          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            estadoActivo
              ? 'bg-[#8D2C1D] hover:bg-[#84261A] text-white'
              : 'bg-[#D96924] hover:bg-[#C64925] text-white'
          }`}
        >
          {loading ? 'Procesando...' : estadoActivo ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </div>
  );
}

export default function GestionDirectores() {
  return (
    <ProtectedRoute requiredRole="OWNER">
      <GestionDirectoresContent />
    </ProtectedRoute>
  );
}
