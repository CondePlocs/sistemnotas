import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsDateString } from 'class-validator';
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
}
