import { DistribucionLogrosResponse, CursosProblemaResponse } from '@/types/estadisticas';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * API Client para estadísticas del sistema
 * Solo accesible para usuarios con rol OWNER
 */
export class EstadisticasAPI {
  
  /**
   * Obtiene la distribución global de logros por colegio
   * Para gráfico de pastel multi-serie en dashboard Owner
   */
  static async obtenerDistribucionLogrosGlobal(): Promise<DistribucionLogrosResponse> {
    try {
      // console.log('🔍 Llamando a:', `${API_BASE_URL}/api/estadisticas/distribucion-logros-global`);
      const response = await fetch(`${API_BASE_URL}/api/estadisticas/distribucion-logros-global`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies httpOnly
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado - Inicia sesión nuevamente');
        }
        if (response.status === 403) {
          throw new Error('Acceso denegado - Solo OWNER puede ver estas estadísticas');
        }
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener distribución de logros global:', error);
      throw error;
    }
  }

  /**
   * Obtiene los cursos con mayor porcentaje de problemas a nivel global
   * Para gráfico de barras horizontal en dashboard Owner
   */
  static async obtenerCursosProblemaGlobal(): Promise<CursosProblemaResponse> {
    try {
      // console.log('🔍 Llamando a:', `${API_BASE_URL}/api/estadisticas/cursos-problema-global`);
      const response = await fetch(`${API_BASE_URL}/api/estadisticas/cursos-problema-global`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies httpOnly
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado - Inicia sesión nuevamente');
        }
        if (response.status === 403) {
          throw new Error('Acceso denegado - Solo OWNER puede ver estas estadísticas');
        }
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener cursos problema globales:', error);
      throw error;
    }
  }

  /**
   * Health check del módulo de estadísticas
   * Verifica que el servicio esté funcionando
   */
  static async healthCheck(): Promise<{ status: string; timestamp: string; module: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/estadisticas/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en health check de estadísticas:', error);
      throw error;
    }
  }
}
