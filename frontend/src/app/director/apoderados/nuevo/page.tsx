"use client";

import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import FormularioApoderado from '@/components/forms/FormularioApoderado';

function NuevoApoderadoContent() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/director/dashboard');
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Nuevo Apoderado</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <FormularioApoderado 
            onSuccess={handleSuccess}
            redirectPath="/director/dashboard"
          />
        </div>
      </main>
    </div>
  );
}

export default function NuevoApoderado() {
  return (
    <ProtectedRoute requiredRole="DIRECTOR">
      <NuevoApoderadoContent />
    </ProtectedRoute>
  );
}
