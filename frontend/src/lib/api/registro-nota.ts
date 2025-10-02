import {
  CrearRegistroNotaDto,
  ActualizarRegistroNotaDto,
  GuardarNotasLoteDto,
  GuardarNotasLoteResponse,
  RegistroNota,
  PromedioCompetencia,
  PromedioCurso
} from '@/types/registro-nota';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class RegistroNotaAPI {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Crear una nota individual
   */
  async crearNota(data: CrearRegistroNotaDto): Promise<RegistroNota> {
    return this.fetchWithAuth('/api/registro-notas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Actualizar una nota existente
   */
  async actualizarNota(id: number, data: ActualizarRegistroNotaDto): Promise<RegistroNota> {
    return this.fetchWithAuth(`/api/registro-notas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Guardar múltiples notas en lote (botón "Guardar Notas")
   */
  async guardarNotasLote(data: GuardarNotasLoteDto): Promise<GuardarNotasLoteResponse> {
    return this.fetchWithAuth('/api/registro-notas/lote', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Obtener notas por contexto (asignación + período)
   */
  async obtenerNotasPorContexto(asignacionId: number, periodoId: number): Promise<RegistroNota[]> {
    const params = new URLSearchParams({
      asignacionId: asignacionId.toString(),
      periodoId: periodoId.toString(),
    });

    return this.fetchWithAuth(`/api/registro-notas/contexto?${params}`);
  }

  /**
   * Obtener notas de un alumno por período
   */
  async obtenerNotasAlumnoPeriodo(alumnoId: number, periodoId: number): Promise<RegistroNota[]> {
    return this.fetchWithAuth(`/api/registro-notas/alumno/${alumnoId}/periodo/${periodoId}`);
  }

  /**
   * Calcular promedio de competencia
   */
  async calcularPromedioCompetencia(
    alumnoId: number,
    competenciaId: number,
    periodoId: number
  ): Promise<PromedioCompetencia> {
    const params = new URLSearchParams({
      alumnoId: alumnoId.toString(),
      competenciaId: competenciaId.toString(),
      periodoId: periodoId.toString(),
    });

    return this.fetchWithAuth(`/api/registro-notas/promedio/competencia?${params}`);
  }

  /**
   * Calcular promedio de curso
   */
  async calcularPromedioCurso(
    alumnoId: number,
    cursoId: number,
    periodoId: number
  ): Promise<PromedioCurso> {
    const params = new URLSearchParams({
      alumnoId: alumnoId.toString(),
      cursoId: cursoId.toString(),
      periodoId: periodoId.toString(),
    });

    return this.fetchWithAuth(`/api/registro-notas/promedio/curso?${params}`);
  }
}

// Instancia singleton del API client
export const registroNotaAPI = new RegistroNotaAPI();
