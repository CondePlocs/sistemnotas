import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para capturar el contexto automático donde se crean las evaluaciones
 * Estos datos se obtienen de la navegación del profesor: Dashboard → Grupo → Período
 */
export class EvaluacionContextDto {
  @IsInt({ message: 'El ID de profesor asignación debe ser un número entero' })
  @Type(() => Number)
  profesorAsignacionId: number;

  @IsInt({ message: 'El ID de período debe ser un número entero' })
  @Type(() => Number)
  periodoId: number;

  @IsOptional()
  @IsInt({ message: 'El ID de competencia debe ser un número entero' })
  @Type(() => Number)
  competenciaId?: number;
}

/**
 * DTO simplificado para crear evaluación con contexto automático
 * Solo requiere los datos que el profesor llena manualmente
 */
export class CreateEvaluacionConContextoDto {
  @IsInt({ message: 'El ID de competencia debe ser un número entero' })
  @Type(() => Number)
  competenciaId: number;

  @IsInt({ message: 'El ID de profesor asignación debe ser un número entero' })
  @Type(() => Number)
  profesorAsignacionId: number;

  @IsInt({ message: 'El ID de período debe ser un número entero' })
  @Type(() => Number)
  periodoId: number;

  @IsOptional()
  nombre?: string;

  @IsOptional()
  fechaEvaluacion?: string;
}
