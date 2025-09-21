import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { NivelEducativo } from '../../../types/salon.types';

export class UpdateSalonDto {
  @IsOptional()
  @IsEnum(NivelEducativo, { message: 'El nivel debe ser INICIAL, PRIMARIA o SECUNDARIA' })
  nivel?: NivelEducativo;

  @IsOptional()
  @IsString({ message: 'El grado debe ser un texto' })
  @IsNotEmpty({ message: 'El grado es obligatorio' })
  grado?: string;

  @IsOptional()
  @IsString({ message: 'La sección debe ser un texto' })
  @IsNotEmpty({ message: 'La sección es obligatoria' })
  seccion?: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  activo?: boolean;
}