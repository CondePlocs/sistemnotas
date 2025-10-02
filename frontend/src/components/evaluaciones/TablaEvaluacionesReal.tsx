"use client";

import { useState } from 'react';
import { ContextoTrabajo, CreateEvaluacionDto, Evaluacion } from '@/types/evaluaciones';
import { PlusIcon } from '@heroicons/react/24/outline';
import ModalCrearEvaluacion from '../modals/ModalCrearEvaluacion';

interface TablaEvaluacionesRealProps {
  contexto: ContextoTrabajo;
  onCrearEvaluacion: (data: CreateEvaluacionDto) => Promise<Evaluacion>;
  asignacionId: number;
  periodoId: number;
}

export default function TablaEvaluacionesReal({ 
  contexto, 
  onCrearEvaluacion,
  asignacionId,
  periodoId
}: TablaEvaluacionesRealProps) {
  const [notas, setNotas] = useState<any[]>([]);
  const [editando, setEditando] = useState<string | null>(null);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [competenciaSeleccionada, setCompetenciaSeleccionada] = useState<number | null>(null);

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
        {/* Header - SIN botón "Nueva Tarea Global" */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                📚 {contexto.asignacion.curso} - {contexto.asignacion.salon}
              </h2>
              <p className="text-sm text-gray-600">🗓️ {contexto.periodo.nombre} - {contexto.periodo.anioAcademico}</p>
            </div>
            <div className="text-sm text-gray-500">
              {contexto.alumnos.length} estudiantes • {contexto.competencias.length} competencias
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-r">
                  ALUMNO
                </th>
                {contexto.competencias.map(competencia => {
                  const evaluacionesCompetencia = obtenerEvaluacionesPorCompetencia(competencia.id);
                  return (
                    <th key={competencia.id} className="border-r">
                      <div className="px-2 py-3">
                        <div className="text-center text-sm font-medium text-white px-3 py-1 rounded bg-blue-600">
                          {competencia.nombre}
                        </div>
                        <div className="flex mt-2">
                          {evaluacionesCompetencia.map(evaluacion => (
                            <div key={evaluacion.id} className="flex-1 px-1">
                              <div className="text-xs text-gray-600 text-center border-r last:border-r-0">
                                {evaluacion.nombre}
                              </div>
                            </div>
                          ))}
                          <div className="w-8 flex justify-center">
                            <button
                              onClick={() => handleCrearEvaluacion(competencia.id)}
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="Agregar evaluación"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </th>
                  );
                })}
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                  PROMEDIO
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contexto.alumnos.map(alumno => (
                <tr key={alumno.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-r">
                    <div className="text-sm font-medium text-gray-900">
                      {alumno.nombres} {alumno.apellidos}
                    </div>
                    {alumno.dni && (
                      <div className="text-xs text-gray-500">
                        DNI: {alumno.dni}
                      </div>
                    )}
                  </td>
                  {contexto.competencias.map(competencia => {
                    const evaluacionesCompetencia = obtenerEvaluacionesPorCompetencia(competencia.id);
                    return (
                      <td key={competencia.id} className="border-r">
                        <div className="flex">
                          {evaluacionesCompetencia.map(evaluacion => {
                            const nota = obtenerNota(alumno.id, evaluacion.id);
                            const key = `${alumno.id}-${evaluacion.id}`;
                            return (
                              <div key={evaluacion.id} className="flex-1 px-1 py-2">
                                <div className="text-center border-r last:border-r-0">
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
                                      className="w-12 text-center text-sm border rounded px-1"
                                      autoFocus
                                    />
                                  ) : (
                                    <button
                                      onClick={() => setEditando(key)}
                                      className={`w-12 h-8 text-sm rounded transition-colors ${getColorNota(nota)}`}
                                    >
                                      {nota || '-'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          <div className="w-8"></div>
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      calcularPromedio(alumno.id) >= 18 ? 'bg-green-100 text-green-800' :
                      calcularPromedio(alumno.id) >= 14 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {calcularPromedio(alumno.id).toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
