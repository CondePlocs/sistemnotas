import { IsString, IsEnum, IsInt, IsDateString, Min, Max, Length } from 'class-validator';

// Enum local para validación
enum TipoPeriodo {
  BIMESTRE = 'BIMESTRE',
  TRIMESTRE = 'TRIMESTRE',
  SEMESTRE = 'SEMESTRE'
}

export class CrearPeriodoAcademicoDto {
  @IsEnum(['I', 'II', 'III', 'IV', 'V', 'VI'], { message: 'El nombre debe ser I, II, III, IV, V o VI' })
  nombre: string; // Ahora es número romano

  @IsEnum(TipoPeriodo, { message: 'El tipo debe ser BIMESTRE, TRIMESTRE o SEMESTRE' })
  tipo: TipoPeriodo;

  // Año académico se asigna automáticamente en el frontend, pero validamos que sea correcto
  @IsInt({ message: 'El año académico debe ser un número entero' })
  @Min(2000, { message: 'El año académico debe ser mayor a 2000' })
  anioAcademico: number;

  // Orden se calcula automáticamente del nombre (I=1, II=2, etc.)
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(1, { message: 'El orden debe ser mínimo 1' })
  @Max(6, { message: 'El orden debe ser máximo 6' })
  orden: number;

  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  fechaInicio: string;

  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  fechaFin: string;
}
