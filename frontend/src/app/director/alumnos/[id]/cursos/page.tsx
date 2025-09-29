'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

function CursosAlumnoPageContent() {
  const params = useParams();
  const { user } = useAuth();
  const alumnoId = params.id as string;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Cursos del Alumno
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Visualiza los cursos asignados al alumno ID: {alumnoId}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Funcionalidad en desarrollo
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              La visualización de cursos por alumno estará disponible próximamente.
            </p>
            <p className="mt-2 text-xs text-blue-600">
              Nota: Los alumnos heredan automáticamente los cursos de su salón asignado.
            </p>
          </div>
        </div>
      </div>
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
