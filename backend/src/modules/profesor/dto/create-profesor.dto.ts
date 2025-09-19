import { IsString, IsOptional, IsNotEmpty, IsEmail, IsDateString } from 'class-validator';

export class CreateProfesorDto {
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

  // Datos específicos del Profesor
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
  especialidad?: string;

  @IsOptional()
  @IsString()
  gradoAcademico?: string;

  @IsOptional()
  @IsString()
  institucionEgreso?: string;

  @IsOptional()
  @IsDateString()
  fechaIngreso?: string;

  @IsOptional()
  @IsString()
  condicionLaboral?: string;
}
