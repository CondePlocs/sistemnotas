import { IsString, MinLength } from 'class-validator';

export class ActivarPeriodoAcademicoDto {
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(1, { message: 'La contraseña es requerida' })
  password: string;
}
