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
  password?: string;
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

export interface Apoderado {
  id: number;
  fechaNacimiento?: string;
  sexo?: 'masculino' | 'femenino';
  estadoCivil?: 'soltero' | 'casado' | 'divorciado' | 'viudo';
  nacionalidad?: string;
  direccion?: string;
  ocupacion?: string;
  centroTrabajo?: string;
  telefonoTrabajo?: string;
  creadoEn: string;
  actualizadoEn?: string;
  creadoPor?: number;
  actualizadoPor?: number;
  usuarioRol: {
    id: number;
    colegio_id: number;
    hecho_por?: number;
    hecho_en: string;
    usuario: {
      id: number;
      email: string;
      dni?: string;
      nombres?: string;
      apellidos?: string;
      telefono?: string;
      estado: 'activo' | 'inactivo';
      creado_en: string;
      actualizado_en?: string;
    };
    colegio: {
      id: number;
      nombre: string;
    };
    creadoPor?: {
      id: number;
      nombres?: string;
      apellidos?: string;
      email: string;
    };
  };
  alumnos: RelacionApoderadoAlumno[];
}

export interface ApoderadoCardProps {
  apoderado: Apoderado;
  onEdit: (apoderado: Apoderado) => void;
  onView: (apoderado: Apoderado) => void;
  onToggleStatus: (apoderado: Apoderado) => void;
}

export interface ModalApoderadoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  apoderado?: Apoderado;
}

export interface ModalVerApoderadoProps {
  isOpen: boolean;
  onClose: () => void;
  apoderado: Apoderado;
}

// Opciones para selects
export const SEXO_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' }
];

export const ESTADO_CIVIL_OPTIONS = [
  { value: 'soltero', label: 'Soltero(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viudo', label: 'Viudo(a)' }
];

export const PARENTESCO_OPTIONS = [
  { value: 'padre', label: 'Padre' },
  { value: 'madre', label: 'Madre' },
  { value: 'tutor', label: 'Tutor' },
  { value: 'abuelo', label: 'Abuelo' },
  { value: 'abuela', label: 'Abuela' },
  { value: 'tio', label: 'Tío' },
  { value: 'tia', label: 'Tía' },
  { value: 'hermano', label: 'Hermano' },
  { value: 'hermana', label: 'Hermana' },
  { value: 'otro', label: 'Otro' }
];

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
