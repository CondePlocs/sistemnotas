// API client para evaluaciones
import { 
  ProfesorAsignacion, 
  PeriodoAcademico, 
  ContextoTrabajo, 
  CreateEvaluacionDto,
  Evaluacion 
} from '@/types/evaluaciones';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Función helper para hacer requests con cookies
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.message || `Error ${response.status}`);
  }

  return response.json();
}

export const evaluacionesAPI = {
  // Obtener asignaciones del profesor para el dashboard
  async obtenerMisAsignaciones(): Promise<ProfesorAsignacion[]> {
    return apiRequest<ProfesorAsignacion[]>('/api/evaluaciones/mis-asignaciones');
  },

  // Obtener períodos activos por colegio
  async obtenerPeriodosActivos(colegioId: number): Promise<PeriodoAcademico[]> {
    return apiRequest<PeriodoAcademico[]>(`/api/evaluaciones/periodos-activos?colegioId=${colegioId}`);
  },

  // Obtener contexto completo de trabajo (hoja de trabajo)
  async obtenerContextoTrabajo(profesorAsignacionId: number, periodoId: number): Promise<ContextoTrabajo> {
    return apiRequest<ContextoTrabajo>(
      `/api/evaluaciones/contexto-trabajo?profesorAsignacionId=${profesorAsignacionId}&periodoId=${periodoId}`
    );
  },

  // Crear nueva evaluación
  async crearEvaluacion(data: CreateEvaluacionDto): Promise<Evaluacion> {
    return apiRequest<Evaluacion>('/api/evaluaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Obtener evaluaciones por contexto
  async obtenerEvaluacionesPorContexto(profesorAsignacionId: number, periodoId: number): Promise<Evaluacion[]> {
    return apiRequest<Evaluacion[]>(
      `/api/evaluaciones/por-contexto?profesorAsignacionId=${profesorAsignacionId}&periodoId=${periodoId}`
    );
  },

  // Actualizar evaluación
  async actualizarEvaluacion(id: number, data: Partial<CreateEvaluacionDto>): Promise<Evaluacion> {
    return apiRequest<Evaluacion>(`/api/evaluaciones/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Eliminar evaluación
  async eliminarEvaluacion(id: number): Promise<void> {
    return apiRequest<void>(`/api/evaluaciones/${id}`, {
      method: 'DELETE',
    });
  },
};
