"use client";

import { useState, useEffect } from 'react';
import { ContextoTrabajo, CreateEvaluacionDto, Evaluacion } from '@/types/evaluaciones';
import { NotaLiteral } from '@/types/registro-nota';
import { PlusIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useNotasState } from '@/hooks/useNotasState';
import ModalCrearEvaluacion from '../modals/ModalCrearEvaluacion';
import BotonGuardarNotas from './BotonGuardarNotas';
import { registroNotaAPI } from '@/lib/api/registro-nota';

interface VistaMobileProps {
  contexto: ContextoTrabajo;
  onCrearEvaluacion: (data: CreateEvaluacionDto) => Promise<Evaluacion>;
  asignacionId: number;
  periodoId: number;
}

export default function VistaMobile({ 
  contexto, 
  onCrearEvaluacion,
  asignacionId,
  periodoId
}: VistaMobileProps) {
  const [editando, setEditando] = useState<string | null>(null);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [competenciaSeleccionada, setCompetenciaSeleccionada] = useState<number | null>(null);
  const [alumnoExpandido, setAlumnoExpandido] = useState<number | null>(null);

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

  // Estados para promedios
  const [promediosCompetencia, setPromediosCompetencia] = useState<Map<string, string>>(new Map());
  const [promediosCurso, setPromediosCurso] = useState<Map<number, string>>(new Map());

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

  // Calcular promedio de un alumno por competencia
  const calcularPromedioCompetencia = (alumnoId: number, competenciaId: number): string => {
    const clave = `${alumnoId}-${competenciaId}`;
    return promediosCompetencia.get(clave) || '-';
  };

  // Calcular promedio general de un alumno (promedio del curso)
  const calcularPromedio = (alumnoId: number): string => {
    return promediosCurso.get(alumnoId) || '-';
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
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            📚 {contexto.asignacion.curso}
          </h2>
          <p className="text-sm text-gray-600">
            {contexto.asignacion.salon} | {contexto.periodo.tipo} {contexto.periodo.nombre} - {contexto.periodo.anioAcademico}
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
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {calcularPromedio(alumno.id)}
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
                                    className="w-full text-center text-sm border rounded px-2 py-1"
                                    placeholder="AD,A,B,C"
                                    maxLength={2}
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
                        
                        {/* Promedio de la competencia */}
                        <div className="mt-3 pt-2 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-600">Promedio:</span>
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {calcularPromedioCompetencia(alumno.id, competencia.id)}
                            </span>
                          </div>
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
