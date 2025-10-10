export interface AdministrativoFormData {
  // Datos básicos del usuario
  email: string;
  password?: string; // Opcional para edición
  dni?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;

  // Datos específicos del administrativo
  fechaNacimiento?: string;
  sexo?: string;
  estadoCivil?: string;
  nacionalidad?: string;
  direccion?: string;
  cargo: string;
  fechaIngreso?: string;
  condicionLaboral?: string;
}

export interface Administrativo {
  id: number;
  fechaNacimiento?: string;
  sexo?: string;
  estadoCivil?: string;
  nacionalidad?: string;
  direccion?: string;
  cargo: string;
  fechaIngreso?: string;
  condicionLaboral?: string;
  creadoEn: string;
  actualizado_en?: string;
  usuarioRol: {
    id: number;
    colegio_id: number;
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
    rol: {
      id: number;
      nombre: string;
    };
    colegio: {
      id: number;
      nombre: string;
      ugel: {
        id: number;
        nombre: string;
        dre: {
          id: number;
          nombre: string;
        };
      };
    };
    creadoPor?: {
      id: number;
      nombres?: string;
      apellidos?: string;
      email: string;
    };
  };
  permisos?: {
    id: number;
    puedeRegistrarProfesores: boolean;
    puedeRegistrarAlumnos: boolean;
    puedeRegistrarApoderados: boolean;
    puedeRegistrarAdministrativos: boolean;
    puedeGestionarNotas: boolean;
    puedeGestionarAsistencias: boolean;
    puedeVerReportes: boolean;
  };
}

export interface AdministrativoCardProps {
  administrativo: Administrativo;
  onView: (administrativo: Administrativo) => void;
  onEdit: (administrativo: Administrativo) => void;
  onToggleStatus: (administrativo: Administrativo) => void;
}

export interface ModalAdministrativoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AdministrativoFormData) => Promise<void>;
  administrativo?: Administrativo | null;
  isEditing?: boolean;
}

export interface ModalVerAdministrativoProps {
  isOpen: boolean;
  onClose: () => void;
  administrativo: Administrativo | null;
  onEdit: (administrativo: Administrativo) => void;
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

export const CARGO_OPTIONS = [
  { value: 'secretaria', label: 'Secretaria' },
  { value: 'coordinador', label: 'Coordinador' },
  { value: 'auxiliar', label: 'Auxiliar' },
  { value: 'bibliotecario', label: 'Bibliotecario' },
  { value: 'psicologo', label: 'Psicólogo' },
  { value: 'enfermero', label: 'Enfermero' },
  { value: 'conserje', label: 'Conserje' },
  { value: 'vigilante', label: 'Vigilante' },
  { value: 'otro', label: 'Otro' }
];

export const CONDICION_LABORAL_OPTIONS = [
  { value: 'nombrado', label: 'Nombrado' },
  { value: 'contratado', label: 'Contratado' },
  { value: 'cas', label: 'CAS' },
  { value: 'locacion', label: 'Locación de Servicios' }
];
