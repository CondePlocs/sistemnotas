// Tipos para DRE
export interface DRE {
  id: number;
  nombre: string;
  codigo?: string;
}

// Tipos para UGEL
export interface UGEL {
  id: number;
  dreId: number;
  nombre: string;
  codigo?: string;
  dre?: DRE;
}

// Importar tipos de nivel
import { NivelEducativo, ColegioNivel } from './nivel';

// Re-exportar para compatibilidad
export { NivelEducativo };

// Tipos para el modelo Colegio (actualizado)
export interface ColegioFormData {
  nombre: string;
  codigoModular?: string;
  distrito?: string;
  direccion?: string;
  ugelId?: number; // ID de la UGEL seleccionada
  nivelesPermitidos: string[]; // ← Nombres de niveles ("INICIAL", "PRIMARIA", etc.)
}

export interface Colegio {
  id: number;
  nombre: string;
  codigoModular?: string;
  distrito?: string;
  direccion?: string;
  ugelId?: number;
  ugel?: UGEL;
  nivelesPermitidos?: ColegioNivel[]; // ← Usar nueva estructura
  creadoEn: Date;
  actualizadoEn: Date;
}

// Opciones para el select de nivel (DEPRECATED)
export const NIVELES_EDUCATIVOS = [
  { value: 'inicial', label: 'Inicial' },
  { value: 'primaria', label: 'Primaria' },
  { value: 'secundaria', label: 'Secundaria' },
  { value: 'inicial-primaria', label: 'Inicial y Primaria' },
  { value: 'primaria-secundaria', label: 'Primaria y Secundaria' },
  { value: 'completo', label: 'Inicial, Primaria y Secundaria' }
] as const;

// Opciones para checkboxes de niveles permitidos
export const OPCIONES_NIVELES_EDUCATIVOS = [
  { 
    value: NivelEducativo.INICIAL, 
    label: 'Inicial', 
    descripcion: 'Permitir crear salones de nivel inicial (3, 4, 5 años)',
    icon: '👶'
  },
  { 
    value: NivelEducativo.PRIMARIA, 
    label: 'Primaria', 
    descripcion: 'Permitir crear salones de 1° a 6° grado de primaria',
    icon: '📚'
  },
  { 
    value: NivelEducativo.SECUNDARIA, 
    label: 'Secundaria', 
    descripcion: 'Permitir crear salones de 1° a 5° año de secundaria',
    icon: '🎓'
  }
] as const;
