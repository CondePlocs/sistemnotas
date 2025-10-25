import { IsInt, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class EstimacionNotaDto {
  @ApiProperty({
    description: 'ID del alumno para quien se estima la nota',
    example: 1,
    minimum: 1
  })
  @IsInt({ message: 'El ID del alumno debe ser un número entero' })
  @IsPositive({ message: 'El ID del alumno debe ser positivo' })
  @Type(() => Number)
  alumnoId: number;

  @ApiProperty({
    description: 'ID de la competencia a evaluar',
    example: 1,
    minimum: 1
  })
  @IsInt({ message: 'El ID de la competencia debe ser un número entero' })
  @IsPositive({ message: 'El ID de la competencia debe ser positivo' })
  @Type(() => Number)
  competenciaId: number;

  @ApiProperty({
    description: 'ID de la asignación del profesor (para aislamiento de cuadernos)',
    example: 45,
    minimum: 1
  })
  @IsInt({ message: 'El ID de la asignación del profesor debe ser un número entero' })
  @IsPositive({ message: 'El ID de la asignación del profesor debe ser positivo' })
  @Type(() => Number)
  profesorAsignacionId: number;

  @ApiProperty({
    description: 'Número de la próxima tarea/evaluación a estimar',
    example: 4,
    minimum: 1
  })
  @IsInt({ message: 'El número de tarea debe ser un número entero' })
  @Min(1, { message: 'El número de tarea debe ser mayor a 0' })
  @Type(() => Number)
  proximaTarea: number;
}
