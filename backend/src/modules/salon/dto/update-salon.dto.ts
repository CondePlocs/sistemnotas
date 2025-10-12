import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional } from 'class-validator';

export class UpdateSalonDto {
  @IsOptional()
  @IsString({ message: 'El grado debe ser un texto' })
  @IsNotEmpty({ message: 'El grado es obligatorio' })
  grado?: string;

  @IsOptional()
  @IsString({ message: 'La sección debe ser un texto' })
  @IsNotEmpty({ message: 'La sección es obligatoria' })
  seccion?: string;

  @IsOptional()
  @IsEnum(['MAÑANA', 'TARDE', 'NOCHE'], { message: 'El turno debe ser MAÑANA, TARDE o NOCHE' })
  turno?: 'MAÑANA' | 'TARDE' | 'NOCHE';

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  activo?: boolean;
}