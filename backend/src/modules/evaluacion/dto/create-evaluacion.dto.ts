import { IsString, IsNotEmpty, IsInt, IsOptional, IsDateString, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEvaluacionDto {
  @IsInt({ message: 'El ID de competencia debe ser un número entero' })
  @Type(() => Number)
  competenciaId: number;

  @IsInt({ message: 'El ID de profesor asignación debe ser un número entero' })
  @Type(() => Number)
  profesorAsignacionId: number;

  @IsInt({ message: 'El ID de período debe ser un número entero' })
  @Type(() => Number)
  periodoId: number;

  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la evaluación es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de evaluación debe tener un formato válido (YYYY-MM-DD)' })
  fechaEvaluacion?: string;
}
