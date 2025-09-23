import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsBoolean } from 'class-validator';
import { CrearAlumnoDto } from './crear-alumno.dto';

export class ActualizarAlumnoDto extends PartialType(CrearAlumnoDto) {
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  activo?: boolean;
}
