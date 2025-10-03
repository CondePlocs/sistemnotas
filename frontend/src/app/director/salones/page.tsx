'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { NivelEducativo } from '@/types/colegio';
import CrearSalonModal from '@/components/CrearSalonModal';

interface NivelesColegio {
  colegioId: number;
  colegioNombre: string;
  nivelesPermitidos: {
    id: number;
    nombre: string;
    puedeCrearSalones: boolean;
  }[];
}

interface SalonCardProps {
  nivel: NivelEducativo;
  onCrearSalon: (nivel: NivelEducativo) => void;
}

function SalonCard({ nivel, onCrearSalon }: SalonCardProps) {
  const getCardInfo = (nivel: NivelEducativo) => {
    switch (nivel) {
      case NivelEducativo.INICIAL:
        return {
          icon: '👶',
          titulo: 'Inicial',
          descripcion: 'Crear salones de 3, 4 y 5 años',
          color: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
          buttonColor: 'bg-pink-600 hover:bg-pink-700'
        };
      case NivelEducativo.PRIMARIA:
        return {
          icon: '📚',
          titulo: 'Primaria',
          descripcion: 'Crear salones de 1° a 6° grado',
          color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
      case NivelEducativo.SECUNDARIA:
        return {
          icon: '🎓',
          titulo: 'Secundaria',
          descripcion: 'Crear salones de 1° a 5° año',
          color: 'bg-green-50 border-green-200 hover:bg-green-100',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        };
    }
  };

  const info = getCardInfo(nivel);

  return (
    <div className={`p-6 rounded-lg border-2 transition-all duration-200 ${info.color}`}>
      <div className="text-center">
        <div className="text-4xl mb-3">{info.icon}</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{info.titulo}</h3>
        <p className="text-gray-600 mb-4">{info.descripcion}</p>
        
        {/* Estadísticas simuladas */}
        <div className="bg-white rounded-lg p-3 mb-4">
          <div className="text-sm text-gray-500">Salones actuales</div>
          <div className="text-2xl font-bold text-gray-800">0</div>
        </div>
        
        <button
          onClick={() => onCrearSalon(nivel)}
          className={`w-full text-white py-2 px-4 rounded-md transition-colors ${info.buttonColor}`}
        >
          Crear Salón
        </button>
      </div>
    </div>
  );
}

function GestionSalonesContent() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nivelSeleccionado, setNivelSeleccionado] = useState<NivelEducativo | null>(null);
  const [nivelesColegio, setNivelesColegio] = useState<NivelesColegio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar niveles del colegio al montar el componente
  useEffect(() => {
    const cargarNiveles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/colegios/mi-colegio/niveles', {
          method: 'GET',
          credentials: 'include', // Para incluir cookies de autenticación
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al cargar los niveles del colegio');
        }

        const data: NivelesColegio = await response.json();
        setNivelesColegio(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error cargando niveles:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarNiveles();
  }, []);

  const handleCrearSalon = (nivel: NivelEducativo) => {
    setNivelSeleccionado(nivel);
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setNivelSeleccionado(null);
  };

  const handleSalonCreado = async (salonData: any) => {
    console.log('Datos del salón:', salonData);
    
    try {
      if (salonData.tipo === 'manual') {
        // Creación manual - un solo salón
        const response = await fetch('/api/salones', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nivel: salonData.nivel,
            grado: salonData.grado,
            seccion: salonData.seccion,
            turno: salonData.turno
          })
        });

        if (!response.ok) {
          throw new Error('Error al crear el salón');
        }

        const result = await response.json();
        console.log('Salón creado:', result);
        alert('¡Salón creado exitosamente!');
        
      } else if (salonData.tipo === 'automatico') {
        // Creación automática - múltiples salones
        const response = await fetch('/api/salones/lote', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nivel: salonData.nivel,
            grado: salonData.grado,
            secciones: salonData.secciones,
            turno: salonData.turno
          })
        });

        if (!response.ok) {
          throw new Error('Error al crear los salones');
        }

        const result = await response.json();
        console.log('Salones creados:', result);
        alert(`¡${result.resumen?.total || salonData.secciones.length} salones creados exitosamente!`);
      }
      
      handleCerrarModal();
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear el/los salón(es). Por favor intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Salones</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando niveles del colegio...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-600 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && nivelesColegio && (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Niveles Educativos Autorizados - {nivelesColegio.colegioNombre}
              </h2>
              <p className="text-gray-600">
                Selecciona un nivel para crear salones. Solo puedes crear salones de los niveles autorizados para tu colegio.
              </p>
            </div>

            {/* Cards de Niveles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nivelesColegio.nivelesPermitidos.map((nivelData) => (
                <SalonCard
                  key={nivelData.id}
                  nivel={nivelData.nombre as NivelEducativo}
                  onCrearSalon={handleCrearSalon}
                />
              ))}
            </div>

            {/* Mensaje si no hay niveles */}
            {nivelesColegio.nivelesPermitidos.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏫</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No hay niveles autorizados
                </h3>
                <p className="text-gray-600">
                  Contacta al administrador para configurar los niveles educativos de tu colegio.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de Creación */}
      {modalAbierto && nivelSeleccionado && (
        <CrearSalonModal
          nivel={nivelSeleccionado}
          onClose={handleCerrarModal}
          onSubmit={handleSalonCreado}
        />
      )}
    </div>
  );
}

export default function GestionSalones() {
  return (
    <ProtectedRoute requiredRole={["DIRECTOR", "ADMINISTRATIVO"]}>
      <GestionSalonesContent />
    </ProtectedRoute>
  );
}
