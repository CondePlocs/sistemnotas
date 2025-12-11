import { useState, useCallback, useMemo } from 'react';
import { NotaEstado, NotaLiteral, NotaInput, CrearRegistroNotaDto } from '@/types/registro-nota';
import { registroNotaAPI } from '@/lib/api/registro-nota';

interface UseNotasStateProps {
  alumnos: Array<{ id: number }>;
  evaluaciones: Array<{ id: number }>;
}

interface NotaConId extends NotaEstado {
  id?: number; // ID de la nota en la BD
}

export function useNotasState({ alumnos, evaluaciones }: UseNotasStateProps) {
  const [notas, setNotas] = useState<Map<string, NotaConId>>(new Map());
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generar clave única para cada nota (alumno + evaluación)
  const generarClave = useCallback((alumnoId: number, evaluacionId: number) => {
    return `${alumnoId}-${evaluacionId}`;
  }, []);

  // Obtener nota por alumno y evaluación
  const obtenerNota = useCallback((alumnoId: number, evaluacionId: number): NotaInput | null => {
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
  const actualizarNota = useCallback((alumnoId: number, evaluacionId: number, nota: NotaInput | null) => {
    const clave = generarClave(alumnoId, evaluacionId);

    setNotas(prev => {
      const nuevasNotas = new Map(prev);
      const notaExistente = nuevasNotas.get(clave);

      nuevasNotas.set(clave, {
        alumnoId,
        evaluacionId,
        nota,
        guardada: false, // Marca como cambio pendiente
        original: notaExistente?.original || null,
        id: notaExistente?.id // Mantener el ID si existe
      });

      return nuevasNotas;
    });
  }, [generarClave]);

  // Establecer notas iniciales desde la BD (marca como guardadas)
  const establecerNotasIniciales = useCallback((notasIniciales: Array<{
    id?: number;
    alumnoId: number;
    evaluacionId: number;
    nota: NotaInput;
  }>) => {
    setNotas(prev => {
      const nuevasNotas = new Map(prev);

      notasIniciales.forEach(({ id, alumnoId, evaluacionId, nota }) => {
        const clave = generarClave(alumnoId, evaluacionId);
        nuevasNotas.set(clave, {
          alumnoId,
          evaluacionId,
          nota,
          guardada: true,
          original: nota,
          id // Guardar el ID de la BD
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

  // Verificar si hay cambios pendientes (incluyendo eliminaciones)
  const hayCambiosPendientes = useMemo(() => {
    let hayCambios = false;

    notas.forEach((notaEstado) => {
      if (!notaEstado.guardada) {
        hayCambios = true;
      }
    });

    return hayCambios;
  }, [notas]);

  // Guardar todas las notas pendientes y eliminar las vacías
  const guardarNotas = useCallback(async () => {
    // Separar notas para guardar y para eliminar
    const notasParaGuardar: CrearRegistroNotaDto[] = [];
    const notasParaEliminar: Array<{ id: number; clave: string }> = [];

    notas.forEach((notaEstado, clave) => {
      if (!notaEstado.guardada) {
        // Si la nota está vacía/null y tiene ID (existe en BD), marcar para eliminación
        if ((notaEstado.nota === null || notaEstado.nota === '') && notaEstado.id) {
          notasParaEliminar.push({
            id: notaEstado.id,
            clave
          });
        }
        // Si la nota tiene valor, marcar para guardar
        else if (notaEstado.nota) {
          notasParaGuardar.push({
            alumnoId: notaEstado.alumnoId,
            evaluacionId: notaEstado.evaluacionId,
            nota: notaEstado.nota
          });
        }
      }
    });

    if (notasParaGuardar.length === 0 && notasParaEliminar.length === 0) {
      return { success: true, message: 'No hay cambios pendientes' };
    }

    setGuardando(true);
    setError(null);

    try {
      let guardadas = 0;
      let eliminadas = 0;
      let errores = 0;

      // Guardar notas normales
      if (notasParaGuardar.length > 0) {
        const resultado = await registroNotaAPI.guardarNotasLote({
          notas: notasParaGuardar
        });

        guardadas = resultado.totalProcesadas - resultado.fallidas;
        errores += resultado.fallidas;

        // Marcar notas guardadas exitosamente
        setNotas(prev => {
          const nuevasNotas = new Map(prev);

          resultado.notasGuardadas.forEach((notaGuardada: any) => {
            const clave = generarClave(notaGuardada.alumnoId, notaGuardada.evaluacionId);
            const notaExistente = nuevasNotas.get(clave);

            if (notaExistente) {
              nuevasNotas.set(clave, {
                ...notaExistente,
                guardada: true,
                original: notaGuardada.nota,
                id: notaGuardada.id // Actualizar con el ID de la BD
              });
            }
          });

          return nuevasNotas;
        });
      }

      // Eliminar notas vacías
      if (notasParaEliminar.length > 0) {
        for (const { id, clave } of notasParaEliminar) {
          try {
            const deleteResponse = await fetch(
              `http://localhost:3001/api/registro-notas/${id}`,
              {
                method: 'DELETE',
                credentials: 'include'
              }
            );

            if (deleteResponse.ok) {
              eliminadas++;

              // Remover la nota del estado
              setNotas(prev => {
                const nuevasNotas = new Map(prev);
                nuevasNotas.delete(clave);
                return nuevasNotas;
              });
            } else {
              errores++;
              console.error(`Error al eliminar nota ${id}`);
            }
          } catch (error) {
            console.error(`Error al eliminar nota ${id}:`, error);
            errores++;
          }
        }
      }

      const mensaje = [];
      if (guardadas > 0) mensaje.push(`${guardadas} nota${guardadas !== 1 ? 's' : ''} guardada${guardadas !== 1 ? 's' : ''}`);
      if (eliminadas > 0) mensaje.push(`${eliminadas} nota${eliminadas !== 1 ? 's' : ''} eliminada${eliminadas !== 1 ? 's' : ''}`);
      if (errores > 0) mensaje.push(`${errores} error${errores !== 1 ? 'es' : ''}`);

      return {
        success: errores === 0,
        message: mensaje.join(', '),
        guardadas,
        eliminadas,
        errores
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return {
        success: false,
        message: `Error al guardar/eliminar notas: ${errorMessage}`
      };
    } finally {
      setGuardando(false);
    }
  }, [notas, generarClave]);

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
