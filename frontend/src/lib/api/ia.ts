// API client para IA - Estimación de notas

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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Tipos para la API de IA
export interface EstimacionNotaDto {
  alumnoId: number;
  competenciaId: number;
  proximaTarea: number;
}

export interface EstimacionRespuesta {
  alumnoId: number;
  competenciaId: number;
  proximaTarea: number;
  notaEstimadaNumerica: number;
  notaEstimadaLiteral: string;
  confianza: number;
  cantidadDatosHistoricos: number;
  mensaje: string;
  regresion: {
    pendiente: number;
    interseccion: number;
    coeficienteCorrelacion: number;
  };
}

export const iaAPI = {
  /**
   * Estima la nota de un alumno para una competencia específica
   */
  async estimarNota(dto: EstimacionNotaDto): Promise<EstimacionRespuesta> {
    return apiRequest<EstimacionRespuesta>('/ia/estimar-nota', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Verifica si un alumno tiene suficientes datos históricos para estimación
   */
  async puedeEstimar(alumnoId: number, competenciaId: number): Promise<boolean> {
    try {
      // Intentar estimar con tarea ficticia para verificar datos
      const resultado = await this.estimarNota({
        alumnoId,
        competenciaId,
        proximaTarea: 999 // Número alto ficticio
      });
      
      // Si tiene 2+ datos históricos, puede estimar
      return resultado.cantidadDatosHistoricos >= 2;
    } catch (error) {
      console.warn('No se puede estimar para alumno', alumnoId, 'competencia', competenciaId);
      return false;
    }
  }
};
