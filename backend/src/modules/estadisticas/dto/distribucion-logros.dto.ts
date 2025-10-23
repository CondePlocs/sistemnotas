import { ApiProperty } from '@nestjs/swagger';

export class LogrosPorColegioDto {
  @ApiProperty({ example: 'Colegio San Martín' })
  nombre: string;

  @ApiProperty({ 
    example: { AD: 25, A: 45, B: 20, C: 10 },
    description: 'Cantidad de notas por cada tipo de logro'
  })
  logros: {
    AD: number;
    A: number;
    B: number;
    C: number;
  };

  @ApiProperty({ example: 100 })
  totalNotas: number;

  @ApiProperty({ 
    example: { AD: 25.0, A: 45.0, B: 20.0, C: 10.0 },
    description: 'Porcentajes de cada tipo de logro'
  })
  porcentajes: {
    AD: number;
    A: number;
    B: number;
    C: number;
  };
}

export class DistribucionLogrosResponseDto {
  @ApiProperty({ 
    type: [LogrosPorColegioDto],
    description: 'Distribución de logros por cada colegio del sistema'
  })
  colegios: LogrosPorColegioDto[];

  @ApiProperty({ example: 5 })
  totalColegios: number;

  @ApiProperty({ example: 500 })
  totalNotasGlobal: number;

  @ApiProperty({ 
    example: { AD: 125, A: 225, B: 100, C: 50 },
    description: 'Resumen global de todos los colegios'
  })
  resumenGlobal: {
    AD: number;
    A: number;
    B: number;
    C: number;
  };
}
