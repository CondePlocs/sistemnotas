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
  nivelId: number;
  color?: string;
  activo: boolean;
  creadoPor: number;
  creadoEn: string;
  actualizadoEn: string;
  
  // Relaciones
  nivel?: {
    id: number;
    nombre: string;
  };
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
  nivelId: number;
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
      nivelId: number;
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

// Props para selector de colores
export interface ColorSelectorProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  showPresets?: boolean;
  showCustomPicker?: boolean;
  label?: string;
  placeholder?: string;
}

// ========================================
// CONSTANTES Y UTILIDADES
// ========================================

// Paleta expandida de colores para cursos organizados por categorías
export const PALETA_COLORES_CURSO = {
  basicos: [
    { nombre: 'Azul', valor: '#3B82F6', clase: 'bg-blue-500' },
    { nombre: 'Verde', valor: '#10B981', clase: 'bg-green-500' },
    { nombre: 'Rojo', valor: '#EF4444', clase: 'bg-red-500' },
    { nombre: 'Amarillo', valor: '#F59E0B', clase: 'bg-yellow-500' },
    { nombre: 'Púrpura', valor: '#8B5CF6', clase: 'bg-purple-500' },
    { nombre: 'Rosa', valor: '#EC4899', clase: 'bg-pink-500' },
    { nombre: 'Índigo', valor: '#6366F1', clase: 'bg-indigo-500' },
    { nombre: 'Gris', valor: '#6B7280', clase: 'bg-gray-500' },
  ],
  vibrantes: [
    { nombre: 'Naranja Vibrante', valor: '#FF6B35', clase: 'bg-orange-600' },
    { nombre: 'Verde Lima', valor: '#84CC16', clase: 'bg-lime-500' },
    { nombre: 'Cian', valor: '#06B6D4', clase: 'bg-cyan-500' },
    { nombre: 'Magenta', valor: '#D946EF', clase: 'bg-fuchsia-500' },
    { nombre: 'Coral', valor: '#FF7849', clase: 'bg-red-400' },
    { nombre: 'Turquesa', valor: '#14B8A6', clase: 'bg-teal-500' },
    { nombre: 'Violeta', valor: '#7C3AED', clase: 'bg-violet-600' },
    { nombre: 'Esmeralda', valor: '#059669', clase: 'bg-emerald-600' },
  ],
  pasteles: [
    { nombre: 'Azul Pastel', valor: '#93C5FD', clase: 'bg-blue-300' },
    { nombre: 'Verde Pastel', valor: '#86EFAC', clase: 'bg-green-300' },
    { nombre: 'Rosa Pastel', valor: '#F9A8D4', clase: 'bg-pink-300' },
    { nombre: 'Amarillo Pastel', valor: '#FDE047', clase: 'bg-yellow-300' },
    { nombre: 'Púrpura Pastel', valor: '#C4B5FD', clase: 'bg-purple-300' },
    { nombre: 'Naranja Pastel', valor: '#FDBA74', clase: 'bg-orange-300' },
    { nombre: 'Gris Pastel', valor: '#D1D5DB', clase: 'bg-gray-300' },
    { nombre: 'Índigo Pastel', valor: '#A5B4FC', clase: 'bg-indigo-300' },
  ],
  oscuros: [
    { nombre: 'Azul Oscuro', valor: '#1E40AF', clase: 'bg-blue-800' },
    { nombre: 'Verde Oscuro', valor: '#166534', clase: 'bg-green-800' },
    { nombre: 'Rojo Oscuro', valor: '#991B1B', clase: 'bg-red-800' },
    { nombre: 'Púrpura Oscuro', valor: '#581C87', clase: 'bg-purple-800' },
    { nombre: 'Gris Oscuro', valor: '#374151', clase: 'bg-gray-700' },
    { nombre: 'Índigo Oscuro', valor: '#312E81', clase: 'bg-indigo-800' },
    { nombre: 'Teal Oscuro', valor: '#134E4A', clase: 'bg-teal-800' },
    { nombre: 'Slate', valor: '#475569', clase: 'bg-slate-600' },
  ],
  materias: [
    { nombre: 'Matemática', valor: '#2563EB', clase: 'bg-blue-600' },
    { nombre: 'Ciencias', valor: '#16A34A', clase: 'bg-green-600' },
    { nombre: 'Lenguaje', valor: '#DC2626', clase: 'bg-red-600' },
    { nombre: 'Historia', valor: '#CA8A04', clase: 'bg-yellow-600' },
    { nombre: 'Arte', valor: '#9333EA', clase: 'bg-purple-600' },
    { nombre: 'Educación Física', valor: '#EA580C', clase: 'bg-orange-600' },
    { nombre: 'Inglés', valor: '#0891B2', clase: 'bg-cyan-600' },
    { nombre: 'Música', valor: '#BE185D', clase: 'bg-pink-600' },
  ]
};

// Mantener compatibilidad con código existente
export const COLORES_CURSO = PALETA_COLORES_CURSO.basicos;

// Opciones para niveles educativos
export const NIVELES_EDUCATIVOS = [
  { valor: NivelEducativo.INICIAL, label: 'Inicial', descripcion: '3-5 años' },
  { valor: NivelEducativo.PRIMARIA, label: 'Primaria', descripcion: '6-11 años' },
  { valor: NivelEducativo.SECUNDARIA, label: 'Secundaria', descripcion: '12-17 años' },
];

// Función para obtener el color de un curso
export const obtenerColorCurso = (color?: string): string => {
  if (color && isValidHexColor(color)) {
    return color;
  }
  return COLORES_CURSO[0].valor; // Azul por defecto
};

// Función para validar formato HEX
export const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// Función para obtener todos los colores de la paleta
export const obtenerTodosLosColores = () => {
  return [
    ...PALETA_COLORES_CURSO.basicos,
    ...PALETA_COLORES_CURSO.vibrantes,
    ...PALETA_COLORES_CURSO.pasteles,
    ...PALETA_COLORES_CURSO.oscuros,
    ...PALETA_COLORES_CURSO.materias,
  ];
};

// Función para verificar contraste (básico)
export const tieneContrasteAdecuado = (color: string): boolean => {
  // Convertir hex a RGB y calcular luminancia básica
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Fórmula básica de luminancia
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Evitar colores muy claros (difíciles de leer)
  return luminancia < 0.9 && luminancia > 0.1;
};

// Función para validar datos de curso
export const validarCursoFormData = (data: CursoFormData): string[] => {
  const errores: string[] = [];
  
  if (!data.nombre || data.nombre.trim().length < 3) {
    errores.push('El nombre del curso debe tener al menos 3 caracteres');
  }
  
  if (!data.nivelId || data.nivelId === 0) {
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
    nivel: {
      id: number;
      nombre: string;
    };
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
    nivel: {
      id: number;
      nombre: string;
    };
    color?: string;
    competencias?: {
      id: number;
      nombre: string;
    }[];
  };
  salon?: {
    id: number;
    colegioNivel: {
      nivel: {
        id: number;
        nombre: string;
      };
    };
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
