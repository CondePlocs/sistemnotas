import { ApiProperty } from '@nestjs/swagger';

export class CursoProblemaColegioDto {
  @ApiProperty({ description: 'Nombre del curso', example: 'Matemática' })
  nombre: string;

  @ApiProperty({ description: 'Total de alumnos únicos en el curso', example: 15 })
  totalAlumnos: number;

  @ApiProperty({ description: 'Número de alumnos con problemas (notas B y C)', example: 8 })
  alumnosProblema: number;

  @ApiProperty({ description: 'Porcentaje de problemas', example: 53.33 })
  porcentajeProblema: number;

  @ApiProperty({ 
    description: 'Desglose detallado de problemas',
    example: { B: 5, C: 3 }
  })
  detalleProblemas: {
    B: number;
    C: number;
  };

  @ApiProperty({ description: 'Nivel de análisis', example: 'COLEGIO' })
  nivel: string;
}

export class CursosProblemaColegioResponseDto {
  @ApiProperty({ 
    description: 'Lista de cursos con problemas (Top 5)',
    type: [CursoProblemaColegioDto]
  })
  cursosProblema: CursoProblemaColegioDto[];

  @ApiProperty({ description: 'Total de cursos en el sistema', example: 12 })
  totalCursos: number;

  @ApiProperty({ description: 'Cursos analizados (con suficientes datos)', example: 5 })
  cursosAnalizados: number;

  @ApiProperty({ description: 'Promedio de problemas local del colegio', example: 45.2 })
  promedioProblemasLocal: number;
}
