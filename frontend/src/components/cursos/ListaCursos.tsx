'use client';

import React from 'react';
import { SalonCurso, obtenerColorCurso } from '@/types/curso';

interface ListaCursosProps {
  cursos: SalonCurso[];
  loading?: boolean;
  titulo?: string;
  mostrarCompetencias?: boolean;
  onCursoClick?: (curso: SalonCurso) => void;
}

export default function ListaCursos({
  cursos,
  loading = false,
  titulo,
  mostrarCompetencias = true,
  onCursoClick
}: ListaCursosProps) {
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (cursos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        {titulo && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{titulo}</h3>
        )}
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Sin cursos asignados
          </h4>
          <p className="text-gray-500">
            Este salón aún no tiene cursos asignados.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {titulo && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
            {cursos.length} {cursos.length === 1 ? 'curso' : 'cursos'}
          </span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cursos.map((curso) => (
          <div
            key={curso.id}
            className={`border rounded-lg p-4 transition-all duration-200 ${
              onCursoClick 
                ? 'cursor-pointer hover:shadow-md hover:border-blue-300' 
                : ''
            }`}
            onClick={() => onCursoClick?.(curso)}
          >
            {/* Header del curso */}
            <div className="flex items-center mb-3">
              <div
                className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                style={{ backgroundColor: obtenerColorCurso(curso.curso.color) }}
              ></div>
              <h4 className="font-medium text-gray-900 truncate">
                {curso.curso.nombre}
              </h4>
            </div>


            {/* Competencias */}
            {mostrarCompetencias && curso.curso.competencias && curso.curso.competencias.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">Competencias:</p>
                <div className="space-y-1">
                  {curso.curso.competencias.slice(0, 3).map((competencia) => (
                    <div key={competencia.id} className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {competencia.nombre}
                      </p>
                    </div>
                  ))}
                  {curso.curso.competencias.length > 3 && (
                    <p className="text-xs text-gray-500 ml-3.5">
                      +{curso.curso.competencias.length - 3} más...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Footer con fecha de asignación */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
              <span>
                {curso.asignadoPor ? 'Asignado manualmente' : 'Asignado automáticamente'}
              </span>
              <span>
                {new Date(curso.asignadoEn).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit'
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Cursos asignados automáticamente por nivel educativo
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            <span>Activos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
