"use client";

import { useState, useEffect, useMemo } from 'react';
import { ContextoTrabajo, CreateEvaluacionDto, Evaluacion } from '@/types/evaluaciones';
import { NotaLiteral, NotaInput } from '@/types/registro-nota';
import { PlusIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useNotasState } from '@/hooks/useNotasState';
import { useEstimacionesIA } from '@/hooks/useEstimacionesIA';
import { EstimacionUtils } from '@/types/ia';
import ModalCrearEvaluacion from '../modals/ModalCrearEvaluacion';
import BotonGuardarNotas from './BotonGuardarNotas';
import FiltroAlumnos from './FiltroAlumnos';
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
  const [alumnosFiltrados, setAlumnosFiltrados] = useState(contexto.alumnos);

  // Hook para gestionar estado de notas
  const {
    obtenerNota,
    actualizarNota,
    establecerNotasIniciales,
    guardarNotas,
    descartarCambios,
    hayCambiosPendientes,
    cantidadPendientes,
    guardando,
    todasLasNotas
  } = useNotasState({
    alumnos: contexto.alumnos,
    evaluaciones: contexto.evaluaciones
  });

  // Convertir notas a Map para el hook de estimaciones
  const notasExistentesMap = useMemo(() => {
    const mapa = new Map<string, NotaLiteral>();
    todasLasNotas.forEach((nota: any) => {
      if (nota.nota) {
        const clave = EstimacionUtils.generarClave(nota.alumnoId, nota.evaluacionId);
        mapa.set(clave, nota.nota);
      }
    });
    return mapa;
  }, [todasLasNotas]);

  // Hook para gestionar estimaciones de IA
  const {
    obtenerEstimacion,
    tieneEstimacion,
    cargando: cargandoEstimaciones,
    totalEstimaciones
  } = useEstimacionesIA({
    alumnos: contexto.alumnos,
    competencias: contexto.competencias,
    evaluaciones: contexto.evaluaciones,
    notasExistentes: notasExistentesMap,
    profesorAsignacionId: asignacionId
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
        nota: nota.nota as NotaInput // Ahora acepta tanto letras como números
      }));
      
      establecerNotasIniciales(notasFormateadas);
    } catch (error) {
      console.error('Error al cargar notas existentes:', error);
      // Si hay error, establecer notas vacías
      establecerNotasIniciales([]);
    }
  };

  // Actualizar alumnos filtrados cuando cambie el contexto
  useEffect(() => {
    setAlumnosFiltrados(contexto.alumnos);
  }, [contexto.alumnos]);

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

  // Validar que la nota sea válida (alfabética o numérica)
  const esNotaValida = (nota: string): boolean => {
    if (!nota || typeof nota !== 'string') {
      return false;
    }

    const notaLimpia = nota.trim().toUpperCase();
    
    // Verificar si es alfabético (AD, A, B, C)
    const esAlfabetico = /^(AD|A|B|C)$/i.test(notaLimpia);
    if (esAlfabetico) {
      return true;
    }
    
    // Verificar si es numérico (0-20, incluyendo decimales)
    const esNumerico = /^\d+(\.\d+)?$/.test(notaLimpia);
    if (esNumerico) {
      const valor = parseFloat(notaLimpia);
      return valor >= 0 && valor <= 20;
    }
    
    return false;
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

  // Obtener color de rendimiento para notas (versión mejorada) - acepta letras y números
  const getColorNotaMejorado = (nota: string | null, esEstimacion: boolean = false): string => {
    // Convertir nota numérica a equivalente alfabético para colores
    const convertirALetra = (valor: string): NotaLiteral | null => {
      // Si ya es una letra, devolverla
      if (['AD', 'A', 'B', 'C'].includes(valor)) {
        return valor as NotaLiteral;
      }
      
      // Si es un número, convertir a letra equivalente
      const num = parseFloat(valor);
      if (!isNaN(num)) {
        if (num >= 18) return 'AD';
        if (num >= 14) return 'A';
        if (num >= 11) return 'B';
        return 'C';
      }
      
      return null;
    };

    if (!nota) {
      return 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 border-2 border-gray-300';
    }

    const letraEquivalente = convertirALetra(nota);
    const baseClasses = esEstimacion ? 'border-2 border-dashed' : 'border-2';
    
    switch (letraEquivalente) {
      case 'AD': return `bg-gradient-to-br from-emerald-400 to-green-500 text-white ${baseClasses} border-emerald-600`;
      case 'A': return `bg-gradient-to-br from-blue-400 to-indigo-500 text-white ${baseClasses} border-blue-600`;
      case 'B': return `bg-gradient-to-br from-amber-400 to-orange-500 text-white ${baseClasses} border-amber-600`;
      case 'C': return `bg-gradient-to-br from-red-400 to-rose-500 text-white ${baseClasses} border-red-600`;
      default: return `bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600 ${baseClasses} border-gray-400`;
    }
  };

  // Obtener color para promedios
  const getColorPromedio = (promedio: string): string => {
    if (promedio === '-') return 'bg-gray-100 text-gray-500';
    return getColorNotaMejorado(promedio).replace('border-2', 'border');
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

      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border-4 border-[#8D2C1D]/30 overflow-hidden">
        {/* Header con paleta corporativa */}
        <div className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] px-4 py-4 border-b-4 border-[#8D2C1D]/40">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-white">
              📚 {contexto.asignacion.curso} - {contexto.asignacion.salon}
            </h2>
            <p className="text-[#FCE0C1] text-sm font-medium">
              🗺️ {contexto.periodo.tipo} {contexto.periodo.nombre} - {contexto.periodo.anioAcademico}
            </p>
            <div className="flex gap-3 mt-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                <div className="text-white text-xs font-semibold flex items-center gap-1">
                  <span>👥</span>
                  <span>{alumnosFiltrados.length} estudiantes</span>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                <div className="text-white text-xs font-semibold flex items-center gap-1">
                  <span>🎯</span>
                  <span>{contexto.competencias.length} competencias</span>
                </div>
              </div>
              {totalEstimaciones > 0 && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                  <div className="text-white text-xs font-semibold flex items-center gap-1">
                    <span>🤖</span>
                    <span>{totalEstimaciones} IA</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filtro de Alumnos */}
        <div className="p-4 border-b-2 border-[#8D2C1D]/20">
          <FiltroAlumnos
            alumnos={contexto.alumnos}
            onFiltroChange={setAlumnosFiltrados}
          />
        </div>

        {/* Lista de alumnos */}
        <div className="divide-y-2 divide-[#8D2C1D]/20">
          {alumnosFiltrados.map((alumno) => (
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
                      <div key={competencia.id} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-3 border-[#8D2C1D]/25 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-bold text-[#8D2C1D]">
                            🎯 {competencia.nombre}
                          </h4>
                          <button
                            onClick={() => handleCrearEvaluacion(competencia.id)}
                            className="text-[#8D2C1D] hover:text-[#7A2518] hover:bg-[#FCE0C1] p-2 rounded-lg transition-all duration-300 hover:scale-110"
                            title="Agregar evaluación"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Evaluaciones de la competencia */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {evaluacionesCompetencia.map(evaluacion => {
                            const nota = obtenerNota(alumno.id, evaluacion.id);
                            const estimacion = obtenerEstimacion(alumno.id, evaluacion.id);
                            const key = `${alumno.id}-${evaluacion.id}`;
                            
                            // Determinar qué mostrar: nota real o estimación
                            const mostrarEstimacion = !nota && estimacion;
                            const valorMostrar = nota || (mostrarEstimacion ? estimacion.notaEstimada : null);
                            const esEstimacion = mostrarEstimacion && !nota;
                            
                            return (
                              <div key={evaluacion.id} className="text-center">
                                <div className="text-xs text-[#666666] mb-1 font-medium">{evaluacion.nombre}</div>
                                {editando === key ? (
                                  <input
                                    type="text"
                                    value={nota || ''}
                                    onChange={(e) => {
                                      let valor = e.target.value.trim();
                                      // Solo convertir a mayúsculas si parece ser una letra
                                      if (isNaN(Number(valor))) {
                                        valor = valor.toUpperCase();
                                      }
                                      manejarCambioNota(alumno.id, evaluacion.id, valor);
                                    }}
                                    onBlur={() => setEditando(null)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') setEditando(null);
                                    }}
                                    className="w-full text-center text-sm border-2 border-[#8D2C1D] rounded-lg px-2 py-1 font-bold focus:ring-2 focus:ring-[#8D2C1D]"
                                    placeholder="AD,A,B,C o 0-20"
                                    maxLength={4}
                                    autoFocus
                                  />
                                ) : (
                                  <div className="relative">
                                    <button
                                      onClick={() => setEditando(key)}
                                      className={`w-full h-9 text-sm font-bold rounded-lg transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md ${getColorNotaMejorado(valorMostrar, !!esEstimacion)}`}
                                      title={esEstimacion ? `🤖 Estimación IA (${Math.round(estimacion!.confianza * 100)}% confianza): ${estimacion!.mensaje}` : undefined}
                                    >
                                      {esEstimacion ? (
                                        <div className="flex items-center justify-center gap-1">
                                          <span className="text-xs">🤖</span>
                                          <span>{valorMostrar}</span>
                                        </div>
                                      ) : (
                                        valorMostrar || '➕'
                                      )}
                                    </button>
                                    {esEstimacion && (
                                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">AI</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Promedio de la competencia */}
                        <div className="pt-3 border-t-2 border-[#8D2C1D]/25">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-[#666666]">📈 Promedio:</span>
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${getColorPromedio(calcularPromedioCompetencia(alumno.id, competencia.id))}`}>
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
