import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotaCalculoService {
  private readonly logger = new Logger(NotaCalculoService.name);

  /**
   * Detecta automáticamente el tipo de nota ingresada
   */
  detectarTipoNota(input: string): 'alfabetico' | 'numerico' {
    const inputLimpio = input.trim().toUpperCase();
    
    // Verificar si es alfabético (AD, A, B, C)
    const esAlfabetico = /^(AD|A|B|C)$/i.test(inputLimpio);
    if (esAlfabetico) {
      return 'alfabetico';
    }
    
    // Verificar si es numérico (0-20, incluyendo decimales)
    const esNumerico = /^\d+(\.\d+)?$/.test(inputLimpio);
    if (esNumerico) {
      const valor = parseFloat(inputLimpio);
      if (valor >= 0 && valor <= 20) {
        return 'numerico';
      }
    }
    
    throw new Error(`Formato de nota inválido: "${input}". Debe ser AD/A/B/C o un número entre 0-20`);
  }

  /**
   * Convierte cualquier input (numérico o alfabético) a la escala de cálculo 1.0-4.0
   */
  convertirAEscalaCalculo(notaOriginal: string): number {
    const tipo = this.detectarTipoNota(notaOriginal);
    
    if (tipo === 'alfabetico') {
      return this.convertirLetraAEscala4(notaOriginal.trim().toUpperCase());
    } else {
      return this.convertirNumeroAEscala4(parseFloat(notaOriginal.trim()));
    }
  }

  /**
   * Convierte nota alfabética a escala 1.0-4.0
   */
  private convertirLetraAEscala4(nota: string): number {
    const conversion = {
      'AD': 4.0,
      'A': 3.0,
      'B': 2.0,
      'C': 1.0
    };

    const valor = conversion[nota];
    if (valor === undefined) {
      throw new Error(`Nota alfabética no válida: ${nota}. Debe ser AD, A, B o C`);
    }

    return valor;
  }

  /**
   * Convierte nota numérica (0-20) a escala 1.0-4.0
   */
  private convertirNumeroAEscala4(nota: number): number {
    if (nota < 0 || nota > 20) {
      throw new Error(`Nota numérica no válida: ${nota}. Debe estar entre 0 y 20`);
    }

    // Mapeo de rangos numéricos a escala 4.0
    if (nota >= 18) return 4.0;  // AD (Logro destacado)
    if (nota >= 14) return 3.0;  // A (Logro esperado)
    if (nota >= 11) return 2.0;  // B (En proceso)
    return 1.0;                  // C (En inicio)
  }

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

  /**
   * Calcula el promedio usando valores de escala de cálculo (1.0-4.0)
   * Este método es el nuevo estándar para todos los cálculos
   */
  calcularPromedioEscalaCalculo(valoresEscalaCalculo: number[]): {
    promedioNumerico: number;
    propuestaLiteral: string;
    cantidadNotas: number;
  } {
    if (!valoresEscalaCalculo || valoresEscalaCalculo.length === 0) {
      return {
        promedioNumerico: 0,
        propuestaLiteral: 'C',
        cantidadNotas: 0
      };
    }

    const suma = valoresEscalaCalculo.reduce((acc, valor) => acc + valor, 0);
    const promedioNumerico = Math.round((suma / valoresEscalaCalculo.length) * 100) / 100;
    const propuestaLiteral = this.convertirNumeroALetra(promedioNumerico);

    this.logger.debug(`Promedio escala cálculo: [${valoresEscalaCalculo.join(', ')}] → ${promedioNumerico} → ${propuestaLiteral}`);

    return {
      promedioNumerico,
      propuestaLiteral,
      cantidadNotas: valoresEscalaCalculo.length
    };
  }
}
