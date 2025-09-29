// Enums
export enum TipoPeriodo {
  BIMESTRE = 'BIMESTRE',
  TRIMESTRE = 'TRIMESTRE',
  SEMESTRE = 'SEMESTRE'
}

// Interfaces
export interface PeriodoAcademico {
  id: number;
  colegioId: number;
  nombre: string;
  tipo: TipoPeriodo;
  anioAcademico: number;
  orden: number;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  creadoPor: number;
  creadoEn: string;
  actualizadoEn: string;
  colegio?: {
    id: number;
    nombre: string;
  };
  creador?: {
    id: number;
    nombres: string;
    apellidos: string;
  };
}

// DTOs para formularios
export interface PeriodoAcademicoFormData {
  nombre: string; // Número romano (I, II, III, etc.)
  tipo: TipoPeriodo;
  anioAcademico: number; // Se asigna automáticamente
  orden: number; // Se calcula automáticamente del nombre
  fechaInicio: string;
  fechaFin: string;
}

// Respuestas de API
export interface PeriodoAcademicoResponse {
  success: boolean;
  message?: string;
  data: PeriodoAcademico;
}

export interface ListaPeriodosResponse {
  success: boolean;
  data: {
    periodos: PeriodoAcademico[];
    periodosPorAnio: Record<number, PeriodoAcademico[]>;
    totalPeriodos: number;
    aniosAcademicos: number[];
  };
}

// Opciones para selects
export const TIPOS_PERIODO = [
  { value: TipoPeriodo.BIMESTRE, label: 'Bimestre' },
  { value: TipoPeriodo.TRIMESTRE, label: 'Trimestre' },
  { value: TipoPeriodo.SEMESTRE, label: 'Semestre' }
];

export const NUMEROS_ROMANOS = [
  { value: 'I', label: 'I', orden: 1 },
  { value: 'II', label: 'II', orden: 2 },
  { value: 'III', label: 'III', orden: 3 },
  { value: 'IV', label: 'IV', orden: 4 },
  { value: 'V', label: 'V', orden: 5 },
  { value: 'VI', label: 'VI', orden: 6 }
];

// Función para obtener el año académico actual
export const obtenerAnioAcademicoActual = (): number => {
  return new Date().getFullYear();
};

// Función para convertir número romano a orden
export const convertirRomanoAOrden = (romano: string): number => {
  const conversion: Record<string, number> = {
    'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6
  };
  return conversion[romano] || 1;
};
