import { useState, useEffect, useCallback } from 'react';
import { iaAPI } from '@/lib/api/ia';
import { EstimacionIA, EstadoEstimacion, EstimacionUtils } from '@/types/ia';
import { Evaluacion, Alumno, Competencia } from '@/types/evaluaciones';
import { NotaLiteral } from '@/types/registro-nota';

interface UseEstimacionesIAProps {
  alumnos: Alumno[];
  competencias: Competencia[];
  evaluaciones: Evaluacion[];
  notasExistentes: Map<string, NotaLiteral>; // Key: "alumnoId-evaluacionId"
  profesorAsignacionId: number; // Para aislamiento por profesor
}

export const useEstimacionesIA = ({
  alumnos,
  competencias,
  evaluaciones,
  notasExistentes,
  profesorAsignacionId
}: UseEstimacionesIAProps) => {
  const [estado, setEstado] = useState<EstadoEstimacion>({
    cargando: false,
    error: null,
    estimaciones: new Map()
  });

  /**
   * Cuenta las notas existentes de un alumno en una competencia
   */
  const contarNotasExistentes = useCallback((alumnoId: number, competenciaId: number): number => {
    const evaluacionesCompetencia = evaluaciones.filter(e => e.competenciaId === competenciaId);
    let contador = 0;
    
    for (const evaluacion of evaluacionesCompetencia) {
      const clave = EstimacionUtils.generarClave(alumnoId, evaluacion.id);
      if (notasExistentes.has(clave)) {
        contador++;
      }
    }
    
    return contador;
  }, [evaluaciones, notasExistentes]);

  /**
   * Obtiene el número de la próxima tarea para una competencia
   */
  const obtenerProximaTarea = useCallback((competenciaId: number, alumnoId: number): number => {
    const evaluacionesCompetencia = evaluaciones.filter(e => e.competenciaId === competenciaId);
    let notasExistentesCount = 0;
    
    // Contar cuántas notas tiene el alumno en esta competencia
    for (const evaluacion of evaluacionesCompetencia) {
      const clave = EstimacionUtils.generarClave(alumnoId, evaluacion.id);
      if (notasExistentes.has(clave)) {
        notasExistentesCount++;
      }
    }
    
    return notasExistentesCount + 1;
  }, [evaluaciones, notasExistentes]);

  /**
   * Genera estimaciones para evaluaciones sin nota
   */
  const generarEstimaciones = useCallback(async () => {
    setEstado(prev => ({ ...prev, cargando: true, error: null }));
    
    try {
      const nuevasEstimaciones = new Map<string, EstimacionIA>();
      
      // Procesar cada alumno
      for (const alumno of alumnos) {
        // Procesar cada competencia
        for (const competencia of competencias) {
          const notasExistentesCount = contarNotasExistentes(alumno.id, competencia.id);
          
          // Solo estimar si tiene 2+ notas históricas
          if (notasExistentesCount >= 2) {
            // Buscar evaluaciones de esta competencia sin nota
            const evaluacionesCompetencia = evaluaciones.filter(e => e.competenciaId === competencia.id);
            
            for (const evaluacion of evaluacionesCompetencia) {
              const claveNota = EstimacionUtils.generarClave(alumno.id, evaluacion.id);
              
              // Si no tiene nota, generar estimación
              if (!notasExistentes.has(claveNota)) {
                try {
                  const proximaTarea = obtenerProximaTarea(competencia.id, alumno.id);
                  
                  const respuestaIA = await iaAPI.estimarNota({
                    alumnoId: alumno.id,
                    competenciaId: competencia.id,
                    profesorAsignacionId,
                    proximaTarea
                  });
                  
                  // Solo agregar si tiene confianza mínima (reducido para mostrar más estimaciones)
                  if (respuestaIA.confianza >= 0.3) {
                    const estimacion: EstimacionIA = {
                      alumnoId: alumno.id,
                      competenciaId: competencia.id,
                      evaluacionId: evaluacion.id,
                      notaEstimada: respuestaIA.notaEstimadaLiteral as NotaLiteral,
                      confianza: respuestaIA.confianza,
                      mensaje: respuestaIA.mensaje,
                      esEstimacion: true
                    };
                    
                    nuevasEstimaciones.set(claveNota, estimacion);
                  }
                } catch (error) {
                  console.warn(`Error estimando para alumno ${alumno.id}, competencia ${competencia.id}:`, error);
                }
              }
            }
          }
        }
      }
      
      setEstado(prev => ({
        ...prev,
        cargando: false,
        estimaciones: nuevasEstimaciones
      }));
      
    } catch (error) {
      console.error('Error generando estimaciones:', error);
      setEstado(prev => ({
        ...prev,
        cargando: false,
        error: 'Error al generar estimaciones de IA'
      }));
    }
  }, [alumnos, competencias, evaluaciones, notasExistentes, profesorAsignacionId, contarNotasExistentes, obtenerProximaTarea]);

  /**
   * Obtiene la estimación para un alumno y evaluación específica
   */
  const obtenerEstimacion = useCallback((alumnoId: number, evaluacionId: number): EstimacionIA | null => {
    const clave = EstimacionUtils.generarClave(alumnoId, evaluacionId);
    return estado.estimaciones.get(clave) || null;
  }, [estado.estimaciones]);

  /**
   * Verifica si hay una estimación disponible
   */
  const tieneEstimacion = useCallback((alumnoId: number, evaluacionId: number): boolean => {
    const clave = EstimacionUtils.generarClave(alumnoId, evaluacionId);
    return estado.estimaciones.has(clave);
  }, [estado.estimaciones]);

  /**
   * Limpia las estimaciones (útil cuando se actualizan las notas)
   */
  const limpiarEstimaciones = useCallback(() => {
    setEstado(prev => ({
      ...prev,
      estimaciones: new Map()
    }));
  }, []);

  // Regenerar estimaciones cuando cambien las dependencias
  useEffect(() => {
    if (alumnos.length > 0 && competencias.length > 0 && evaluaciones.length > 0) {
      // Debounce para evitar múltiples llamadas
      const timeoutId = setTimeout(() => {
        generarEstimaciones();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [alumnos, competencias, evaluaciones, notasExistentes, profesorAsignacionId, generarEstimaciones]);

  return {
    // Estado
    cargando: estado.cargando,
    error: estado.error,
    
    // Funciones
    obtenerEstimacion,
    tieneEstimacion,
    generarEstimaciones,
    limpiarEstimaciones,
    
    // Estadísticas
    totalEstimaciones: estado.estimaciones.size
  };
};
