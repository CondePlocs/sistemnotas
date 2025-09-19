import { IsString, IsOptional, IsNotEmpty, IsEmail, IsDateString } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  parentesco: string; // Campo obligatorio

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
}
