// Tipos para la tabla Nivel normalizada
export interface Nivel {
  id: number;
  nombre: string; // "INICIAL", "PRIMARIA", "SECUNDARIA"
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

// Enum para mantener compatibilidad con código existente
export enum NivelEducativo {
  INICIAL = 'INICIAL',
  PRIMARIA = 'PRIMARIA',
  SECUNDARIA = 'SECUNDARIA'
}

// Tipo para ColegioNivel actualizado
export interface ColegioNivel {
  id: number;
  colegioId: number;
  nivelId: number; // ← FK a tabla Nivel
  activo: boolean;
  puedeCrearSalones: boolean;
  creadoEn: string;
  actualizadoEn: string;
  
  // Relaciones
  nivel?: Nivel; // ← Datos de la tabla Nivel
}

// Tipo para respuesta de niveles por director
export interface NivelesPorDirector {
  colegioId: number;
  colegioNombre: string;
  nivelesPermitidos: {
    id: number;
    nombre: string;
    puedeCrearSalones: boolean;
  }[];
}

// Tipo para dropdown de niveles
export interface NivelOption {
  value: string; // nombre del nivel
  label: string; // nombre para mostrar
  id: number;    // ID de la tabla Nivel
}

// Constantes para UI
export const NIVELES_EDUCATIVOS: NivelOption[] = [
  { value: 'INICIAL', label: 'Inicial', id: 1 },
  { value: 'PRIMARIA', label: 'Primaria', id: 2 },
  { value: 'SECUNDARIA', label: 'Secundaria', id: 3 }
];

// Helper para convertir string a NivelEducativo
export const stringToNivelEducativo = (nivel: string): NivelEducativo => {
  switch (nivel.toUpperCase()) {
    case 'INICIAL':
      return NivelEducativo.INICIAL;
    case 'PRIMARIA':
      return NivelEducativo.PRIMARIA;
    case 'SECUNDARIA':
      return NivelEducativo.SECUNDARIA;
    default:
      throw new Error(`Nivel educativo no válido: ${nivel}`);
  }
};

// Helper para obtener label amigable
export const getNivelLabel = (nivel: string): string => {
  const nivelOption = NIVELES_EDUCATIVOS.find(n => n.value === nivel);
  return nivelOption?.label || nivel;
};
