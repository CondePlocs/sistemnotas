// Tipos compartidos para el módulo de salones
import { NivelEducativo } from '../../generated/prisma';

export { NivelEducativo };

export interface SalonCreado {
  id: number;
  colegioId: number;
  nivel: NivelEducativo;
  grado: string;
  seccion: string;
  activo: boolean;
  creadoPor: number;
  creadoEn: Date;
  actualizadoEn: Date;
  colegio?: {
    id: number;
    nombre: string;
  };
  creadorUser?: {
    id: number;
    nombres: string | null;
    apellidos: string | null;
  };
}