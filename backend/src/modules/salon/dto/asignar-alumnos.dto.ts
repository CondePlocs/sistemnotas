import { IsArray, IsInt, IsOptional, IsString, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AsignarAlumnoDto {
  @IsInt({ message: 'El ID del alumno debe ser un número entero' })
  alumnoId: number;
}

export class AsignarAlumnosDto {
  @IsInt({ message: 'El ID del salón debe ser un número entero' })
  salonId: number;

  @IsArray({ message: 'Los alumnos deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe asignar al menos un alumno' })
  @ValidateNested({ each: true })
  @Type(() => AsignarAlumnoDto)
  alumnos: AsignarAlumnoDto[];
}

export class RemoverAlumnoDto {
  @IsInt({ message: 'El ID del alumno debe ser un número entero' })
  alumnoId: number;

  @IsInt({ message: 'El ID del salón debe ser un número entero' })
  salonId: number;
}

export class FiltrosAlumnosDisponiblesDto {
  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser un texto' })
  busqueda?: string;

  @IsOptional()
  @IsInt({ message: 'La edad mínima debe ser un número entero' })
  edadMinima?: number;

  @IsOptional()
  @IsInt({ message: 'La edad máxima debe ser un número entero' })
  edadMaxima?: number;

  @IsOptional()
  @IsString({ message: 'El nivel debe ser un texto válido' })
  nivel?: string;

  @IsOptional()
  @IsString({ message: 'El grado debe ser un texto válido' })
  grado?: string;
}
