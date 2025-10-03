import { NivelEducativo } from './colegio';
import { ColegioNivel } from './nivel';

// Enum para turnos de salón
export enum Turno {
  MAÑANA = 'MAÑANA',
  TARDE = 'TARDE',
  NOCHE = 'NOCHE'
}

// Tipo base para un salón (actualizado)
export interface Salon {
  id: number;
  colegioId: number;
  colegioNivelId: number; // ← FK a colegio_nivel
  grado: string;
  seccion: string;
  turno: Turno;
  activo: boolean;
  creadoPor: number;
  creadoEn: string;
  actualizadoEn: string;
  
  // Relaciones opcionales
  colegioNivel?: ColegioNivel; // ← Datos del nivel
}

// Tipo para compatibilidad con código existente
export interface SalonConNivel extends Salon {
  nivel: string; // ← Nombre del nivel para mostrar en UI
}

// Datos para crear un salón individual
export interface CrearSalonDto {
  nivel: NivelEducativo;
  grado: string;
  seccion: string;
  turno?: Turno;
}

// Datos para creación masiva/automática
export interface CrearSalonesLoteDto {
  nivel: NivelEducativo;
  grado: string;
  secciones: string[]; // ['A', 'B', 'C', 'D']
  turno?: Turno;
}

// Configuración de rango para creación automática
export interface RangoSeccion {
  desde: string; // 'A'
  hasta: string; // 'H'
}

// Datos del formulario de creación automática
export interface CreacionAutomaticaForm {
  nivel: NivelEducativo;
  grado: string;
  rango: RangoSeccion;
}

// Datos del formulario de creación manual
export interface CreacionManualForm {
  nivel: NivelEducativo;
  grado: string;
  seccion: string;
  gradoPersonalizado: boolean;
  seccionPersonalizada: boolean;
}

// Modo de creación en el modal
export type ModoCreacion = 'manual' | 'automatico';

// Rangos predefinidos para creación automática
export interface RangoPredefinido {
  nombre: string;
  descripcion: string;
  secciones: string[];
}

// Constantes para rangos comunes
export const RANGOS_PREDEFINIDOS: Record<string, RangoPredefinido> = {
  'pequeño': {
    nombre: 'Colegio Pequeño',
    descripcion: 'A - C (3 secciones)',
    secciones: ['A', 'B', 'C']
  },
  'mediano': {
    nombre: 'Colegio Mediano', 
    descripcion: 'A - E (5 secciones)',
    secciones: ['A', 'B', 'C', 'D', 'E']
  },
  'grande': {
    nombre: 'Colegio Grande',
    descripcion: 'A - H (8 secciones)', 
    secciones: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  },
  'muy-grande': {
    nombre: 'Colegio Muy Grande',
    descripcion: 'A - J (10 secciones)',
    secciones: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  }
};

// Letras disponibles para secciones
export const LETRAS_SECCIONES = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'
];

// Función helper para generar rango de secciones
export function generarRangoSecciones(desde: string, hasta: string): string[] {
  const inicio = LETRAS_SECCIONES.indexOf(desde);
  const fin = LETRAS_SECCIONES.indexOf(hasta);
  
  if (inicio === -1 || fin === -1 || inicio > fin) {
    return [];
  }
  
  return LETRAS_SECCIONES.slice(inicio, fin + 1);
}

// Función helper para validar si un rango es válido
export function validarRango(desde: string, hasta: string): boolean {
  const inicio = LETRAS_SECCIONES.indexOf(desde);
  const fin = LETRAS_SECCIONES.indexOf(hasta);
  
  return inicio !== -1 && fin !== -1 && inicio <= fin;
}
