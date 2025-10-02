"use client";

import { useState, useEffect } from 'react';
import { ContextoTrabajo, CreateEvaluacionDto, Evaluacion } from '@/types/evaluaciones';
import { NotaLiteral } from '@/types/registro-nota';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useNotasState } from '@/hooks/useNotasState';
import ModalCrearEvaluacion from '../modals/ModalCrearEvaluacion';
import BotonGuardarNotas from './BotonGuardarNotas';
import { registroNotaAPI } from '@/lib/api/registro-nota';

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
  const [editando, setEditando] = useState<string | null>(null);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [competenciaSeleccionada, setCompetenciaSeleccionada] = useState<number | null>(null);

  // Hook para gestionar estado de notas
  const {
    obtenerNota,
    actualizarNota,
    establecerNotasIniciales,
    guardarNotas,
    descartarCambios,
    hayCambiosPendientes,
    cantidadPendientes,
    guardando
  } = useNotasState({
    alumnos: contexto.alumnos,
    evaluaciones: contexto.evaluaciones
  });

  // Función para cargar notas desde la API
  const cargarNotasExistentes = async () => {
    try {
      console.log('Cargando notas para asignación:', asignacionId, 'período:', periodoId);
      const notasExistentes = await registroNotaAPI.obtenerNotasPorContexto(asignacionId, periodoId);
      console.log('Notas cargadas:', notasExistentes);
      
      // Convertir las notas del backend al formato esperado por el hook
      const notasFormateadas = notasExistentes.map(nota => ({
        alumnoId: nota.alumnoId,
        evaluacionId: nota.evaluacionId,
        nota: nota.nota as NotaLiteral
      }));
      
      establecerNotasIniciales(notasFormateadas);
    } catch (error) {
      console.error('Error al cargar notas existentes:', error);
      // Si hay error, establecer notas vacías
      establecerNotasIniciales([]);
    }
  };

  // Cargar notas iniciales desde la API
  useEffect(() => {
    cargarNotasExistentes();
  }, [asignacionId, periodoId]);

  // Función personalizada para guardar y recargar notas
  const guardarYRecargarNotas = async () => {
    const resultado = await guardarNotas();
    
    if (resultado.success) {
      // Recargar notas después de guardar exitosamente
      await cargarNotasExistentes();
      // Recargar promedios después de guardar
      await cargarPromediosCompetencias();
      await cargarPromediosCurso();
    }
    
    return resultado;
  };

  // Cargar promedios cuando se cargan las notas iniciales
  useEffect(() => {
    if (contexto.alumnos.length > 0 && contexto.competencias.length > 0) {
      cargarPromediosCompetencias();
      cargarPromediosCurso();
    }
  }, [contexto.alumnos, contexto.competencias, periodoId]);


  // Obtener evaluaciones por competencia
  const obtenerEvaluacionesPorCompetencia = (competenciaId: number) => {
    return contexto.evaluaciones.filter(e => e.competenciaId === competenciaId);
  };

  // Estados para promedios
  const [promediosCompetencia, setPromediosCompetencia] = useState<Map<string, string>>(new Map());
  const [promediosCurso, setPromediosCurso] = useState<Map<number, string>>(new Map());

  // Calcular promedio de un alumno por competencia
  const calcularPromedioCompetencia = (alumnoId: number, competenciaId: number): string => {
    const clave = `${alumnoId}-${competenciaId}`;
    return promediosCompetencia.get(clave) || '-';
  };

  // Calcular promedio general de un alumno (promedio del curso)
  const calcularPromedio = (alumnoId: number): string => {
    return promediosCurso.get(alumnoId) || '-';
  };

  // Cargar promedios de competencias
  const cargarPromediosCompetencias = async () => {
    const nuevosPromedios = new Map<string, string>();
    
    for (const alumno of contexto.alumnos) {
      for (const competencia of contexto.competencias) {
        try {
          const promedio = await registroNotaAPI.calcularPromedioCompetencia(
            alumno.id, 
            competencia.id, 
            periodoId
          );
          const clave = `${alumno.id}-${competencia.id}`;
          nuevosPromedios.set(clave, promedio.propuestaLiteral);
        } catch (error) {
          // Si no hay notas o hay error, mantener '-'
          const clave = `${alumno.id}-${competencia.id}`;
          nuevosPromedios.set(clave, '-');
        }
      }
    }
    
    setPromediosCompetencia(nuevosPromedios);
  };

  // Cargar promedios de curso
  const cargarPromediosCurso = async () => {
    const nuevosPromedios = new Map<number, string>();
    
    for (const alumno of contexto.alumnos) {
      try {
        // Obtener cursoId desde la primera competencia
        const cursoId = contexto.competencias[0]?.cursoId;
        if (!cursoId) return;
        
        const promedio = await registroNotaAPI.calcularPromedioCurso(
          alumno.id, 
          cursoId, 
          periodoId
        );
        nuevosPromedios.set(alumno.id, promedio.propuestaLiteral);
      } catch (error) {
        // Si no hay notas o hay error, mantener '-'
        nuevosPromedios.set(alumno.id, '-');
      }
    }
    
    setPromediosCurso(nuevosPromedios);
  };

  // Validar que la nota sea una letra válida
  const esNotaValida = (nota: string): nota is NotaLiteral => {
    return ['AD', 'A', 'B', 'C'].includes(nota);
  };

  // Manejar cambio de nota
  const manejarCambioNota = (alumnoId: number, evaluacionId: number, valor: string) => {
    if (valor === '' || valor === null) {
      actualizarNota(alumnoId, evaluacionId, null);
    } else if (esNotaValida(valor)) {
      actualizarNota(alumnoId, evaluacionId, valor);
    }
    // Si no es válida, no hacer nada (el input no se actualiza)
  };

  // Manejar creación de nueva evaluación
  const handleCrearEvaluacion = (competenciaId: number) => {
    setCompetenciaSeleccionada(competenciaId);
    setModalCrearAbierto(true);
  };

  // Obtener color de rendimiento para notas literales
  const getColorNota = (nota: NotaLiteral | null): string => {
    if (nota === null) return 'bg-gray-100 text-gray-400';
    switch (nota) {
      case 'AD': return 'bg-green-100 text-green-800';
      case 'A': return 'bg-blue-100 text-blue-800';
      case 'B': return 'bg-yellow-100 text-yellow-800';
      case 'C': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  return (
    <>
      {/* Botón Guardar Notas */}
      <BotonGuardarNotas
        hayCambiosPendientes={hayCambiosPendientes}
        cantidadPendientes={cantidadPendientes}
        guardando={guardando}
        onGuardar={guardarYRecargarNotas}
        onDescartar={descartarCambios}
      />

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Header - SIN botón "Nueva Tarea Global" */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                📚 {contexto.asignacion.curso} - {contexto.asignacion.salon}
              </h2>
              <p className="text-sm text-gray-600">🗓️ {contexto.periodo.tipo} {contexto.periodo.nombre} - {contexto.periodo.anioAcademico}</p>
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
                          <div className="w-16 px-1">
                            <div className="text-xs text-gray-600 text-center font-medium">
                              Promedio
                            </div>
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
                                      type="text"
                                      value={nota || ''}
                                      onChange={(e) => {
                                        const valor = e.target.value.toUpperCase();
                                        manejarCambioNota(alumno.id, evaluacion.id, valor);
                                      }}
                                      onBlur={() => setEditando(null)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') setEditando(null);
                                      }}
                                      className="w-12 text-center text-sm border rounded px-1"
                                      placeholder="AD,A,B,C"
                                      maxLength={2}
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
                          <div className="w-16 px-1 py-2">
                            <div className="text-center">
                              <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                {calcularPromedioCompetencia(alumno.id, competencia.id)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      {calcularPromedio(alumno.id)}
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
