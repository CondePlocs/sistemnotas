// Tipos para el sistema de registro de notas

// Tipo para notas: acepta tanto formato alfabético como numérico
export type NotaLiteral = 'AD' | 'A' | 'B' | 'C';
export type NotaInput = NotaLiteral | string; // Para input del usuario (incluye números como string)

export interface RegistroNota {
  id: number;
  alumnoId: number;
  evaluacionId: number;
  nota: NotaLiteral;
  registradoPor: number;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CrearRegistroNotaDto {
  alumnoId: number;
  evaluacionId: number;
  nota: NotaInput; // Acepta tanto letras como números
}

export interface ActualizarRegistroNotaDto {
  nota: NotaInput; // Acepta tanto letras como números
}

export interface GuardarNotasLoteDto {
  notas: CrearRegistroNotaDto[];
}

export interface GuardarNotasLoteResponse {
  notasGuardadas: RegistroNota[];
  errores: {
    alumnoId: number;
    evaluacionId: number;
    error: string;
  }[];
  totalProcesadas: number;
  exitosas: number;
  fallidas: number;
}

export interface PromedioCompetencia {
  alumnoId: number;
  competenciaId: number;
  periodoId: number;
  promedioNumerico: number;
  propuestaLiteral: NotaLiteral;
  cantidadNotas: number;
}

export interface PromedioCurso {
  alumnoId: number;
  cursoId: number;
  periodoId: number;
  promedioNumerico: number;
  propuestaLiteral: NotaLiteral;
  cantidadCompetencias: number;
}

// Estado de una nota en el frontend
export interface NotaEstado {
  alumnoId: number;
  evaluacionId: number;
  nota: NotaInput | null; // Acepta tanto letras como números
  guardada: boolean; // true si está guardada en BD, false si es cambio pendiente
  original: NotaInput | null; // valor original de la BD
}
