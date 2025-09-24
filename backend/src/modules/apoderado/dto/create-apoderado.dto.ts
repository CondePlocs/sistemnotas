import { IsString, IsOptional, IsNotEmpty, IsEmail, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RelacionApoderadoAlumnoDto } from './relacion-apoderado-alumno.dto';

export class CreateApoderadoDto {
  // Datos del Usuario (básicos)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  dni?: string;

  @IsOptional()
  @IsString()
  nombres?: string;

  @IsOptional()
  @IsString()
  apellidos?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  // Datos específicos del Apoderado
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  sexo?: string;

  @IsOptional()
  @IsString()
  estadoCivil?: string;

  @IsOptional()
  @IsString()
  nacionalidad?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  ocupacion?: string;

  @IsOptional()
  @IsString()
  centroTrabajo?: string;

  @IsOptional()
  @IsString()
  telefonoTrabajo?: string;

  // Relaciones con alumnos
  @IsArray({ message: 'Las relaciones con alumnos deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => RelacionApoderadoAlumnoDto)
  alumnos: RelacionApoderadoAlumnoDto[];
}
