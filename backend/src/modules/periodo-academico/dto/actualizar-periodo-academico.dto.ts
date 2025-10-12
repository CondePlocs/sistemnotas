import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsDateString, IsString, MinLength } from 'class-validator';
import { CrearPeriodoAcademicoDto } from './crear-periodo-academico.dto';

export class ActualizarPeriodoAcademicoDto extends PartialType(CrearPeriodoAcademicoDto) {
  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser verdadero o falso' })
  activo?: boolean;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  fechaInicio?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  fechaFin?: string;

  // Campo para verificación de contraseña en operaciones sensibles
  @IsOptional()
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(1, { message: 'La contraseña es requerida' })
  password?: string;
}
