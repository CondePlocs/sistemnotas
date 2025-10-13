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

  // Obtener color de rendimiento para notas literales (versión mejorada)
  const getColorNotaMejorado = (nota: NotaLiteral | null): string => {
    if (nota === null) return 'bg-white/80 text-[#666666] border-[#E9E1C9] hover:bg-[#FCE0C1] hover:border-[#8D2C1D]';
    switch (nota) {
      case 'AD': return 'bg-gradient-to-br from-green-400 to-green-500 text-white border-green-500 hover:from-green-500 hover:to-green-600';
      case 'A': return 'bg-gradient-to-br from-blue-400 to-blue-500 text-white border-blue-500 hover:from-blue-500 hover:to-blue-600';
      case 'B': return 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white border-yellow-500 hover:from-yellow-500 hover:to-yellow-600';
      case 'C': return 'bg-gradient-to-br from-red-400 to-red-500 text-white border-red-500 hover:from-red-500 hover:to-red-600';
      default: return 'bg-white/80 text-[#666666] border-[#E9E1C9] hover:bg-[#FCE0C1] hover:border-[#8D2C1D]';
    }
  };

  // Obtener color para promedios de competencia
  const getColorPromedio = (promedio: string): string => {
    if (promedio === '-') return 'bg-gray-100 text-gray-500 border border-gray-200';
    switch (promedio) {
      case 'AD': return 'bg-gradient-to-br from-green-100 to-green-200 text-green-800 border border-green-300';
      case 'A': return 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 border border-blue-300';
      case 'B': return 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300';
      case 'C': return 'bg-gradient-to-br from-red-100 to-red-200 text-red-800 border border-red-300';
      default: return 'bg-gray-100 text-gray-500 border border-gray-200';
    }
  };

  // Obtener color para promedio final
  const getColorPromedioFinal = (promedio: string): string => {
    if (promedio === '-') return 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600 border-2 border-gray-400';
    switch (promedio) {
      case 'AD': return 'bg-gradient-to-br from-green-400 to-green-600 text-white border-2 border-green-600';
      case 'A': return 'bg-gradient-to-br from-blue-400 to-blue-600 text-white border-2 border-blue-600';
      case 'B': return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white border-2 border-yellow-600';
      case 'C': return 'bg-gradient-to-br from-red-400 to-red-600 text-white border-2 border-red-600';
      default: return 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600 border-2 border-gray-400';
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

      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border-2 border-[#E9E1C9] overflow-hidden">
        {/* Header mejorado con paleta corporativa */}
        <div className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                📚 {contexto.asignacion.curso} - {contexto.asignacion.salon}
              </h2>
              <p className="text-[#FCE0C1] text-sm font-medium">
                🗺️ {contexto.periodo.tipo} {contexto.periodo.nombre} - {contexto.periodo.anioAcademico}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-white text-sm font-semibold text-center">
                <div>{contexto.alumnos.length} estudiantes</div>
                <div>{contexto.competencias.length} competencias</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla mejorada */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9]">
                <th className="px-6 py-4 text-left text-sm font-bold text-[#8D2C1D] border-r border-[#E9E1C9] sticky left-0 bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9] z-10">
                  👥 ESTUDIANTE
                </th>
                {contexto.competencias.map(competencia => {
                  const evaluacionesCompetencia = obtenerEvaluacionesPorCompetencia(competencia.id);
                  return (
                    <th key={competencia.id} className="border-r border-[#E9E1C9] min-w-[200px]">
                      <div className="px-3 py-4">
                        <div className="text-center text-sm font-bold text-white px-4 py-2 rounded-xl bg-gradient-to-r from-[#8D2C1D] to-[#D96924] shadow-lg mb-3">
                          🎯 {competencia.nombre}
                        </div>
                        <div className="flex items-center gap-1">
                          {evaluacionesCompetencia.map(evaluacion => (
                            <div key={evaluacion.id} className="flex-1 min-w-[60px]">
                              <div className="text-xs text-[#666666] text-center font-semibold p-2 bg-white/50 rounded-lg border border-[#E9E1C9]">
                                {evaluacion.nombre}
                              </div>
                            </div>
                          ))}
                          <div className="w-10 flex justify-center">
                            <button
                              onClick={() => handleCrearEvaluacion(competencia.id)}
                              className="text-[#8D2C1D] hover:text-[#7A2518] hover:bg-[#FCE0C1] p-2 rounded-lg transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
                              title="Agregar evaluación"
                            >
                              <PlusIcon className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="w-20">
                            <div className="text-xs text-[#8D2C1D] text-center font-bold bg-white/70 rounded-lg p-2 border border-[#E9E1C9]">
                              📈 Promedio
                            </div>
                          </div>
                        </div>
                      </div>
                    </th>
                  );
                })}
                <th className="px-6 py-4 text-center text-sm font-bold text-[#8D2C1D] bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9] sticky right-0 z-10">
                  🏆 PROMEDIO FINAL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E1C9]">
              {contexto.alumnos.map((alumno, index) => (
                <tr key={alumno.id} className={`hover:bg-[#FCE0C1]/30 transition-all duration-300 ${
                  index % 2 === 0 ? 'bg-white/50' : 'bg-[#FCE0C1]/10'
                }`}>
                  <td className="px-6 py-4 border-r border-[#E9E1C9] sticky left-0 z-10 bg-inherit">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#8D2C1D] to-[#D96924] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {alumno.nombres.charAt(0)}{alumno.apellidos.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#333333]">
                          {alumno.nombres} {alumno.apellidos}
                        </div>
                        {alumno.dni && (
                          <div className="text-xs text-[#666666] font-medium">
                            🎫 DNI: {alumno.dni}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {contexto.competencias.map(competencia => {
                    const evaluacionesCompetencia = obtenerEvaluacionesPorCompetencia(competencia.id);
                    return (
                      <td key={competencia.id} className="border-r border-[#E9E1C9] p-2">
                        <div className="flex items-center gap-1">
                          {evaluacionesCompetencia.map(evaluacion => {
                            const nota = obtenerNota(alumno.id, evaluacion.id);
                            const key = `${alumno.id}-${evaluacion.id}`;
                            return (
                              <div key={evaluacion.id} className="flex-1 min-w-[60px]">
                                <div className="text-center">
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
                                      className="w-full text-center text-sm border-2 border-[#8D2C1D] rounded-lg px-2 py-1 font-bold focus:ring-2 focus:ring-[#8D2C1D]"
                                      placeholder="AD,A,B,C"
                                      maxLength={2}
                                      autoFocus
                                    />
                                  ) : (
                                    <button
                                      onClick={() => setEditando(key)}
                                      className={`w-full h-10 text-sm font-bold rounded-lg transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md border-2 ${getColorNotaMejorado(nota)}`}
                                    >
                                      {nota || '➕'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          <div className="w-10"></div>
                          <div className="w-20">
                            <div className="text-center">
                              <span className={`px-3 py-2 rounded-lg text-xs font-bold shadow-sm ${getColorPromedio(calcularPromedioCompetencia(alumno.id, competencia.id))}`}>
                                {calcularPromedioCompetencia(alumno.id, competencia.id)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 text-center border-l-2 border-[#8D2C1D] sticky right-0 z-10 bg-inherit">
                    <div className="flex items-center justify-center">
                      <span className={`px-4 py-3 rounded-xl text-sm font-bold shadow-lg ${getColorPromedioFinal(calcularPromedio(alumno.id))}`}>
                        🏆 {calcularPromedio(alumno.id)}
                      </span>
                    </div>
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
