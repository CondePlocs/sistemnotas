import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { NivelEducativo } from '../../../types/salon.types';
import { Turno } from '../../../../generated/prisma';

export class CreateSalonDto {
  @IsEnum(NivelEducativo, { message: 'El nivel debe ser INICIAL, PRIMARIA o SECUNDARIA' })
  nivel: NivelEducativo;

  @IsString({ message: 'El grado debe ser un texto' })
  @IsNotEmpty({ message: 'El grado es obligatorio' })
  grado: string;

  @IsString({ message: 'La sección debe ser un texto' })
  @IsNotEmpty({ message: 'La sección es obligatoria' })
  seccion: string;

  @IsEnum(Turno, { message: 'El turno debe ser MAÑANA, TARDE o NOCHE' })
  @IsOptional()
  turno?: Turno;
}
