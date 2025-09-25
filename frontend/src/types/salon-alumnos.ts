// Tipos para la gestión de alumnos en salones

export interface AlumnoSalon {
  id: number;
  fechaAsignacion: string;
  alumno: AlumnoConEdad;
  asignador: {
    id: number;
    nombres: string;
    apellidos: string;
  };
}

export interface AlumnoConEdad {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string | null;
  fechaNacimiento: string | null;
  sexo: string | null;
  numeroContacto: string | null;
  edad: number | null;
}

export interface AlumnoDisponible {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string | null;
  fechaNacimiento: string | null;
  sexo: string | null;
  numeroContacto: string | null;
  edad: number | null;
}

export interface SalonConAlumnos {
  salon: {
    id: number;
    nivel: string;
    grado: string;
    seccion: string;
    activo: boolean;
  };
  alumnos: AlumnoSalon[];
  totalAlumnos: number;
}

export interface AlumnosDisponibles {
  alumnos: AlumnoDisponible[];
  total: number;
  filtros: FiltrosAlumnos;
}

export interface FiltrosAlumnos {
  busqueda?: string;
  edadMinima?: number;
  edadMaxima?: number;
  nivel?: string;
  grado?: string;
}

export interface AsignarAlumnosRequest {
  salonId: number;
  alumnos: {
    alumnoId: number;
  }[];
}

export interface RemoverAlumnoRequest {
  salonId: number;
  alumnoId: number;
}

// Respuestas de la API
export interface AsignarAlumnosResponse {
  success: boolean;
  message: string;
  data: {
    salon: {
      id: number;
      nivel: string;
      grado: string;
      seccion: string;
    };
    asignaciones: AlumnoSalon[];
    totalAsignados: number;
  };
}

export interface ObtenerAlumnosResponse {
  success: boolean;
  data: SalonConAlumnos;
}

export interface ObtenerDisponiblesResponse {
  success: boolean;
  data: AlumnosDisponibles;
}

export interface RemoverAlumnoResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    activo: boolean;
    fechaRetiro: string;
  };
}

// Estados para componentes
export interface EstadoAsignacion {
  cargando: boolean;
  error: string | null;
  alumnosSeleccionados: number[];
  filtros: FiltrosAlumnos;
}

export interface EstadoSalonDetalle {
  cargando: boolean;
  error: string | null;
  salon: SalonConAlumnos | null;
  modalAsignacionAbierto: boolean;
}

// Tipos para formularios
export interface FormularioFiltros {
  busqueda: string;
  edadMinima: string;
  edadMaxima: string;
}

export interface OpcionFiltro {
  value: string;
  label: string;
}

// Constantes
export const RANGOS_EDAD: OpcionFiltro[] = [
  { value: '3-5', label: '3 a 5 años (Inicial)' },
  { value: '6-11', label: '6 a 11 años (Primaria)' },
  { value: '12-17', label: '12 a 17 años (Secundaria)' },
];

export const SEXOS: OpcionFiltro[] = [
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMENINO', label: 'Femenino' },
];

// Utilidades
export const calcularEdad = (fechaNacimiento: string | null): number | null => {
  if (!fechaNacimiento) return null;
  
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  
  const mesActual = hoy.getMonth();
  const mesNacimiento = nacimiento.getMonth();
  
  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
};

export const formatearNombreCompleto = (nombres: string, apellidos: string): string => {
  return `${apellidos}, ${nombres}`;
};

export const obtenerIniciales = (nombres: string, apellidos: string): string => {
  const primeraLetraNombre = nombres.charAt(0).toUpperCase();
  const primeraLetraApellido = apellidos.charAt(0).toUpperCase();
  return `${primeraLetraNombre}${primeraLetraApellido}`;
};

export const aplicarFiltroEdad = (alumnos: AlumnoDisponible[], filtros: FiltrosAlumnos): AlumnoDisponible[] => {
  return alumnos.filter(alumno => {
    if (!alumno.edad) return false;
    
    if (filtros.edadMinima && alumno.edad < filtros.edadMinima) return false;
    if (filtros.edadMaxima && alumno.edad > filtros.edadMaxima) return false;
    
    return true;
  });
};

export const aplicarFiltroBusqueda = (alumnos: AlumnoDisponible[], busqueda: string): AlumnoDisponible[] => {
  if (!busqueda.trim()) return alumnos;
  
  const termino = busqueda.toLowerCase().trim();
  
  return alumnos.filter(alumno => 
    alumno.nombres.toLowerCase().includes(termino) ||
    alumno.apellidos.toLowerCase().includes(termino) ||
    (alumno.dni && alumno.dni.includes(termino))
  );
};
