const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Tipos para las respuestas de estadísticas de Director
 */
export interface LogrosPorColegio {
  nombre: string;
  logros: {
    AD: number;
    A: number;
    B: number;
    C: number;
  };
  totalNotas: number;
  porcentajes: {
    AD: number;
    A: number;
    B: number;
    C: number;
  };
}

export interface LogrosPorGrado {
  grado: string;
  totalAlumnos: number;
  logros: {
    AD: number;
    A: number;
    B: number;
    C: number;
  };
  promedioNumerico: number;
  porcentajes: {
    AD: number;
    A: number;
    B: number;
    C: number;
  };
}

export interface RendimientoPorGradoResponse {
  grados: LogrosPorGrado[];
  totalGrados: number;
}

export interface CursoProblemaColegioDto {
  nombre: string;
  totalAlumnos: number;
  alumnosProblema: number;
  porcentajeProblema: number;
  detalleProblemas: {
    B: number;
    C: number;
  };
  nivel: string;
}

export interface CursosProblemaColegioResponse {
  cursosProblema: CursoProblemaColegioDto[];
  totalCursos: number;
  cursosAnalizados: number;
  promedioProblemasLocal: number;
}

/**
 * Cliente API para estadísticas de Director
 * Solo accesible para usuarios con rol DIRECTOR
 */
export class EstadisticasDirectorAPI {
  
  /**
   * Obtiene la distribución de logros del colegio del director
   * Para gráfico de pastel simple en dashboard Director
   */
  static async obtenerDistribucionLogrosColegio(): Promise<LogrosPorColegio> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/estadisticas/distribucion-logros-colegio`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies httpOnly
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Acceso denegado - Debes iniciar sesión');
        }
        if (response.status === 403) {
          throw new Error('Acceso denegado - Solo DIRECTOR puede ver estas estadísticas');
        }
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener distribución de logros del colegio:', error);
      throw error;
    }
  }

  /**
   * Obtiene el rendimiento por grado del colegio del director
   * Para gráfico de barras verticales en dashboard Director
   */
  static async obtenerRendimientoPorGrado(): Promise<RendimientoPorGradoResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/estadisticas/rendimiento-por-grado`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies httpOnly
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Acceso denegado - Debes iniciar sesión');
        }
        if (response.status === 403) {
          throw new Error('Acceso denegado - Solo DIRECTOR puede ver estas estadísticas');
        }
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener rendimiento por grado:', error);
      throw error;
    }
  }

  /**
   * Obtiene los cursos con más problemas del colegio del director
   * Para gráfico de barras horizontales en dashboard Director
   */
  static async obtenerCursosProblemaColegioDirector(): Promise<CursosProblemaColegioResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/estadisticas/cursos-problema-colegio`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies httpOnly
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Acceso denegado - Debes iniciar sesión');
        }
        if (response.status === 403) {
          throw new Error('Acceso denegado - Solo DIRECTOR puede ver estas estadísticas');
        }
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener cursos problema del colegio:', error);
      throw error;
    }
  }
}
