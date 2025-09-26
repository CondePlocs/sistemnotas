'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import CursosAlumno from '@/components/cursos/CursosAlumno';

function CursosAlumnoPageContent() {
  const params = useParams();
  const router = useRouter();
  const alumnoId = parseInt(params.id as string);
  // En una implementación real, estos datos vendrían de una API
  // Por ahora usamos datos de ejemplo
  const alumno = {
    id: alumnoId,
    nombres: 'Juan Carlos',
    apellidos: 'Pérez García'
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Cursos del Alumno
              </h1>
              <p className="text-sm text-gray-600">
                Visualiza los cursos asignados automáticamente al alumno
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CursosAlumno
          alumnoId={alumnoId}
          alumno={alumno}
          onRefresh={() => {
            console.log('Refrescando datos...');
          }}
        />
      </main>
    </div>
  );
}

export default function CursosAlumnoPage() {
  return (
    <ProtectedRoute requiredRole="DIRECTOR">
      <CursosAlumnoPageContent />
    </ProtectedRoute>
  );
}
