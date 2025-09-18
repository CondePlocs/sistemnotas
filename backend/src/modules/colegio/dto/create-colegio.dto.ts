import { IsString, IsOptional, IsInt, IsNotEmpty } from 'class-validator';

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

  @IsOptional()
  @IsString()
  nivel?: string;

  @IsInt()
  @IsNotEmpty()
  ugelId: number;
}
