import { IsString, IsOptional, IsEnum, IsDateString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export enum SexoAlumno {
  masculino = 'masculino',
  femenino = 'femenino'
}

export class CrearAlumnoDto {
  @IsOptional()
  @IsString({ message: 'El DNI debe ser una cadena de texto' })
  @Length(8, 8, { message: 'El DNI debe tener exactamente 8 dígitos' })
  @Matches(/^\d{8}$/, { message: 'El DNI debe contener solo números' })
  dni?: string;

  @IsOptional()
  @IsString({ message: 'El código de alumno debe ser una cadena de texto' })
  @Length(3, 20, { message: 'El código de alumno debe tener entre 3 y 20 caracteres' })
  @Transform(({ value }) => value?.trim())
  codigoAlumno?: string;

  @IsString({ message: 'Los nombres son obligatorios' })
  @Length(2, 100, { message: 'Los nombres deben tener entre 2 y 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  nombres: string;

  @IsString({ message: 'Los apellidos son obligatorios' })
  @Length(2, 100, { message: 'Los apellidos deben tener entre 2 y 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  apellidos: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida' })
  fechaNacimiento?: string;

  @IsOptional()
  @IsEnum(SexoAlumno, { message: 'El sexo debe ser masculino o femenino' })
  sexo?: SexoAlumno;

  @IsOptional()
  @IsString({ message: 'La nacionalidad debe ser una cadena de texto' })
  @Length(2, 50, { message: 'La nacionalidad debe tener entre 2 y 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  nacionalidad?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @Length(5, 200, { message: 'La dirección debe tener entre 5 y 200 caracteres' })
  @Transform(({ value }) => value?.trim())
  direccion?: string;

  @IsOptional()
  @IsString({ message: 'El distrito debe ser una cadena de texto' })
  @Length(2, 100, { message: 'El distrito debe tener entre 2 y 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  distrito?: string;

  @IsOptional()
  @IsString({ message: 'El número de contacto debe ser una cadena de texto' })
  @Length(9, 15, { message: 'El número de contacto debe tener entre 9 y 15 dígitos' })
  @Matches(/^\d+$/, { message: 'El número de contacto debe contener solo números' })
  numeroContacto?: string;
}
