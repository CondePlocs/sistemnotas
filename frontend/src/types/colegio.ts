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

// Tipos para el modelo Colegio
export interface ColegioFormData {
  nombre: string;
  codigoModular?: string;
  distrito?: string;
  direccion?: string;
  nivel?: string; // inicial, primaria, secundaria
  ugelId?: number; // ID de la UGEL seleccionada
}

export interface Colegio {
  id: number;
  ugelId?: number;
  nombre: string;
  codigoModular?: string;
  distrito?: string;
  direccion?: string;
  nivel?: string;
  provisional: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
  ugel?: UGEL;
}

// Opciones para el select de nivel
export const NIVELES_EDUCATIVOS = [
  { value: 'inicial', label: 'Inicial' },
  { value: 'primaria', label: 'Primaria' },
  { value: 'secundaria', label: 'Secundaria' },
  { value: 'inicial-primaria', label: 'Inicial y Primaria' },
  { value: 'primaria-secundaria', label: 'Primaria y Secundaria' },
  { value: 'completo', label: 'Inicial, Primaria y Secundaria' }
] as const;
