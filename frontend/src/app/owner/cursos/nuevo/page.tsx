"use client";

import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import FormularioCurso from '@/components/forms/FormularioCurso';

function NuevoCursoContent() {
  const router = useRouter();

  const handleSuccess = (curso: any) => {
    // Mostrar mensaje de éxito
    alert(`Curso "${curso.nombre}" creado exitosamente con ${curso.competencias?.length || 0} competencias`);
    
    // Redirigir al dashboard o lista de cursos
    router.push('/owner/dashboard');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Curso</h1>
              <p className="text-sm text-gray-600 mt-1">
                Define un curso con sus competencias para que los colegios puedan utilizarlo
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FormularioCurso 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          modo="crear"
        />
      </main>
    </div>
  );
}

export default function NuevoCurso() {
  return (
    <ProtectedRoute requiredRole="OWNER">
      <NuevoCursoContent />
    </ProtectedRoute>
  );
}
