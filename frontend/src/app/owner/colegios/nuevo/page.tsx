'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import RegistroColegioForm from '@/components/RegistroColegioForm';
import { ColegioFormData } from '@/types/colegio';

function NuevoColegioContent() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: ColegioFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/colegios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar el colegio');
      }

      const colegio = await response.json();
      console.log('Colegio registrado:', colegio);
      
      alert('Colegio registrado exitosamente');
      router.push('/owner/dashboard');
    } catch (error) {
      console.error('Error al registrar colegio:', error);
      alert(error instanceof Error ? error.message : 'Error al registrar el colegio');
    } finally {
      setLoading(false);
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
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Nuevo Colegio</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RegistroColegioForm onSubmit={handleSubmit} loading={loading} />
      </main>
    </div>
  );
}

export default function NuevoColegio() {
  return (
    <ProtectedRoute requiredRole="OWNER">
      <NuevoColegioContent />
    </ProtectedRoute>
  );
}
