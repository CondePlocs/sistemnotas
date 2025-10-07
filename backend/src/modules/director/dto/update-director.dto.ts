import { IsString, IsOptional, IsInt, IsEmail, IsDateString } from 'class-validator';

export class UpdateDirectorDto {
  // Datos del Usuario (básicos) - Opcionales para actualización
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

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

  // Datos específicos del Director
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
  gradoAcademico?: string;

  @IsOptional()
  @IsString()
  carrera?: string;

  @IsOptional()
  @IsString()
  especializacion?: string;

  @IsOptional()
  @IsString()
  institucionEgreso?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  // ID del colegio (opcional para cambiar asignación)
  @IsOptional()
  @IsInt()
  colegioId?: number;
}
