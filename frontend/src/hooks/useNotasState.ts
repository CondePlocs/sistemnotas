import { useState, useCallback, useMemo } from 'react';
import { NotaEstado, NotaLiteral, CrearRegistroNotaDto } from '@/types/registro-nota';
import { registroNotaAPI } from '@/lib/api/registro-nota';

interface UseNotasStateProps {
  alumnos: Array<{ id: number }>;
  evaluaciones: Array<{ id: number }>;
}

export function useNotasState({ alumnos, evaluaciones }: UseNotasStateProps) {
  const [notas, setNotas] = useState<Map<string, NotaEstado>>(new Map());
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generar clave única para cada nota (alumno + evaluación)
  const generarClave = useCallback((alumnoId: number, evaluacionId: number) => {
    return `${alumnoId}-${evaluacionId}`;
  }, []);

  // Obtener nota por alumno y evaluación
  const obtenerNota = useCallback((alumnoId: number, evaluacionId: number): NotaLiteral | null => {
    const clave = generarClave(alumnoId, evaluacionId);
    return notas.get(clave)?.nota || null;
  }, [notas, generarClave]);

  // Verificar si una nota está guardada
  const estaGuardada = useCallback((alumnoId: number, evaluacionId: number): boolean => {
    const clave = generarClave(alumnoId, evaluacionId);
    const nota = notas.get(clave);
    return nota?.guardada ?? true; // Si no existe, consideramos que está guardada
  }, [notas, generarClave]);

  // Actualizar una nota (marca como no guardada)
  const actualizarNota = useCallback((alumnoId: number, evaluacionId: number, nota: NotaLiteral | null) => {
    const clave = generarClave(alumnoId, evaluacionId);
    
    setNotas(prev => {
      const nuevasNotas = new Map(prev);
      const notaExistente = nuevasNotas.get(clave);
      
      nuevasNotas.set(clave, {
        alumnoId,
        evaluacionId,
        nota,
        guardada: false, // Marca como cambio pendiente
        original: notaExistente?.original || null
      });
      
      return nuevasNotas;
    });
  }, [generarClave]);

  // Establecer notas iniciales desde la BD (marca como guardadas)
  const establecerNotasIniciales = useCallback((notasIniciales: Array<{
    alumnoId: number;
    evaluacionId: number;
    nota: NotaLiteral;
  }>) => {
    setNotas(prev => {
      const nuevasNotas = new Map(prev);
      
      notasIniciales.forEach(({ alumnoId, evaluacionId, nota }) => {
        const clave = generarClave(alumnoId, evaluacionId);
        nuevasNotas.set(clave, {
          alumnoId,
          evaluacionId,
          nota,
          guardada: true,
          original: nota
        });
      });
      
      return nuevasNotas;
    });
  }, [generarClave]);

  // Calcular notas pendientes de guardar
  const notasPendientes = useMemo(() => {
    const pendientes: CrearRegistroNotaDto[] = [];
    
    notas.forEach((notaEstado) => {
      if (!notaEstado.guardada && notaEstado.nota) {
        pendientes.push({
          alumnoId: notaEstado.alumnoId,
          evaluacionId: notaEstado.evaluacionId,
          nota: notaEstado.nota
        });
      }
    });
    
    return pendientes;
  }, [notas]);

  // Verificar si hay cambios pendientes
  const hayCambiosPendientes = useMemo(() => {
    return notasPendientes.length > 0;
  }, [notasPendientes]);

  // Guardar todas las notas pendientes
  const guardarNotas = useCallback(async () => {
    if (notasPendientes.length === 0) return { success: true, message: 'No hay cambios pendientes' };

    setGuardando(true);
    setError(null);

    try {
      const resultado = await registroNotaAPI.guardarNotasLote({
        notas: notasPendientes
      });

      // Marcar notas guardadas exitosamente
      setNotas(prev => {
        const nuevasNotas = new Map(prev);
        
        resultado.notasGuardadas.forEach(notaGuardada => {
          const clave = generarClave(notaGuardada.alumnoId, notaGuardada.evaluacionId);
          const notaExistente = nuevasNotas.get(clave);
          
          if (notaExistente) {
            nuevasNotas.set(clave, {
              ...notaExistente,
              guardada: true,
              original: notaGuardada.nota
            });
          }
        });
        
        return nuevasNotas;
      });

      const exitosas = resultado.totalProcesadas - resultado.fallidas;
      const mensaje = resultado.fallidas > 0 
        ? `${exitosas} notas guardadas, ${resultado.fallidas} errores`
        : `${exitosas} notas guardadas exitosamente`;

      return { 
        success: true, 
        message: mensaje,
        detalles: resultado 
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { 
        success: false, 
        message: `Error al guardar notas: ${errorMessage}` 
      };
    } finally {
      setGuardando(false);
    }
  }, [notasPendientes, generarClave]);

  // Descartar cambios pendientes
  const descartarCambios = useCallback(() => {
    setNotas(prev => {
      const nuevasNotas = new Map(prev);
      
      // Restaurar valores originales o eliminar si no existían
      nuevasNotas.forEach((notaEstado, clave) => {
        if (!notaEstado.guardada) {
          if (notaEstado.original) {
            nuevasNotas.set(clave, {
              ...notaEstado,
              nota: notaEstado.original,
              guardada: true
            });
          } else {
            nuevasNotas.delete(clave);
          }
        }
      });
      
      return nuevasNotas;
    });
  }, []);

  // Convertir Map a array para facilitar el uso
  const todasLasNotas = useMemo(() => {
    return Array.from(notas.values());
  }, [notas]);

  return {
    // Estado
    notas,
    guardando,
    error,
    hayCambiosPendientes,
    notasPendientes,
    todasLasNotas,
    
    // Funciones
    obtenerNota,
    estaGuardada,
    actualizarNota,
    establecerNotasIniciales,
    guardarNotas,
    descartarCambios,
    
    // Utilidades
    cantidadPendientes: notasPendientes.length
  };
}
