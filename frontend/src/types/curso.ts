// Tipos para el sistema de cursos y competencias

// Enum para niveles educativos (debe coincidir con Prisma)
export enum NivelEducativo {
  INICIAL = 'INICIAL',
  PRIMARIA = 'PRIMARIA',
  SECUNDARIA = 'SECUNDARIA'
}

// Enum para tipos de competencias
export enum TipoCompetencia {
  CONCEPTUAL = 'conceptual',
  PROCEDIMENTAL = 'procedimental',
  ACTITUDINAL = 'actitudinal'
}

// Interface base para Curso
export interface Curso {
  id: number;
  nombre: string;
  descripcion?: string;
  nivel: NivelEducativo;
  color?: string;
  activo: boolean;
  creadoPor: number;
  creadoEn: string;
  actualizadoEn: string;
  
  // Relaciones
  competencias?: Competencia[];
  creador?: {
    id: number;
    nombres?: string;
    apellidos?: string;
    email: string;
  };
}

// Interface base para Competencia
export interface Competencia {
  id: number;
  cursoId: number;
  nombre: string;
  orden: number;
  activo: boolean;
  creadoPor: number;
  creadoEn: string;
  actualizadoEn: string;
  
  // Relaciones
  curso?: Curso;
  creador?: {
    id: number;
    nombres?: string;
    apellidos?: string;
  };
}

// ========================================
// TIPOS PARA FORMULARIOS
// ========================================

// Datos para crear un curso
export interface CursoFormData {
  nombre: string;
  descripcion?: string;
  nivel: NivelEducativo;
  color?: string;
  competencias: CompetenciaFormData[];
}

// Datos para crear una competencia (en formulario)
export interface CompetenciaFormData {
  nombre: string;
  // orden se asigna automáticamente
}

// Datos para actualizar un curso
export interface ActualizarCursoData {
  nombre?: string;
  descripcion?: string;
  color?: string;
}

// Datos para actualizar una competencia
export interface ActualizarCompetenciaData {
  nombre?: string;
  orden?: number;
}

// ========================================
// TIPOS PARA RESPUESTAS DE API
// ========================================

// Respuesta al crear un curso
export interface CursoCreatedResponse {
  success: boolean;
  message: string;
  curso: Curso;
}

// Respuesta al listar cursos
export interface CursosListResponse {
  success: boolean;
  cursos: Curso[];
  estadisticas?: {
    total: number;
    porNivel: {
      nivel: NivelEducativo;
      cantidad: number;
    }[];
  };
}

// Respuesta al obtener competencias de un curso
export interface CompetenciasCursoResponse {
  success: boolean;
  curso: Curso;
  competencias: Competencia[];
}

// ========================================
// TIPOS PARA COMPONENTES UI
// ========================================

// Props para componente de curso
export interface CursoCardProps {
  curso: Curso;
  onEdit?: (curso: Curso) => void;
  onDelete?: (cursoId: number) => void;
  onViewCompetencias?: (curso: Curso) => void;
  showActions?: boolean;
}

// Props para componente de competencia
export interface CompetenciaItemProps {
  competencia: CompetenciaFormData;
  index: number;
  onEdit: (index: number, competencia: CompetenciaFormData) => void;
  onDelete: (index: number) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
}

// Props para selector de competencias
export interface SelectorCompetenciasProps {
  competencias: CompetenciaFormData[];
  onChange: (competencias: CompetenciaFormData[]) => void;
  disabled?: boolean;
  maxCompetencias?: number;
}

// ========================================
// CONSTANTES Y UTILIDADES
// ========================================

// Colores predefinidos para cursos
export const COLORES_CURSO = [
  { nombre: 'Azul', valor: '#3B82F6', clase: 'bg-blue-500' },
  { nombre: 'Verde', valor: '#10B981', clase: 'bg-green-500' },
  { nombre: 'Rojo', valor: '#EF4444', clase: 'bg-red-500' },
  { nombre: 'Amarillo', valor: '#F59E0B', clase: 'bg-yellow-500' },
  { nombre: 'Púrpura', valor: '#8B5CF6', clase: 'bg-purple-500' },
  { nombre: 'Rosa', valor: '#EC4899', clase: 'bg-pink-500' },
  { nombre: 'Índigo', valor: '#6366F1', clase: 'bg-indigo-500' },
  { nombre: 'Gris', valor: '#6B7280', clase: 'bg-gray-500' },
];

// Opciones para niveles educativos
export const NIVELES_EDUCATIVOS = [
  { valor: NivelEducativo.INICIAL, label: 'Inicial', descripcion: '3-5 años' },
  { valor: NivelEducativo.PRIMARIA, label: 'Primaria', descripcion: '6-11 años' },
  { valor: NivelEducativo.SECUNDARIA, label: 'Secundaria', descripcion: '12-17 años' },
];

// Función para obtener el color de un curso
export const obtenerColorCurso = (color?: string): string => {
  if (color && COLORES_CURSO.find(c => c.valor === color)) {
    return color;
  }
  return COLORES_CURSO[0].valor; // Azul por defecto
};

// Función para validar datos de curso
export const validarCursoFormData = (data: CursoFormData): string[] => {
  const errores: string[] = [];
  
  if (!data.nombre || data.nombre.trim().length < 3) {
    errores.push('El nombre del curso debe tener al menos 3 caracteres');
  }
  
  if (!data.nivel) {
    errores.push('Debe seleccionar un nivel educativo');
  }
  
  if (data.competencias.length === 0) {
    errores.push('Debe agregar al menos una competencia');
  }
  
  // Validar competencias
  data.competencias.forEach((comp, index) => {
    if (!comp.nombre || comp.nombre.trim().length < 5) {
      errores.push(`La competencia ${index + 1} debe tener al menos 5 caracteres`);
    }
  });
  
  return errores;
};

// Función para validar datos de competencia
export const validarCompetenciaFormData = (data: CompetenciaFormData): string[] => {
  const errores: string[] = [];
  
  if (!data.nombre || data.nombre.trim().length < 5) {
    errores.push('El nombre de la competencia debe tener al menos 5 caracteres');
  }
  
  return errores;
};

// ========================================
// TIPOS PARA CURSOS AUTOMÁTICOS
// ========================================

// Curso asignado a un salón
export interface SalonCurso {
  id: number;
  salonId: number;
  cursoId: number;
  activo: boolean;
  asignadoEn: string;
  asignadoPor?: number;
  
  // Relaciones
  curso: {
    id: number;
    nombre: string;
    nivel: NivelEducativo;
    color?: string;
    competencias?: {
      id: number;
      nombre: string;
    }[];
  };
}

// Curso asignado a un alumno
export interface AlumnoCurso {
  id: number;
  alumnoId: number;
  cursoId: number;
  salonId?: number;
  activo: boolean;
  asignadoEn: string;
  asignadoPor?: number;
  
  // Relaciones
  curso: {
    id: number;
    nombre: string;
    nivel: NivelEducativo;
    color?: string;
    competencias?: {
      id: number;
      nombre: string;
    }[];
  };
  salon?: {
    id: number;
    nivel: NivelEducativo;
    grado: string;
    seccion: string;
  };
}

// Respuesta de asignación automática de cursos a salón
export interface AsignacionCursosSalonResponse {
  success: boolean;
  cursosAsignados: number;
  cursos: {
    id: number;
    nombre: string;
    nivel: NivelEducativo;
    color?: string;
  }[];
  mensaje: string;
}

// Respuesta de asignación automática de cursos a alumno
export interface AsignacionCursosAlumnoResponse {
  success: boolean;
  cursosAsignados: number;
  cursos: {
    id: number;
    nombre: string;
    nivel: NivelEducativo;
    color?: string;
  }[];
  mensaje: string;
}

// Props para componente de lista de cursos de salón
export interface CursosSalonProps {
  salonId: number;
  salon: {
    id: number;
    nivel: NivelEducativo;
    grado: string;
    seccion: string;
  };
  onRefresh?: () => void;
}

// Props para componente de lista de cursos de alumno
export interface CursosAlumnoProps {
  alumnoId: number;
  alumno: {
    id: number;
    nombres: string;
    apellidos: string;
  };
  onRefresh?: () => void;
}

// Estadísticas de cursos automáticos
export interface EstadisticasCursosAutomaticos {
  totalSalones: number;
  totalAlumnos: number;
  totalCursosAsignados: number;
  porNivel: {
    nivel: NivelEducativo;
    salones: number;
    alumnos: number;
    cursosAsignados: number;
  }[];
}
