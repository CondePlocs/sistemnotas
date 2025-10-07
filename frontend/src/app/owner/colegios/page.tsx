'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/layout/DashboardHeader';
import ColegioCard from '@/components/owner/ColegioCard';
import ModalColegio from '@/components/owner/ModalColegio';
import ModalDetallesColegio from '@/components/owner/ModalDetallesColegio';
import { Colegio } from '@/types/colegio';

function GestionColegiosContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [colegios, setColegios] = useState<Colegio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModalColegio, setShowModalColegio] = useState(false);
  const [showModalDetalles, setShowModalDetalles] = useState(false);
  const [colegioSeleccionado, setColegioSeleccionado] = useState<number | undefined>();

  const itemsPerPage = 8;

  useEffect(() => {
    cargarColegios();
  }, []);

  const cargarColegios = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/colegios', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al cargar colegios');
      }

      const data = await response.json();
      setColegios(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar colegios');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Filtrar colegios
  const colegiosFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return colegios;

    const termLower = searchTerm.toLowerCase();
    return colegios.filter(colegio => 
      colegio.nombre.toLowerCase().includes(termLower) ||
      colegio.codigoModular?.toLowerCase().includes(termLower) ||
      colegio.distrito?.toLowerCase().includes(termLower) ||
      colegio.ugel?.nombre.toLowerCase().includes(termLower)
    );
  }, [colegios, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(colegiosFiltrados.length / itemsPerPage);
  const colegiosPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return colegiosFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [colegiosFiltrados, currentPage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCE0C1] via-[#F6CBA3] to-[#E9E1C9] flex flex-col">
      <DashboardHeader
        title="Gestión de Colegios"
        userName={user?.nombres}
        userEmail={user?.email}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header con búsqueda y botón agregar */}
        <div className="mb-8 flex flex-row gap-3 justify-between items-center">
          {/* Barra de búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre, código, distrito o UGEL..."
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

          {/* Botón agregar colegio */}
          <button
            onClick={() => {
              setColegioSeleccionado(undefined);
              setShowModalColegio(true);
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
            <span className="hidden sm:inline">Registrar Nuevo Colegio</span>
            <span className="sm:hidden">Agregar</span>
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2C1D] mx-auto"></div>
            <p className="mt-4 text-[#666666]">Cargando colegios...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && colegiosFiltrados.length === 0 && (
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="text-xl font-bold text-[#333333] mb-2">
                {searchTerm ? 'No se encontraron resultados' : 'No hay colegios registrados'}
              </h3>
              <p className="text-[#666666] mb-4">
                {searchTerm
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza registrando tu primer colegio'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => {
                    setColegioSeleccionado(undefined);
                    setShowModalColegio(true);
                  }}
                  className="bg-[#8D2C1D] hover:bg-[#84261A] text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Registrar Colegio
                </button>
              )}
            </div>
          </div>
        )}

        {/* Grid de colegios */}
        {!loading && colegiosPaginados.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {colegiosPaginados.map((colegio) => (
                <ColegioCard 
                  key={colegio.id} 
                  colegio={colegio} 
                  onUpdate={cargarColegios}
                  onVerDetalles={(id) => {
                    setColegioSeleccionado(id);
                    setShowModalDetalles(true);
                  }}
                  onEditar={(id) => {
                    setColegioSeleccionado(id);
                    setShowModalColegio(true);
                  }}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border-2 border-[#E9E1C9] rounded-lg hover:border-[#8D2C1D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-[#8D2C1D] text-white'
                          : 'bg-white border-2 border-[#E9E1C9] hover:border-[#8D2C1D]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border-2 border-[#E9E1C9] rounded-lg hover:border-[#8D2C1D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modales */}
      <ModalColegio
        isOpen={showModalColegio}
        onClose={() => {
          setShowModalColegio(false);
          setColegioSeleccionado(undefined);
        }}
        onSuccess={cargarColegios}
        colegioId={colegioSeleccionado}
      />

      <ModalDetallesColegio
        isOpen={showModalDetalles}
        onClose={() => {
          setShowModalDetalles(false);
          setColegioSeleccionado(undefined);
        }}
        colegioId={colegioSeleccionado!}
      />
    </div>
  );
}

export default function GestionColegios() {
  return (
    <ProtectedRoute requiredRole="OWNER">
      <GestionColegiosContent />
    </ProtectedRoute>
  );
}
