// Tipos para el sistema de evaluaciones con datos reales del backend

export interface Competencia {
  id: number;
  nombre: string;
  descripcion?: string;
  orden: number;
  activo: boolean;
  cursoId: number;
}

export interface Evaluacion {
  id: number;
  nombre: string;
  descripcion?: string;
  fechaEvaluacion: string | null;
  competenciaId: number;
  profesorAsignacionId: number;
  periodoId: number;
  creadoPor: number;
  creadoEn: string;
  actualizadoEn: string;
  competencia: Competencia;
}

export interface Alumno {
  id: number;
  nombres: string;
  apellidos: string;
  dni?: string;
}

export interface PeriodoAcademico {
  id: number;
  nombre: string;
  tipo: string;
  anioAcademico: number;
  activo: boolean;
}

export interface ProfesorAsignacion {
  id: number;
  profesorId: number;
  salonId: number;
  cursoId: number;
  activo: boolean;
  asignadoPor: number;
  asignadoEn: string;
  actualizadoEn: string;
  colegioId: number; // Derivado de salon.colegioId para compatibilidad
  profesor: {
    id: number;
    usuarioRol: {
      usuario: {
        nombres: string;
        apellidos: string;
        email: string;
      };
    };
  };
  salon: {
    id: number;
    grado: string;
    seccion: string;
    colegioId: number;
    colegioNivel: {
      nivel: {
        id: number;
        nombre: string;
      };
    };
  };
  curso: {
    id: number;
    nombre: string;
    descripcion?: string;
    color?: string;
  };
}

export interface ContextoTrabajo {
  asignacion: {
    id: number;
    curso: string;
    salon: string;
    colegioId: number;
  };
  periodo: {
    id: number;
    nombre: string;
    tipo: string;
    anioAcademico: number;
  };
  competencias: Competencia[];
  alumnos: Alumno[];
  evaluaciones: Evaluacion[];
}

export interface CreateEvaluacionDto {
  nombre: string;
  descripcion?: string;
  fechaEvaluacion?: string;
  competenciaId: number;
  profesorAsignacionId: number;
  periodoId: number;
}

// Tipos para compatibilidad con componentes existentes
export interface DatosEvaluacion {
  curso: {
    nombre: string;
    salon: string;
    nivel: string;
    periodo: string;
  };
  competencias: Competencia[];
  tareas: Evaluacion[]; // Renombramos tareas por evaluaciones
  alumnos: Alumno[];
  notas: any[]; // Por ahora vacío, se implementará después
}
