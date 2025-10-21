export interface DatosHistoricos {
  ordenTarea: number;
  notaNumerica: number;
}

export interface ResultadoRegresion {
  pendiente: number;
  interseccion: number;
  coeficienteCorrelacion: number;
}

export interface EstimacionRespuesta {
  alumnoId: number;
  competenciaId: number;
  proximaTarea: number;
  notaEstimadaNumerica: number;
  notaEstimadaLiteral: string;
  confianza: number;
  cantidadDatosHistoricos: number;
  mensaje: string;
  regresion: ResultadoRegresion;
}

export interface ConfiguracionIA {
  minimoNotasRequeridas: number;
  notaMaxima: number;
  notaMinima: number;
  umbralConfianzaAlto: number;
  umbralConfianzaMedio: number;
}

export enum NivelConfianza {
  ALTO = 'alto',
  MEDIO = 'medio',
  BAJO = 'bajo',
  INSUFICIENTE = 'insuficiente'
}

export enum NotaLiteral {
  AD = 'AD',
  A = 'A',
  B = 'B', 
  C = 'C'
}
