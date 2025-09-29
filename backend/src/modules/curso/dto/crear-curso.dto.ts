import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, MinLength, MaxLength, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export enum NivelEducativo {
  INICIAL = 'INICIAL',
  PRIMARIA = 'PRIMARIA', 
  SECUNDARIA = 'SECUNDARIA'
}

export class CrearCompetenciaDto {
  @IsString()
  @MinLength(5, { message: 'El nombre de la competencia debe tener al menos 5 caracteres' })
  @MaxLength(200, { message: 'El nombre de la competencia no puede exceder 200 caracteres' })
  nombre: string;
}

export class CrearCursoDto {
  @IsString()
  @MinLength(3, { message: 'El nombre del curso debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre del curso no puede exceder 100 caracteres' })
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  descripcion?: string;

  @IsInt({ message: 'El nivelId debe ser un número entero' })
  @IsPositive({ message: 'El nivelId debe ser un número positivo' })
  nivelId: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearCompetenciaDto)
  competencias: CrearCompetenciaDto[];
}
