// Tipos para el módulo de alumnos

export enum SexoAlumno {
  masculino = 'masculino',
  femenino = 'femenino'
}

// Datos básicos del alumno
export interface Alumno {
  id: number;
  colegioId: number;
  dni?: string;
  codigoAlumno?: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento?: string;
  sexo?: SexoAlumno;
  nacionalidad?: string;
  direccion?: string;
  distrito?: string;
  numeroContacto?: string;
  activo: boolean;
  creadoPor: number;
  actualizadoPor?: number;
  creadoEn: string;
  actualizadoEn: string;
  colegio?: {
    id: number;
    nombre: string;
  };
  creadorUser?: {
    id: number;
    nombres?: string;
    apellidos?: string;
  };
  actualizadorUser?: {
    id: number;
    nombres?: string;
    apellidos?: string;
  };
}

// DTO para crear un alumno
export interface CrearAlumnoDto {
  dni?: string;
  codigoAlumno?: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento?: string;
  sexo?: SexoAlumno;
  nacionalidad?: string;
  direccion?: string;
  distrito?: string;
  numeroContacto?: string;
}

// DTO para actualizar un alumno
export interface ActualizarAlumnoDto {
  dni?: string;
  codigoAlumno?: string;
  nombres?: string;
  apellidos?: string;
  fechaNacimiento?: string;
  sexo?: SexoAlumno;
  nacionalidad?: string;
  direccion?: string;
  distrito?: string;
  numeroContacto?: string;
  activo?: boolean;
}

// Datos del formulario (estado local)
export interface AlumnoFormData {
  dni: string;
  codigoAlumno: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  sexo: SexoAlumno | '';
  nacionalidad: string;
  direccion: string;
  distrito: string;
  numeroContacto: string;
}
