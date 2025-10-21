import { NotaLiteral } from './registro-nota';

export interface EstimacionIA {
  alumnoId: number;
  competenciaId: number;
  evaluacionId: number;
  notaEstimada: NotaLiteral;
  confianza: number;
  mensaje: string;
  esEstimacion: true; // Flag para identificar estimaciones vs notas reales
}

export interface ConfiguracionEstimacion {
  mostrarEstimaciones: boolean;
  minimoConfianza: number; // 0.0 - 1.0
  mostrarSoloAltaConfianza: boolean;
}

export interface EstadoEstimacion {
  cargando: boolean;
  error: string | null;
  estimaciones: Map<string, EstimacionIA>; // Key: "alumnoId-evaluacionId"
}

// Utilidades para trabajar con estimaciones
export const EstimacionUtils = {
  /**
   * Genera la clave única para una estimación
   */
  generarClave: (alumnoId: number, evaluacionId: number): string => {
    return `${alumnoId}-${evaluacionId}`;
  },

  /**
   * Convierte nota numérica a literal según el sistema peruano
   */
  convertirNotaNumerica: (notaNumerica: number): NotaLiteral => {
    if (notaNumerica >= 3.5) return 'AD';
    if (notaNumerica >= 2.5) return 'A';
    if (notaNumerica >= 1.5) return 'B';
    return 'C';
  },

  /**
   * Obtiene el color para mostrar estimaciones
   */
  obtenerColorEstimacion: (confianza: number): string => {
    if (confianza >= 0.8) {
      return 'bg-gradient-to-br from-purple-400 to-purple-500 text-white border-purple-500';
    } else if (confianza >= 0.6) {
      return 'bg-gradient-to-br from-indigo-400 to-indigo-500 text-white border-indigo-500';
    } else {
      return 'bg-gradient-to-br from-gray-400 to-gray-500 text-white border-gray-500';
    }
  },

  /**
   * Obtiene el icono según el nivel de confianza
   */
  obtenerIconoConfianza: (confianza: number): string => {
    if (confianza >= 0.8) return '🤖'; // Robot - Alta confianza
    if (confianza >= 0.6) return '🔮'; // Bola de cristal - Media confianza
    return '❓'; // Interrogación - Baja confianza
  }
};
