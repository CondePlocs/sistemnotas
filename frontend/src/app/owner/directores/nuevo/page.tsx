'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import RegistroDirectorForm from '@/components/RegistroDirectorForm';
import { DirectorFormData } from '@/types/director';
import { Colegio } from '@/types/colegio';

function NuevoDirectorContent() {
  const [loading, setLoading] = useState(false);
  const [colegios, setColegios] = useState<Colegio[]>([]);
  const [loadingColegios, setLoadingColegios] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const colegioId = searchParams.get('colegioId');

  useEffect(() => {
    // Cargar colegios desde el API
    const cargarColegios = async () => {
      try {
        const response = await fetch('/api/colegios');
        if (!response.ok) throw new Error('Error al cargar colegios');
        
        const colegiosData = await response.json();
        setColegios(colegiosData);
      } catch (error) {
        console.error('Error al cargar colegios:', error);
        alert('Error al cargar la lista de colegios');
      } finally {
        setLoadingColegios(false);
      }
    };

    cargarColegios();
  }, []);

  const handleSubmit = async (data: DirectorFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/directores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar el director');
      }

      const director = await response.json();
      console.log('Director registrado:', director);
      
      alert('Director registrado exitosamente');
      router.push('/owner/dashboard');
    } catch (error) {
      console.error('Error al registrar director:', error);
      alert(error instanceof Error ? error.message : 'Error al registrar el director');
    } finally {
      setLoading(false);
    }
  };

  if (loadingColegios) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando colegios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Nuevo Director</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {colegios.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-yellow-800 mb-2">No hay colegios disponibles</h3>
              <p className="text-yellow-700 mb-4">
                Necesitas crear al menos un colegio antes de poder registrar un director.
              </p>
              <button
                onClick={() => router.push('/owner/colegios/nuevo')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md"
              >
                Crear Colegio
              </button>
            </div>
          </div>
        ) : (
          <RegistroDirectorForm 
            onSubmit={handleSubmit} 
            colegios={colegios}
            loading={loading}
            colegioPreseleccionado={colegioId ? parseInt(colegioId) : undefined}
          />
        )}
      </main>
    </div>
  );
}

export default function NuevoDirector() {
  return (
    <ProtectedRoute requiredRole="OWNER">
      <NuevoDirectorContent />
    </ProtectedRoute>
  );
}
