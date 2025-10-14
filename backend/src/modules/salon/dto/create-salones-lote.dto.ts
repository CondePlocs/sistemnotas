import { IsString, IsNotEmpty, IsEnum, IsArray, ArrayMinSize, ArrayMaxSize, IsOptional } from 'class-validator';
import { NivelEducativo } from '../../../types/salon.types';
import { Turno } from '@prisma/client';

export class CreateSalonesLoteDto {
  @IsEnum(NivelEducativo, { message: 'El nivel debe ser INICIAL, PRIMARIA o SECUNDARIA' })
  nivel: NivelEducativo;

  @IsString({ message: 'El grado debe ser un texto' })
  @IsNotEmpty({ message: 'El grado es obligatorio' })
  grado: string;

  @IsArray({ message: 'Las secciones deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe especificar al menos una sección' })
  @ArrayMaxSize(20, { message: 'No se pueden crear más de 20 salones a la vez' })
  @IsString({ each: true, message: 'Cada sección debe ser un texto' })
  @IsNotEmpty({ each: true, message: 'Las secciones no pueden estar vacías' })
  secciones: string[];

  @IsEnum(Turno, { message: 'El turno debe ser MAÑANA, TARDE o NOCHE' })
  @IsOptional()
  turno?: Turno;
}
