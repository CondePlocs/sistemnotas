// Tipos para el modelo Director
export interface DirectorFormData {
  // Datos del Usuario (básicos)
  email: string;
  password: string;
  dni?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  
  // Datos específicos del Director
  fechaNacimiento?: string; // string para formularios, se convierte a Date
  sexo?: string;
  estadoCivil?: string;
  nacionalidad?: string;
  direccion?: string;
  gradoAcademico?: string;
  carrera?: string;
  especializacion?: string;
  institucionEgreso?: string;
  fechaInicio?: string; // string para formularios, se convierte a Date
  
  // ID del colegio al que se asignará
  colegioId: number;
}

export interface Director {
  id: number;
  usuarioRolId: number;
  fechaNacimiento?: Date;
  sexo?: string;
  estadoCivil?: string;
  nacionalidad?: string;
  direccion?: string;
  gradoAcademico?: string;
  carrera?: string;
  especializacion?: string;
  institucionEgreso?: string;
  fechaInicio?: Date;
  creadoEn: Date;
  actualizadoEn: Date;
}

// Opciones para selects
export const OPCIONES_SEXO = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' }
] as const;

export const OPCIONES_ESTADO_CIVIL = [
  { value: 'soltero', label: 'Soltero(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viudo', label: 'Viudo(a)' },
  { value: 'conviviente', label: 'Conviviente' }
] as const;

export const OPCIONES_GRADO_ACADEMICO = [
  { value: 'bachiller', label: 'Bachiller' },
  { value: 'licenciado', label: 'Licenciado' },
  { value: 'magister', label: 'Magíster' },
  { value: 'doctor', label: 'Doctor' }
] as const;
