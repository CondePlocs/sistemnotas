// Tipos para las estadísticas del dashboard Owner

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

export interface DistribucionLogrosResponse {
  colegios: LogrosPorColegio[];
  totalColegios: number;
  totalNotasGlobal: number;
  resumenGlobal: {
    AD: number;
    A: number;
    B: number;
    C: number;
  };
}

export interface CursoProblema {
  nombre: string;
  totalAlumnos: number;
  alumnosProblema: number;
  porcentajeProblema: number | string;  // Puede venir como string desde el backend
  detalleProblemas: {
    B: number;
    C: number;
  };
  nivel: string;
}

export interface CursosProblemaResponse {
  cursosProblema: CursoProblema[];
  totalCursos: number;
  cursosAnalizados: number;
  promedioProblemasGlobal: number;
}

// Tipos para los gráficos de Recharts
export interface DatosPastelColegio {
  nombre: string;
  AD: number;
  A: number;
  B: number;
  C: number;
  total: number;
}

export interface DatosBarraCurso {
  nombre: string;
  porcentajeProblema: number;
  totalAlumnos: number;
  alumnosProblema: number;
  nivel: string;
}
