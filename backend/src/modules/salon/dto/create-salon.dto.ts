import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { NivelEducativo } from '../../../types/salon.types';

export class CreateSalonDto {
  @IsEnum(NivelEducativo, { message: 'El nivel debe ser INICIAL, PRIMARIA o SECUNDARIA' })
  nivel: NivelEducativo;

  @IsString({ message: 'El grado debe ser un texto' })
  @IsNotEmpty({ message: 'El grado es obligatorio' })
  grado: string;

  @IsString({ message: 'La sección debe ser un texto' })
  @IsNotEmpty({ message: 'La sección es obligatoria' })
  seccion: string;
}
