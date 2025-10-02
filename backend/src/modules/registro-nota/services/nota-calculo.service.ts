import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotaCalculoService {
  private readonly logger = new Logger(NotaCalculoService.name);

  /**
   * Convierte una nota literal a su valor numérico para cálculos
   * AD = 4.0, A = 3.0, B = 2.0, C = 1.0
   */
  convertirLetraANumero(nota: string): number {
    const conversion = {
      'AD': 4.0,
      'A': 3.0,
      'B': 2.0,
      'C': 1.0
    };

    const valor = conversion[nota];
    if (valor === undefined) {
      this.logger.warn(`Nota no válida recibida: ${nota}`);
      throw new Error(`Nota no válida: ${nota}. Debe ser AD, A, B o C`);
    }

    return valor;
  }

  /**
   * Convierte un promedio numérico a su propuesta de letra
   * ≥3.5 = AD, ≥2.5 y <3.5 = A, ≥1.5 y <2.5 = B, <1.5 = C
   */
  convertirNumeroALetra(promedio: number): string {
    if (promedio >= 3.5) return 'AD';
    if (promedio >= 2.5) return 'A';
    if (promedio >= 1.5) return 'B';
    return 'C';
  }

  /**
   * Calcula el promedio numérico de un conjunto de notas literales
   */
  calcularPromedioNumerico(notasLiterales: string[]): number {
    if (!notasLiterales || notasLiterales.length === 0) {
      return 0;
    }

    const valoresNumericos = notasLiterales.map(nota => 
      this.convertirLetraANumero(nota)
    );

    const suma = valoresNumericos.reduce((acc, valor) => acc + valor, 0);
    const promedio = suma / valoresNumericos.length;

    // Redondear a 2 decimales para precisión
    return Math.round(promedio * 100) / 100;
  }

  /**
   * Calcula el promedio de competencia y devuelve la propuesta literal
   */
  calcularPromedioCompetencia(notasLiterales: string[]): {
    promedioNumerico: number;
    propuestaLiteral: string;
    cantidadNotas: number;
  } {
    const promedioNumerico = this.calcularPromedioNumerico(notasLiterales);
    const propuestaLiteral = this.convertirNumeroALetra(promedioNumerico);

    this.logger.debug(`Promedio competencia calculado: ${notasLiterales.join(', ')} → ${promedioNumerico} → ${propuestaLiteral}`);

    return {
      promedioNumerico,
      propuestaLiteral,
      cantidadNotas: notasLiterales.length
    };
  }

  /**
   * Calcula el promedio de curso basado en promedios de competencias
   */
  calcularPromedioCurso(promediosCompetencias: number[]): {
    promedioNumerico: number;
    propuestaLiteral: string;
    cantidadCompetencias: number;
  } {
    if (!promediosCompetencias || promediosCompetencias.length === 0) {
      return {
        promedioNumerico: 0,
        propuestaLiteral: 'C',
        cantidadCompetencias: 0
      };
    }

    const suma = promediosCompetencias.reduce((acc, promedio) => acc + promedio, 0);
    const promedioNumerico = Math.round((suma / promediosCompetencias.length) * 100) / 100;
    const propuestaLiteral = this.convertirNumeroALetra(promedioNumerico);

    this.logger.debug(`Promedio curso calculado: [${promediosCompetencias.join(', ')}] → ${promedioNumerico} → ${propuestaLiteral}`);

    return {
      promedioNumerico,
      propuestaLiteral,
      cantidadCompetencias: promediosCompetencias.length
    };
  }

  /**
   * Calcula el promedio anual de un curso basado en promedios de períodos
   */
  calcularPromedioAnual(promediosPeriodos: number[]): {
    promedioNumerico: number;
    propuestaLiteral: string;
    cantidadPeriodos: number;
  } {
    if (!promediosPeriodos || promediosPeriodos.length === 0) {
      return {
        promedioNumerico: 0,
        propuestaLiteral: 'C',
        cantidadPeriodos: 0
      };
    }

    const suma = promediosPeriodos.reduce((acc, promedio) => acc + promedio, 0);
    const promedioNumerico = Math.round((suma / promediosPeriodos.length) * 100) / 100;
    const propuestaLiteral = this.convertirNumeroALetra(promedioNumerico);

    this.logger.debug(`Promedio anual calculado: [${promediosPeriodos.join(', ')}] → ${promedioNumerico} → ${propuestaLiteral}`);

    return {
      promedioNumerico,
      propuestaLiteral,
      cantidadPeriodos: promediosPeriodos.length
    };
  }
}
