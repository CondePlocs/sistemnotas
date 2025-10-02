import { IsInt, IsString, IsIn, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearRegistroNotaDto {
  @IsInt({ message: 'El ID del alumno debe ser un número entero' })
  @Type(() => Number)
  @IsNotEmpty({ message: 'El ID del alumno es obligatorio' })
  alumnoId: number;

  @IsInt({ message: 'El ID de la evaluación debe ser un número entero' })
  @Type(() => Number)
  @IsNotEmpty({ message: 'El ID de la evaluación es obligatorio' })
  evaluacionId: number;

  @IsString({ message: 'La nota debe ser una cadena de texto' })
  @IsIn(['AD', 'A', 'B', 'C'], { 
    message: 'La nota debe ser una de las siguientes: AD, A, B, C' 
  })
  @IsNotEmpty({ message: 'La nota es obligatoria' })
  nota: string;
}
