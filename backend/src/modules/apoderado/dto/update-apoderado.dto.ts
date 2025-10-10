import { IsOptional, IsString, IsEmail, IsDateString, IsIn, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateApoderadoDto {
  @IsOptional()
  @IsEmail()
  email?: string;

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

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsIn(['masculino', 'femenino'])
  sexo?: string;

  @IsOptional()
  @IsIn(['soltero', 'casado', 'divorciado', 'viudo'])
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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RelacionApoderadoAlumnoDto)
  alumnos?: RelacionApoderadoAlumnoDto[];
}

export class RelacionApoderadoAlumnoDto {
  @IsOptional()
  alumnoId?: number;

  @IsOptional()
  @IsIn(['padre', 'madre', 'tutor', 'abuelo', 'abuela', 'tio', 'tia', 'hermano', 'hermana', 'otro'])
  parentesco?: string;

  @IsOptional()
  esPrincipal?: boolean;
}
