// Enums para profesor
export enum SexoProfesor {
  MASCULINO = 'masculino',
  FEMENINO = 'femenino'
}

export enum EstadoCivil {
  SOLTERO = 'soltero',
  CASADO = 'casado',
  DIVORCIADO = 'divorciado',
  VIUDO = 'viudo'
}

export enum GradoAcademico {
  BACHILLER = 'bachiller',
  LICENCIADO = 'licenciado',
  MAGISTER = 'magister',
  DOCTOR = 'doctor'
}

export enum CondicionLaboral {
  NOMBRADO = 'nombrado',
  CONTRATADO = 'contratado'
}

// Interfaces principales
export interface Usuario {
  id: number;
  email: string;
  dni?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  estado: string;
  creado_en: string;
  actualizado_en?: string;
}

export interface Colegio {
  id: number;
  nombre: string;
}

export interface UsuarioRol {
  id: number;
  usuario_id: number;
  rol_id: number;
  colegio_id: number;
  usuario: Usuario;
  colegio: Colegio;
  hecho_en: string;
  actualizado_en?: string;
}

export interface Profesor {
  id: number;
  usuarioRolId: number;
  fechaNacimiento?: string;
  sexo?: string;
  estadoCivil?: string;
  nacionalidad?: string;
  direccion?: string;
  especialidad?: string;
  gradoAcademico?: string;
  institucionEgreso?: string;
  fechaIngreso?: string;
  condicionLaboral?: string;
  creadoEn: string;
  actualizadoEn?: string;
  usuarioRol: UsuarioRol;
}

// Datos para formulario (crear/editar)
export interface ProfesorFormData {
  // Datos básicos del usuario
  email: string;
  password?: string; // Solo para crear
  dni?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;

  // Datos específicos del profesor
  fechaNacimiento?: string;
  sexo?: string;
  estadoCivil?: string;
  nacionalidad?: string;
  direccion?: string;
  especialidad?: string;
  gradoAcademico?: string;
  institucionEgreso?: string;
  fechaIngreso?: string;
  condicionLaboral?: string;
}

// Respuesta de la API
export interface ProfesorResponse {
  success: boolean;
  profesor: Profesor;
}

export interface ProfesoresListResponse {
  profesores: Profesor[];
  total: number;
}

// Props para componentes
export interface ProfesorCardProps {
  profesor: Profesor;
  onEdit: (profesor: Profesor) => void;
  onView: (profesor: Profesor) => void;
  onToggleStatus: (profesor: Profesor) => void;
}

export interface ModalProfesorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  profesor?: Profesor; // Si se pasa, es para editar
}

export interface ModalVerProfesorProps {
  isOpen: boolean;
  onClose: () => void;
  profesor: Profesor;
}

// Constantes
export const SEXO_OPTIONS = [
  { value: SexoProfesor.MASCULINO, label: 'Masculino' },
  { value: SexoProfesor.FEMENINO, label: 'Femenino' }
];

export const ESTADO_CIVIL_OPTIONS = [
  { value: EstadoCivil.SOLTERO, label: 'Soltero(a)' },
  { value: EstadoCivil.CASADO, label: 'Casado(a)' },
  { value: EstadoCivil.DIVORCIADO, label: 'Divorciado(a)' },
  { value: EstadoCivil.VIUDO, label: 'Viudo(a)' }
];

export const GRADO_ACADEMICO_OPTIONS = [
  { value: GradoAcademico.BACHILLER, label: 'Bachiller' },
  { value: GradoAcademico.LICENCIADO, label: 'Licenciado' },
  { value: GradoAcademico.MAGISTER, label: 'Magíster' },
  { value: GradoAcademico.DOCTOR, label: 'Doctor' }
];

export const CONDICION_LABORAL_OPTIONS = [
  { value: CondicionLaboral.NOMBRADO, label: 'Nombrado' },
  { value: CondicionLaboral.CONTRATADO, label: 'Contratado' }
];
