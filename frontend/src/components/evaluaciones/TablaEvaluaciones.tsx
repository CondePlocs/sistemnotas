"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ContextoTrabajo, CreateEvaluacionDto, Evaluacion } from '@/types/evaluaciones';
import { NotaLiteral, NotaInput } from '@/types/registro-nota';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useNotasState } from '@/hooks/useNotasState';
import { useEstimacionesIA } from '@/hooks/useEstimacionesIA';
import { EstimacionUtils } from '@/types/ia';
import ModalCrearEvaluacion from '../modals/ModalCrearEvaluacion';
import BotonGuardarNotas from './BotonGuardarNotas';
import FiltroAlumnos from './FiltroAlumnos';
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
  const [filaSeleccionada, setFilaSeleccionada] = useState<number | null>(null);
  const [columnaSeleccionada, setColumnaSeleccionada] = useState<number | null>(null);
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
      
      // Las estimaciones se actualizarán automáticamente por el useEffect
      // cuando cambien las notasExistentesMap
    }
    
    return resultado;
  };

  // Actualizar alumnos filtrados cuando cambie el contexto
  useEffect(() => {
    setAlumnosFiltrados(contexto.alumnos);
  }, [contexto.alumnos]);

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
    
    const notaParaColor = nota ? convertirALetra(nota) : null;
    if (esEstimacion) {
      // Colores suaves para estimaciones de IA
      switch (notaParaColor) {
        case 'AD': return 'bg-gradient-to-br from-purple-200 to-purple-300 text-purple-800 border-purple-400 hover:from-purple-300 hover:to-purple-400 ring-2 ring-purple-200 border-dashed';
        case 'A': return 'bg-gradient-to-br from-indigo-200 to-indigo-300 text-indigo-800 border-indigo-400 hover:from-indigo-300 hover:to-indigo-400 ring-2 ring-indigo-200 border-dashed';
        case 'B': return 'bg-gradient-to-br from-pink-200 to-pink-300 text-pink-800 border-pink-400 hover:from-pink-300 hover:to-pink-400 ring-2 ring-pink-200 border-dashed';
        case 'C': return 'bg-gradient-to-br from-orange-200 to-orange-300 text-orange-800 border-orange-400 hover:from-orange-300 hover:to-orange-400 ring-2 ring-orange-200 border-dashed';
        default: return 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 border-gray-400 hover:from-gray-300 hover:to-gray-400 ring-2 ring-gray-200 border-dashed';
      }
    }
    
    if (notaParaColor === null) return 'bg-white/80 text-[#666666] border-[#E9E1C9] hover:bg-[#FCE0C1] hover:border-[#8D2C1D]';
    switch (notaParaColor) {
      case 'AD': return 'bg-gradient-to-br from-emerald-200 to-emerald-300 text-emerald-800 border-emerald-300 hover:from-emerald-300 hover:to-emerald-400 hover:text-emerald-900';
      case 'A': return 'bg-gradient-to-br from-blue-200 to-blue-300 text-blue-800 border-blue-300 hover:from-blue-300 hover:to-blue-400 hover:text-blue-900';
      case 'B': return 'bg-gradient-to-br from-amber-200 to-amber-300 text-amber-800 border-amber-300 hover:from-amber-300 hover:to-amber-400 hover:text-amber-900';
      case 'C': return 'bg-gradient-to-br from-rose-200 to-rose-300 text-rose-800 border-rose-300 hover:from-rose-300 hover:to-rose-400 hover:text-rose-900';
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

  // Obtener color para promedio final (suavizado)
  const getColorPromedioFinal = (promedio: string): string => {
    if (promedio === '-') return 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600 border-2 border-gray-400';
    switch (promedio) {
      case 'AD': return 'bg-gradient-to-br from-emerald-200 to-emerald-300 text-emerald-800 border-2 border-emerald-400';
      case 'A': return 'bg-gradient-to-br from-blue-200 to-blue-300 text-blue-800 border-2 border-blue-400';
      case 'B': return 'bg-gradient-to-br from-amber-200 to-amber-300 text-amber-800 border-2 border-amber-400';
      case 'C': return 'bg-gradient-to-br from-rose-200 to-rose-300 text-rose-800 border-2 border-rose-400';
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

      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border-4 border-[#8D2C1D]/30 overflow-hidden w-full">
        {/* Header mejorado con paleta corporativa - Más compacto */}
        <div className="bg-gradient-to-r from-[#8D2C1D] to-[#D96924] px-4 py-4 border-b-4 border-[#8D2C1D]/40">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white mb-1">
                📚 {contexto.asignacion.curso} - {contexto.asignacion.salon}
              </h2>
              <p className="text-[#FCE0C1] text-sm font-medium">
                🗺️ {contexto.periodo.tipo} {contexto.periodo.nombre} - {contexto.periodo.anioAcademico}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="text-white text-xs font-semibold text-center">
                  <div className="flex items-center gap-1">
                    <span>👥</span>
                    <span>{alumnosFiltrados.length} estudiantes</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="text-white text-xs font-semibold text-center">
                  <div className="flex items-center gap-1">
                    <span>🎯</span>
                    <span>{contexto.competencias.length} competencias</span>
                  </div>
                </div>
              </div>
              {totalEstimaciones > 0 && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                  <div className="text-white text-xs font-semibold text-center">
                    <div className="flex items-center gap-1">
                      <span>🤖</span>
                      <span>{totalEstimaciones} IA</span>
                    </div>
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

        {/* Tabla con scroll horizontal */}
        <div className="overflow-x-auto max-h-[calc(100vh-200px)] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9] border-b-4 border-[#8D2C1D]/30">
                <th className="px-4 py-4 text-left text-sm font-bold text-[#8D2C1D] border-r-4 border-[#8D2C1D]/30 sticky left-0 bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9] z-10 min-w-[200px]">
                  👥 ESTUDIANTE
                </th>
                {contexto.competencias.map((competencia, compIndex) => {
                  const evaluacionesCompetencia = obtenerEvaluacionesPorCompetencia(competencia.id);
                  return (
                    <th 
                      key={competencia.id} 
                      className={`border-r-4 border-[#8D2C1D]/30 min-w-[400px] max-w-[600px] transition-all duration-200 cursor-pointer ${
                        columnaSeleccionada === compIndex 
                          ? 'bg-[#8D2C1D]/30 shadow-lg border-t-4 border-t-[#8D2C1D]' 
                          : 'hover:bg-[#FCE0C1]/10'
                      }`}
                      onClick={() => setColumnaSeleccionada(columnaSeleccionada === compIndex ? null : compIndex)}
                    >
                      <div className="px-3 py-4">
                        <div className="text-center text-sm font-bold text-white px-3 py-2 rounded-xl bg-gradient-to-r from-[#8D2C1D] to-[#D96924] shadow-lg mb-3 mx-1">
                          🎯 {competencia.nombre}
                        </div>
                        <div className="flex items-center gap-1">
                          {evaluacionesCompetencia.map(evaluacion => (
                            <div key={evaluacion.id} className="flex-1 min-w-[80px]">
                              <div className="text-xs text-[#666666] text-center font-semibold p-1.5 bg-white/50 rounded-lg border border-[#E9E1C9]">
                                {evaluacion.nombre}
                              </div>
                            </div>
                          ))}
                          <div className="w-8 flex justify-center">
                            <button
                              onClick={() => handleCrearEvaluacion(competencia.id)}
                              className="text-[#8D2C1D] hover:text-[#7A2518] hover:bg-[#FCE0C1] p-1.5 rounded-lg transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
                              title="Agregar evaluación"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="w-20">
                            <div className="text-xs text-[#8D2C1D] text-center font-bold bg-white/70 rounded-lg p-1.5 border border-[#E9E1C9]">
                              📈 Promedio
                            </div>
                          </div>
                        </div>
                      </div>
                    </th>
                  );
                })}
                <th className="px-4 py-4 text-center text-sm font-bold text-[#8D2C1D] bg-gradient-to-r from-[#FCE0C1] to-[#E9E1C9] sticky right-0 z-10 min-w-[150px] border-l-4 border-[#8D2C1D]/30">
                  🏆 PROMEDIO FINAL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#8D2C1D]/20">
              {alumnosFiltrados.map((alumno, index) => (
                <React.Fragment key={`alumno-${alumno.id}`}>
                  {/* Línea de separación cada 5 estudiantes */}
                  {index > 0 && index % 5 === 0 && (
                    <tr className="h-2">
                      <td colSpan={contexto.competencias.length + 2} className="h-2 bg-gradient-to-r from-[#8D2C1D]/10 via-[#8D2C1D]/20 to-[#8D2C1D]/10 border-y-2 border-[#8D2C1D]/30"></td>
                    </tr>
                  )}
                <tr 
                  className={`transition-all duration-200 border-l-4 cursor-pointer ${
                    filaSeleccionada === alumno.id 
                      ? 'bg-[#8D2C1D]/30 border-l-[#8D2C1D] shadow-lg' 
                      : index % 2 === 0 
                        ? 'bg-white/50 border-l-[#8D2C1D]/20 hover:bg-[#FCE0C1]/10' 
                        : 'bg-[#FCE0C1]/10 border-l-[#8D2C1D]/20 hover:bg-[#FCE0C1]/15'
                  }`}
                  onClick={() => setFilaSeleccionada(filaSeleccionada === alumno.id ? null : alumno.id)}
                >
                  <td className="px-4 py-3 border-r-4 border-[#8D2C1D]/30 sticky left-0 z-10 bg-inherit">
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
                      <td 
                        key={competencia.id} 
                        className={`border-r-4 border-[#8D2C1D]/30 p-1 transition-all duration-200 ${
                          columnaSeleccionada === contexto.competencias.findIndex(c => c.id === competencia.id)
                            ? 'bg-[#8D2C1D]/30'
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-0.5">
                          {evaluacionesCompetencia.map(evaluacion => {
                            const nota = obtenerNota(alumno.id, evaluacion.id);
                            const estimacion = obtenerEstimacion(alumno.id, evaluacion.id);
                            const key = `${alumno.id}-${evaluacion.id}`;
                            
                            // Determinar qué mostrar: nota real o estimación
                            const mostrarEstimacion = !nota && estimacion;
                            const valorMostrar = nota || (mostrarEstimacion ? estimacion.notaEstimada : null);
                            const esEstimacion = mostrarEstimacion && !nota;
                            
                            return (
                              <div key={evaluacion.id} className="flex-1 min-w-[80px]">
                                <div className="text-center relative">
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
                                    <>
                                      <button
                                        onClick={() => setEditando(key)}
                                        className={`w-full h-9 text-sm font-bold rounded-lg transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md border-2 ${getColorNotaMejorado(valorMostrar, !!esEstimacion)}`}
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
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          <div className="w-8"></div>
                          <div className="w-20">
                            <div className="text-center">
                              <span className={`px-2 py-1.5 rounded-lg text-xs font-bold shadow-sm ${getColorPromedio(calcularPromedioCompetencia(alumno.id, competencia.id))}`}>
                                {calcularPromedioCompetencia(alumno.id, competencia.id)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center border-l-4 border-[#8D2C1D] sticky right-0 z-10 bg-inherit">
                    <div className="flex items-center justify-center">
                      <span className={`px-3 py-2 rounded-xl text-sm font-bold shadow-lg ${getColorPromedioFinal(calcularPromedio(alumno.id))}`}>
                        🏆 {calcularPromedio(alumno.id)}
                      </span>
                    </div>
                  </td>
                </tr>
                </React.Fragment>
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
