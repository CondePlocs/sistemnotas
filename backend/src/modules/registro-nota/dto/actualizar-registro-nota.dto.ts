import { IsString, IsIn, IsOptional } from 'class-validator';

export class ActualizarRegistroNotaDto {
  @IsOptional()
  @IsString({ message: 'La nota debe ser una cadena de texto' })
  @IsIn(['AD', 'A', 'B', 'C'], { 
    message: 'La nota debe ser una de las siguientes: AD, A, B, C' 
  })
  nota?: string;
}
