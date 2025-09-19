import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdatePermisosDto } from './update-permisos.dto';

export class BatchUpdatePermisosDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePermisosDto)
  permisos: UpdatePermisosDto[];
}
