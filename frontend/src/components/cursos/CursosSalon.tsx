'use client';

import React, { useState, useEffect } from 'react';
import { SalonCurso, CursosSalonProps } from '@/types/curso';
import ListaCursos from './ListaCursos';

export default function CursosSalon({ salonId, salon, onRefresh }: CursosSalonProps) {
  const [cursos, setCursos] = useState<SalonCurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/salones/${salonId}/cursos`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setCursos(data.cursos || []);
    } catch (error) {
      console.error('Error al cargar cursos del salón:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCursos();
  }, [salonId]);

  const handleRefresh = () => {
    cargarCursos();
    onRefresh?.();
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Error al cargar cursos</h4>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información del salón */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Cursos del Salón {salon.grado} {salon.seccion}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Nivel: {salon.nivel}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {cursos.length} {cursos.length === 1 ? 'curso' : 'cursos'}
              </span>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium border border-gray-300 transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 mr-2 inline ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      {/* Lista de cursos */}
      <ListaCursos
        cursos={cursos}
        loading={loading}
        mostrarCompetencias={true}
        onCursoClick={(curso) => {
          console.log('Curso seleccionado:', curso);
          // Aquí se puede implementar navegación a detalle del curso
        }}
      />

      {/* Información adicional */}
      {!loading && cursos.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Asignación Automática de Cursos
              </h4>
              <p className="text-sm text-blue-700">
                Estos cursos fueron asignados automáticamente al crear el salón, basándose en el nivel educativo <strong>{salon.nivel}</strong>. 
                Todos los alumnos que se asignen a este salón heredarán automáticamente estos cursos.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
