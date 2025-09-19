import { IsString, IsOptional, IsNotEmpty, IsEmail, IsDateString } from 'class-validator';

export class CreateAdministrativoDto {
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

  // Datos específicos del Administrativo
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

  @IsString()
  @IsNotEmpty()
  cargo: string; // Campo obligatorio

  @IsOptional()
  @IsDateString()
  fechaIngreso?: string;

  @IsOptional()
  @IsString()
  condicionLaboral?: string;
}
