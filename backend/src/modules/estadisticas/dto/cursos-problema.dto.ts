import { ApiProperty } from '@nestjs/swagger';

export class CursoProblemaDto {
  @ApiProperty({ example: 'Matemática' })
  nombre: string;

  @ApiProperty({ example: 150 })
  totalAlumnos: number;

  @ApiProperty({ example: 45 })
  alumnosProblema: number;

  @ApiProperty({ example: 30.0 })
  porcentajeProblema: number;

  @ApiProperty({ 
    example: { B: 25, C: 20 },
    description: 'Desglose de alumnos con problemas por tipo de nota'
  })
  detalleProblemas: {
    B: number;
    C: number;
  };

  @ApiProperty({ example: 'PRIMARIA' })
  nivel: string;
}

export class CursosProblemaResponseDto {
  @ApiProperty({ 
    type: [CursoProblemaDto],
    description: 'Top cursos con mayor porcentaje de alumnos en B o C'
  })
  cursosProblema: CursoProblemaDto[];

  @ApiProperty({ example: 10 })
  totalCursos: number;

  @ApiProperty({ example: 5 })
  cursosAnalizados: number;

  @ApiProperty({ 
    example: 25.5,
    description: 'Promedio de porcentaje de problemas en todos los cursos'
  })
  promedioProblemasGlobal: number;
}
