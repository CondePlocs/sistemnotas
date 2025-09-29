'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import ModalPeriodoAcademico from '@/components/modals/ModalPeriodoAcademico';
import { 
  PeriodoAcademico, 
  PeriodoAcademicoFormData, 
  ListaPeriodosResponse,
  PeriodoAcademicoResponse 
} from '@/types/periodo-academico';
import { PlusIcon, CalendarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

function PeriodosAcademicosContent() {
  const router = useRouter();
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar períodos
  const cargarPeriodos = async () => {
    try {
      const response = await fetch('/api/periodos-academicos', {
        credentials: 'include'
      });

      if (response.ok) {
        const data: ListaPeriodosResponse = await response.json();
        setPeriodos(data.data.periodos);
      } else {
        setError('Error al cargar períodos académicos');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPeriodos();
  }, []);

  // Crear período
  const handleCrearPeriodo = async (formData: PeriodoAcademicoFormData) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/periodos-academicos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data: PeriodoAcademicoResponse = await response.json();
        setPeriodos(prev => [data.data, ...prev]);
        setModalOpen(false);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al crear período académico');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  // Activar período
  const handleActivarPeriodo = async (periodoId: number) => {
    try {
      const response = await fetch(`/api/periodos-academicos/${periodoId}/activar`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        // Actualizar estado local
        setPeriodos(prev => prev.map(p => ({
          ...p,
          activo: p.id === periodoId
        })));
      } else {
        setError('Error al activar período');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando períodos académicos...</p>
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
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                ← Volver
              </button>
              <CalendarIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Períodos Académicos</h1>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Agregar Período
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Períodos List */}
        {periodos.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay períodos académicos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando tu primer período académico.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center mx-auto"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Agregar Período
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {periodos.map((periodo) => (
              <div
                key={periodo.id}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  periodo.activo ? 'border-green-500' : 'border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {periodo.nombre}
                  </h3>
                  {periodo.activo && (
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  )}
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Tipo:</span> {periodo.tipo}</p>
                  <p><span className="font-medium">Año:</span> {periodo.anioAcademico}</p>
                  <p><span className="font-medium">Orden:</span> {['I', 'II', 'III', 'IV', 'V', 'VI'][periodo.orden - 1]}</p>
                  <p><span className="font-medium">Inicio:</span> {new Date(periodo.fechaInicio).toLocaleDateString()}</p>
                  <p><span className="font-medium">Fin:</span> {new Date(periodo.fechaFin).toLocaleDateString()}</p>
                </div>

                {!periodo.activo && (
                  <button
                    onClick={() => handleActivarPeriodo(periodo.id)}
                    className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm transition-colors"
                  >
                    Activar Período
                  </button>
                )}

                {periodo.activo && (
                  <div className="mt-4 w-full bg-green-100 text-green-800 py-2 px-4 rounded-md text-sm text-center font-medium">
                    Período Activo
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      <ModalPeriodoAcademico
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCrearPeriodo}
        loading={submitting}
      />
    </div>
  );
}

export default function PeriodosAcademicosPage() {
  return (
    <ProtectedRoute requiredRole="DIRECTOR">
      <PeriodosAcademicosContent />
    </ProtectedRoute>
  );
}
