"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

function OwnerDashboardContent() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Owner</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Bienvenido, {user?.nombres || user?.email}
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card: Registrar Owner */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Nuevo Owner</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Registrar un nuevo usuario con rol de Owner en el sistema.
            </p>
            <Link 
              href="/owner/registro"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-block text-center"
            >
              Registrar Owner
            </Link>
          </div>

          {/* Card: Gestionar Directores */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Directores</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Registrar nuevos directores para los colegios.
            </p>
            <Link 
              href="/owner/directores/nuevo"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-block text-center"
            >
              Registrar Director
            </Link>
          </div>

          {/* Card: Gestionar Colegios */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Colegios</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Registrar nuevas instituciones educativas.
            </p>
            <Link 
              href="/owner/colegios/nuevo"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-block text-center"
            >
              Registrar Colegio
            </Link>
          </div>

          {/* Card: Gestionar Cursos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Cursos</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Crear y gestionar cursos con sus competencias.
            </p>
            <div className="space-y-2">
              <Link 
                href="/owner/cursos/nuevo"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-block text-center"
              >
                Crear Curso
              </Link>
              <Link 
                href="/owner/cursos"
                className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium py-2 px-4 rounded-md transition-colors inline-block text-center border border-orange-300"
              >
                Ver Todos los Cursos
              </Link>
            </div>
          </div>

        </div>

        {/* Stats Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Owners</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Directores</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Colegios</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-sm text-gray-600">Cursos</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">0</div>
            <div className="text-sm text-gray-600">Usuarios Total</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OwnerDashboard() {
  return (
    <ProtectedRoute requiredRole="OWNER">
      <OwnerDashboardContent />
    </ProtectedRoute>
  );
}
