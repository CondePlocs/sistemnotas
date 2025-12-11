import { PartialType } from '@nestjs/mapped-types';
import { CreateEvaluacionDto } from './create-evaluacion.dto';
import { IsOptional, IsString, IsNotEmpty, MinLength, MaxLength, IsDateString } from 'class-validator';

export class UpdateEvaluacionDto extends PartialType(CreateEvaluacionDto) {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la evaluación no puede estar vacío' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de evaluación debe tener un formato válido (YYYY-MM-DD)' })
  fechaEvaluacion?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de revisión debe tener un formato válido (YYYY-MM-DD)' })
  fechaRevision?: string;

  @IsString({ message: 'La contraseña es requerida para confirmar cambios' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  password: string;
}
