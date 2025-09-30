import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CrearProfesorAsignacionDto } from './crear-profesor-asignacion.dto';

export class ActualizarProfesorAsignacionDto extends PartialType(CrearProfesorAsignacionDto) {
  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser verdadero o falso' })
  activo?: boolean;
}
