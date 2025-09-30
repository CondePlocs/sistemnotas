// Interfaces principales
export interface ProfesorAsignacion {
  id: number;
  profesorId: number;
  salonId: number;
  cursoId: number;
  activo: boolean;
  asignadoPor: number;
  asignadoEn: string;
  actualizadoEn: string;
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

// DTOs para formularios
export interface ProfesorAsignacionFormData {
  profesorId: number;
  salonId: number;
  cursoId: number;
  activo?: boolean;
}

// Respuestas de API
export interface ProfesorAsignacionResponse {
  success: boolean;
  message?: string;
  data: ProfesorAsignacion;
}

export interface ListaAsignacionesResponse {
  success: boolean;
  data: {
    asignaciones: ProfesorAsignacion[];
    totalAsignaciones: number;
    asignacionesActivas: number;
  };
}

// Para los modales de selección
export interface SalonParaAsignacion {
  id: number;
  grado: string;
  seccion: string;
  colegioNivel: {
    nivel: {
      nombre: string;
    };
  };
  cursos: {
    id: number;
    nombre: string;
    descripcion?: string;
    color?: string;
  }[];
}

export interface ProfesorParaAsignacion {
  id: number;
  usuarioRol: {
    usuario: {
      nombres: string;
      apellidos: string;
      email: string;
    };
  };
}

// Estados del formulario
export interface EstadoFormularioAsignacion {
  salonSeleccionado: SalonParaAsignacion | null;
  cursoSeleccionado: { id: number; nombre: string; color?: string } | null;
  profesorSeleccionado: ProfesorParaAsignacion | null;
  paso: 'salon' | 'curso' | 'profesor' | 'confirmacion';
}
