import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CrearRegistroNotaDto } from './crear-registro-nota.dto';

export class GuardarNotasLoteDto {
  @IsArray({ message: 'Las notas deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos una nota' })
  @ValidateNested({ each: true })
  @Type(() => CrearRegistroNotaDto)
  notas: CrearRegistroNotaDto[];
}
