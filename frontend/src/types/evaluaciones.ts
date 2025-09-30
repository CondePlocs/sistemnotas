// Tipos mínimos para el frontend de evaluaciones
export interface Competencia {
  id: number;
  nombre: string;
  color: string;
}

export interface Tarea {
  id: number;
  nombre: string;
  competenciaId: number;
}

export interface Alumno {
  id: number;
  nombres: string;
  apellidos: string;
}

export interface Nota {
  alumnoId: number;
  tareaId: number;
  valor: number | null; // null = no evaluado aún
}

export interface DatosEvaluacion {
  curso: {
    nombre: string;
    salon: string;
    nivel: string;
    periodo: string;
  };
  competencias: Competencia[];
  tareas: Tarea[];
  alumnos: Alumno[];
  notas: Nota[];
}
