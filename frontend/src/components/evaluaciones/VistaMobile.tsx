"use client";

import { useState } from 'react';
import { ContextoTrabajo, CreateEvaluacionDto, Evaluacion } from '@/types/evaluaciones';
import { PlusIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ModalCrearEvaluacion from '../modals/ModalCrearEvaluacion';

interface VistaMobileRealProps {
  contexto: ContextoTrabajo;
  onCrearEvaluacion: (data: CreateEvaluacionDto) => Promise<Evaluacion>;
  asignacionId: number;
  periodoId: number;
}

export default function VistaMobileReal({ 
  contexto, 
  onCrearEvaluacion,
  asignacionId,
  periodoId
}: VistaMobileRealProps) {
  const [notas, setNotas] = useState<any[]>([]);
  const [editando, setEditando] = useState<string | null>(null);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [competenciaSeleccionada, setCompetenciaSeleccionada] = useState<number | null>(null);
  const [alumnoExpandido, setAlumnoExpandido] = useState<number | null>(null);

  // Obtener evaluaciones por competencia
  const obtenerEvaluacionesPorCompetencia = (competenciaId: number) => {
    return contexto.evaluaciones.filter(e => e.competenciaId === competenciaId);
  };

  // Obtener nota de un alumno para una evaluación específica
  const obtenerNota = (alumnoId: number, evaluacionId: number): number | null => {
    const nota = notas.find(n => n.alumnoId === alumnoId && n.evaluacionId === evaluacionId);
    return nota?.valor || null;
  };

  // Calcular promedio de un alumno
  const calcularPromedio = (alumnoId: number): number => {
    const notasAlumno = notas.filter(n => n.alumnoId === alumnoId && n.valor !== null);
    if (notasAlumno.length === 0) return 0;
    const suma = notasAlumno.reduce((acc, nota) => acc + (nota.valor || 0), 0);
    return Math.round((suma / notasAlumno.length) * 10) / 10;
  };

  // Actualizar nota
  const actualizarNota = (alumnoId: number, evaluacionId: number, valor: number) => {
    setNotas(prev => {
      const existe = prev.find(n => n.alumnoId === alumnoId && n.evaluacionId === evaluacionId);
      if (existe) {
        return prev.map(n => 
          n.alumnoId === alumnoId && n.evaluacionId === evaluacionId 
            ? { ...n, valor } 
            : n
        );
      } else {
        return [...prev, { alumnoId, evaluacionId, valor }];
      }
    });
  };

  // Manejar creación de nueva evaluación
  const handleCrearEvaluacion = (competenciaId: number) => {
    setCompetenciaSeleccionada(competenciaId);
    setModalCrearAbierto(true);
  };

  // Obtener color de rendimiento
  const getColorNota = (valor: number | null): string => {
    if (valor === null) return 'bg-gray-100 text-gray-400';
    if (valor >= 18) return 'bg-green-100 text-green-800';
    if (valor >= 14) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            📚 {contexto.asignacion.curso}
          </h2>
          <p className="text-sm text-gray-600">
            {contexto.asignacion.salon} | {contexto.periodo.nombre}
          </p>
          <div className="text-xs text-gray-500 mt-1">
            {contexto.alumnos.length} estudiantes • {contexto.competencias.length} competencias
          </div>
        </div>

        {/* Lista de alumnos */}
        <div className="divide-y divide-gray-200">
          {contexto.alumnos.map((alumno) => (
            <div key={alumno.id} className="p-4">
              {/* Header del alumno */}
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setAlumnoExpandido(
                  alumnoExpandido === alumno.id ? null : alumno.id
                )}
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {alumno.nombres} {alumno.apellidos}
                  </h3>
                  {alumno.dni && (
                    <p className="text-xs text-gray-500">DNI: {alumno.dni}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    calcularPromedio(alumno.id) >= 18 ? 'bg-green-100 text-green-800' :
                    calcularPromedio(alumno.id) >= 14 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {calcularPromedio(alumno.id).toFixed(1)}
                  </span>
                  {alumnoExpandido === alumno.id ? (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Evaluaciones expandidas */}
              {alumnoExpandido === alumno.id && (
                <div className="mt-4 space-y-4">
                  {contexto.competencias.map((competencia) => {
                    const evaluacionesCompetencia = obtenerEvaluacionesPorCompetencia(competencia.id);
                    return (
                      <div key={competencia.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            {competencia.nombre}
                          </h4>
                          <button
                            onClick={() => handleCrearEvaluacion(competencia.id)}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                            title="Agregar evaluación"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {evaluacionesCompetencia.map((evaluacion) => {
                            const nota = obtenerNota(alumno.id, evaluacion.id);
                            const key = `${alumno.id}-${evaluacion.id}`;
                            return (
                              <div key={evaluacion.id} className="text-center">
                                <div className="text-xs text-gray-600 mb-1">
                                  {evaluacion.nombre}
                                </div>
                                {editando === key ? (
                                  <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={nota || ''}
                                    onChange={(e) => {
                                      const valor = parseFloat(e.target.value);
                                      if (!isNaN(valor)) {
                                        actualizarNota(alumno.id, evaluacion.id, valor);
                                      }
                                    }}
                                    onBlur={() => setEditando(null)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') setEditando(null);
                                    }}
                                    className="w-full text-center text-sm border rounded px-2 py-1"
                                    autoFocus
                                  />
                                ) : (
                                  <button
                                    onClick={() => setEditando(key)}
                                    className={`w-full h-8 text-sm rounded transition-colors ${getColorNota(nota)}`}
                                  >
                                    {nota || '-'}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal para crear nueva evaluación */}
      <ModalCrearEvaluacion
        isOpen={modalCrearAbierto}
        onClose={() => {
          setModalCrearAbierto(false);
          setCompetenciaSeleccionada(null);
        }}
        competenciaId={competenciaSeleccionada}
        asignacionId={asignacionId}
        periodoId={periodoId}
        onCrearEvaluacion={onCrearEvaluacion}
      />
    </>
  );
}
