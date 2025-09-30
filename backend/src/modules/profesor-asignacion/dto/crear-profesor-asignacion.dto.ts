import { IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CrearProfesorAsignacionDto {
  @IsInt({ message: 'El ID del profesor debe ser un número entero' })
  profesorId: number;

  @IsInt({ message: 'El ID del salón debe ser un número entero' })
  salonId: number;

  @IsInt({ message: 'El ID del curso debe ser un número entero' })
  cursoId: number;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser verdadero o falso' })
  activo?: boolean;
}
