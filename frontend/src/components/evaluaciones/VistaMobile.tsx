"use client";

import { useState } from 'react';
import { DatosEvaluacion, Nota } from '@/types/evaluaciones';
import { PlusIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface VistaMobileProps {
  datos: DatosEvaluacion;
}

export default function VistaMobile({ datos }: VistaMobileProps) {
  const [notas, setNotas] = useState<Nota[]>(datos.notas);
  const [competenciaExpandida, setCompetenciaExpandida] = useState<number | null>(null);
  const [alumnosExpandidos, setAlumnosExpandidos] = useState(false);

  // Obtener nota de un alumno para una tarea específica
  const obtenerNota = (alumnoId: number, tareaId: number): number | null => {
    const nota = notas.find(n => n.alumnoId === alumnoId && n.tareaId === tareaId);
    return nota?.valor || null;
  };

  // Calcular promedio de un alumno
  const calcularPromedio = (alumnoId: number): number => {
    const notasAlumno = notas.filter(n => n.alumnoId === alumnoId && n.valor !== null);
    if (notasAlumno.length === 0) return 0;
    const suma = notasAlumno.reduce((acc, nota) => acc + (nota.valor || 0), 0);
    return Math.round((suma / notasAlumno.length) * 10) / 10;
  };

  // Calcular promedio por competencia
  const calcularPromedioCompetencia = (competenciaId: number): number => {
    const tareasCompetencia = datos.tareas.filter(t => t.competenciaId === competenciaId);
    const notasCompetencia = notas.filter(n => 
      tareasCompetencia.some(t => t.id === n.tareaId) && n.valor !== null
    );
    if (notasCompetencia.length === 0) return 0;
    const suma = notasCompetencia.reduce((acc, nota) => acc + (nota.valor || 0), 0);
    return Math.round((suma / notasCompetencia.length) * 10) / 10;
  };

  // Actualizar nota
  const actualizarNota = (alumnoId: number, tareaId: number, valor: number) => {
    setNotas(prev => {
      const existe = prev.find(n => n.alumnoId === alumnoId && n.tareaId === tareaId);
      if (existe) {
        return prev.map(n => 
          n.alumnoId === alumnoId && n.tareaId === tareaId 
            ? { ...n, valor } 
            : n
        );
      } else {
        return [...prev, { alumnoId, tareaId, valor }];
      }
    });
  };

  // Obtener color de rendimiento
  const getColorNota = (valor: number | null): string => {
    if (valor === null) return 'text-gray-400';
    if (valor >= 18) return 'text-green-600 font-semibold';
    if (valor >= 14) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          📚 {datos.curso.nombre} - {datos.curso.salon} {datos.curso.nivel}
        </h2>
        <p className="text-sm text-gray-600">🗓️ {datos.curso.periodo}</p>
        <p className="text-sm text-gray-500">👥 {datos.alumnos.length} alumnos registrados</p>
      </div>

      {/* Resumen por Competencias */}
      <div className="p-4 space-y-4">
        <h3 className="text-md font-medium text-gray-900">📊 RESUMEN POR COMPETENCIAS</h3>
        
        {datos.competencias.map(competencia => {
          const tareasCompetencia = datos.tareas.filter(t => t.competenciaId === competencia.id);
          const promedio = calcularPromedioCompetencia(competencia.id);
          
          return (
            <div key={competencia.id} className="border rounded-lg overflow-hidden">
              <div className={`p-3 ${competencia.color} text-white`}>
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h4 className="font-medium">{competencia.nombre}</h4>
                    <p className="text-sm opacity-90">
                      {tareasCompetencia.length} tareas | Promedio: {promedio.toFixed(1)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert(`Crear nueva tarea para ${competencia.nombre}`)}
                      className="bg-white bg-opacity-20 p-1 rounded"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCompetenciaExpandida(
                        competenciaExpandida === competencia.id ? null : competencia.id
                      )}
                      className="bg-white bg-opacity-20 p-1 rounded"
                    >
                      {competenciaExpandida === competencia.id ? 
                        <ChevronUpIcon className="w-4 h-4" /> : 
                        <ChevronDownIcon className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              </div>

              {/* Detalle de la competencia expandida */}
              {competenciaExpandida === competencia.id && (
                <div className="p-3 bg-gray-50">
                  <div className="space-y-3">
                    {datos.alumnos.map(alumno => {
                      const notasAlumno = tareasCompetencia.map(tarea => ({
                        tarea,
                        nota: obtenerNota(alumno.id, tarea.id)
                      }));
                      
                      return (
                        <div key={alumno.id} className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-900">
                              👤 {alumno.nombres} {alumno.apellidos}
                            </span>
                            <span className={`text-sm ${getColorNota(calcularPromedio(alumno.id))}`}>
                              Promedio: {calcularPromedio(alumno.id).toFixed(1)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            {notasAlumno.map(({ tarea, nota }) => (
                              <div key={tarea.id} className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">{tarea.nombre}:</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="20"
                                  value={nota || ''}
                                  onChange={(e) => {
                                    const valor = parseFloat(e.target.value);
                                    if (!isNaN(valor)) {
                                      actualizarNota(alumno.id, tarea.id, valor);
                                    }
                                  }}
                                  className={`w-16 text-center border rounded px-1 py-1 ${getColorNota(nota)}`}
                                  placeholder="-"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sección de Alumnos */}
      <div className="border-t">
        <button
          onClick={() => setAlumnosExpandidos(!alumnosExpandidos)}
          className="w-full p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium text-gray-900">👥 ALUMNOS ({datos.alumnos.length})</span>
          {alumnosExpandidos ? 
            <ChevronUpIcon className="w-5 h-5 text-gray-500" /> : 
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          }
        </button>

        {alumnosExpandidos && (
          <div className="p-4 space-y-3">
            {datos.alumnos.map(alumno => {
              const promedio = calcularPromedio(alumno.id);
              return (
                <div key={alumno.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium text-gray-900">
                      {alumno.nombres} {alumno.apellidos}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getColorNota(promedio)}`}>
                      {promedio.toFixed(1)}
                    </span>
                    {promedio >= 18 && <span>⭐</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botón Nueva Tarea Global */}
      <div className="p-4 border-t bg-gray-50">
        <button
          onClick={() => alert('Crear nueva tarea global')}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Nueva Tarea Global
        </button>
      </div>
    </div>
  );
}
