export interface Alumno {
  id: number;
  dni?: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento?: string;
  sexo?: 'masculino' | 'femenino';
  activo: boolean;
  colegio: {
    id: number;
    nombre: string;
  };
}

export interface RelacionApoderadoAlumno {
  id?: number;
  alumno: Alumno;
  parentesco: string;
  esPrincipal: boolean;
  activo?: boolean;
  creadoEn?: string;
}

export interface AlumnoConParentesco {
  alumno: Alumno;
  parentesco: string;
  esPrincipal: boolean;
}

export interface ApoderadoFormData {
  // Datos básicos del usuario
  email: string;
  password: string;
  dni?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;

  // Datos específicos del apoderado
  fechaNacimiento?: string;
  sexo?: string;
  estadoCivil?: string;
  nacionalidad?: string;
  direccion?: string;
  ocupacion?: string;
  centroTrabajo?: string;
  telefonoTrabajo?: string;

  // Relaciones con alumnos
  alumnos: AlumnoConParentesco[];
}

export const PARENTESCOS = [
  'padre',
  'madre',
  'tutor legal',
  'abuelo',
  'abuela',
  'tío',
  'tía',
  'hermano',
  'hermana',
  'otro'
] as const;

export type Parentesco = typeof PARENTESCOS[number];
