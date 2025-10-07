import { IsString, IsOptional, IsInt, IsArray } from 'class-validator';

export class UpdateColegioDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  codigoModular?: string;

  @IsOptional()
  @IsString()
  distrito?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsInt()
  ugelId?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nivelesPermitidos?: string[];
}
