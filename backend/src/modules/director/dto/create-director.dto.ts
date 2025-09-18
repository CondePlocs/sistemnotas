import { IsString, IsOptional, IsInt, IsNotEmpty, IsEmail, IsDateString } from 'class-validator';

export class CreateDirectorDto {
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

  // ID del colegio al que se asignará
  @IsInt()
  @IsNotEmpty()
  colegioId: number;
}
