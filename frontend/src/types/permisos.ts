// Tipos para el sistema de permisos administrativos

export interface PermisosAdministrativo {
  puedeRegistrarApoderados: boolean;
  puedeRegistrarProfesores: boolean;
  puedeRegistrarAdministrativos: boolean;
  puedeRegistrarAlumnos: boolean;
  puedeGestionarSalones: boolean;
  puedeAsignarProfesores: boolean;
}

export interface Permisos {
  registrarApoderados: boolean;
  registrarProfesores: boolean;
  registrarAdministrativos: boolean;
  registrarAlumnos: boolean;
  gestionarSalones: boolean;
  asignarProfesores: boolean;
}

// Interfaz extendida del Administrativo para la página de permisos
export interface AdministrativoConPermisos {
  id: number;
  usuarioRol: {
    id: number;
    usuario: {
      id: number;
      nombres: string;
      apellidos: string;
      email: string;
      dni: string;
    };
    colegio: {
      id: number;
      nombre: string;
    };
  };
  cargo: string;
  fechaIngreso: string;
  condicionLaboral: string;
  permisos?: PermisosAdministrativo;
}

// Tipos para las operaciones de permisos
export interface PermisosBatchUpdate {
  administrativoId: number;
  puedeRegistrarProfesores: boolean;
  puedeRegistrarApoderados: boolean;
  puedeRegistrarAdministrativos: boolean;
  puedeRegistrarAlumnos: boolean;
  puedeGestionarSalones: boolean;
  puedeAsignarProfesores: boolean;
}

export interface PermisosBatchResponse {
  actualizados: number;
  message: string;
}

// Tipos para verificación de permisos
export type TipoPermiso = 
  | 'profesores' 
  | 'apoderados' 
  | 'administrativos' 
  | 'alumnos' 
  | 'salones' 
  | 'asignar-profesores';

export interface VerificarPermisoResponse {
  tienePermiso: boolean;
  message?: string;
}
