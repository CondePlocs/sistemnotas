import { IsNumber, IsString, IsBoolean, IsOptional, Length, IsIn } from 'class-validator';

export class RelacionApoderadoAlumnoDto {
  @IsNumber({}, { message: 'El ID del alumno debe ser un número' })
  alumnoId: number;

  @IsString({ message: 'El parentesco debe ser un texto' })
  @Length(2, 50, { message: 'El parentesco debe tener entre 2 y 50 caracteres' })
  @IsIn(['padre', 'madre', 'tutor legal', 'abuelo', 'abuela', 'tío', 'tía', 'hermano', 'hermana', 'otro'], {
    message: 'El parentesco debe ser uno de los valores permitidos'
  })
  parentesco: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo esPrincipal debe ser verdadero o falso' })
  esPrincipal?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser verdadero o falso' })
  activo?: boolean;
}

export class CrearRelacionesDto {
  @IsNumber({}, { message: 'El ID del apoderado debe ser un número' })
  apoderadoId: number;

  relaciones: RelacionApoderadoAlumnoDto[];
}

export class ActualizarRelacionDto {
  @IsOptional()
  @IsString({ message: 'El parentesco debe ser un texto' })
  @Length(2, 50, { message: 'El parentesco debe tener entre 2 y 50 caracteres' })
  @IsIn(['padre', 'madre', 'tutor legal', 'abuelo', 'abuela', 'tío', 'tía', 'hermano', 'hermana', 'otro'], {
    message: 'El parentesco debe ser uno de los valores permitidos'
  })
  parentesco?: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo esPrincipal debe ser verdadero o falso' })
  esPrincipal?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser verdadero o falso' })
  activo?: boolean;
}
