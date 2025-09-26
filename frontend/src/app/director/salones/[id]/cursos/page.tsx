'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import CursosSalon from '@/components/cursos/CursosSalon';
import { NivelEducativo } from '@/types/curso';

function CursosSalonPageContent() {
  const params = useParams();
  const router = useRouter();
  const salonId = parseInt(params.id as string);
  
  const [salon, setSalon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const cargarDatosSalon = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/salones/${salonId}/alumnos`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setSalon(data.data.salon);
        }
      } catch (error) {
        console.error('Error cargando datos del salón:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (salonId) {
      cargarDatosSalon();
    }
  }, [salonId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos del salón...</p>
        </div>
      </div>
    );
  }
  
  if (!salon) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Salón no encontrado</h3>
          <button 
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800"
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Cursos
              </h1>
              <p className="text-sm text-gray-600">
                Visualiza y gestiona los cursos asignados automáticamente
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CursosSalon
          salonId={salonId}
          salon={salon}
          onRefresh={() => {
            console.log('Refrescando datos...');
          }}
        />
      </main>
    </div>
  );
}

export default function CursosSalonPage() {
  return (
    <ProtectedRoute requiredRole="DIRECTOR">
      <CursosSalonPageContent />
    </ProtectedRoute>
  );
}
