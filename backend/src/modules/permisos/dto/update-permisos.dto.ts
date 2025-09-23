import { IsBoolean, IsOptional, IsInt, IsNotEmpty } from 'class-validator';

export class UpdatePermisosDto {
  @IsInt()
  @IsNotEmpty()
  administrativoId: number;

  @IsOptional()
  @IsBoolean()
  puedeRegistrarProfesores?: boolean;

  @IsOptional()
  @IsBoolean()
  puedeRegistrarApoderados?: boolean;

  @IsOptional()
  @IsBoolean()
  puedeRegistrarAdministrativos?: boolean;

  @IsOptional()
  @IsBoolean()
  puedeRegistrarAlumnos?: boolean;
}
