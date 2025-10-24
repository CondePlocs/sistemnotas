import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TipoReporte {
  ALUMNOS_RIESGO_DIRECTOR = 'alumnos_riesgo_director',
  HOJA_REGISTRO_PROFESOR = 'hoja_registro_profesor',
  INTERVENCION_TEMPRANA_PROFESOR = 'intervencion_temprana_profesor',
  MINI_LIBRETA_PADRE = 'mini_libreta_padre',
  TOP_CURSOS_PADRE = 'top_cursos_padre',
}

export enum FormatoReporte {
  PDF = 'pdf',
  EXCEL = 'excel',
}

export class ReporteRequestDto {
  @ApiProperty({
    description: 'Tipo de reporte a generar',
    enum: TipoReporte,
  })
  @IsEnum(TipoReporte)
  tipo: TipoReporte;

  @ApiProperty({
    description: 'Formato del reporte',
    enum: FormatoReporte,
  })
  @IsEnum(FormatoReporte)
  formato: FormatoReporte;

  @ApiPropertyOptional({
    description: 'ID del alumno (para reportes de padre)',
  })
  @IsOptional()
  @IsString()
  alumnoId?: string;

  @ApiPropertyOptional({
    description: 'ID del salón (para reportes de profesor)',
  })
  @IsOptional()
  @IsString()
  salonId?: string;

  @ApiPropertyOptional({
    description: 'ID de la asignación del profesor (para reportes específicos)',
  })
  @IsOptional()
  @IsString()
  profesorAsignacionId?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio del período (opcional)',
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del período (opcional)',
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}

export class ReporteResponseDto {
  @ApiProperty({
    description: 'Buffer del archivo generado (base64)',
  })
  archivo: Buffer;

  @ApiProperty({
    description: 'Nombre del archivo',
  })
  nombreArchivo: string;

  @ApiProperty({
    description: 'Tipo MIME del archivo',
  })
  mimeType: string;

  @ApiProperty({
    description: 'Tamaño del archivo en bytes',
  })
  tamaño: number;
}
