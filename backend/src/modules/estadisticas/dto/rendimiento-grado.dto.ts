import { ApiProperty } from '@nestjs/swagger';

export class LogrosPorGradoDto {
  @ApiProperty({ description: 'Grado y nivel (ej: "1° Primaria")', example: '1° Primaria' })
  grado: string;

  @ApiProperty({ description: 'Total de alumnos en el grado', example: 25 })
  totalAlumnos: number;

  @ApiProperty({ 
    description: 'Distribución de logros por tipo',
    example: { AD: 5, A: 10, B: 8, C: 2 }
  })
  logros: {
    AD: number;
    A: number;
    B: number;
    C: number;
  };

  @ApiProperty({ description: 'Promedio numérico del grado', example: 2.85 })
  promedioNumerico: number;

  @ApiProperty({ 
    description: 'Porcentajes de cada logro',
    example: { AD: 20.0, A: 40.0, B: 32.0, C: 8.0 }
  })
  porcentajes: {
    AD: number;
    A: number;
    B: number;
    C: number;
  };
}

export class RendimientoPorGradoResponseDto {
  @ApiProperty({ 
    description: 'Lista de grados con su rendimiento',
    type: [LogrosPorGradoDto]
  })
  grados: LogrosPorGradoDto[];

  @ApiProperty({ description: 'Total de grados analizados', example: 6 })
  totalGrados: number;
}
