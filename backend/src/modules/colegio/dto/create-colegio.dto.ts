import { IsString, IsOptional, IsInt, IsNotEmpty, IsArray, IsIn } from 'class-validator';

export class CreateColegioDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  codigoModular?: string;

  @IsOptional()
  @IsString()
  distrito?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsInt()
  @IsNotEmpty()
  ugelId: number;

  @IsArray()
  @IsIn(['INICIAL', 'PRIMARIA', 'SECUNDARIA'], { each: true })
  @IsNotEmpty()
  nivelesPermitidos: ('INICIAL' | 'PRIMARIA' | 'SECUNDARIA')[]; // ← NUEVO CAMPO - Siguiendo convención del proyecto
}
