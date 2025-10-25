import { NotaCalculoService } from '../src/modules/registro-nota/services/nota-calculo.service';

describe('NotaCalculoService - Sistema Dual', () => {
  let service: NotaCalculoService;

  beforeEach(() => {
    service = new NotaCalculoService();
  });

  describe('detectarTipoNota', () => {
    it('debe detectar notas alfabéticas correctamente', () => {
      expect(service.detectarTipoNota('AD')).toBe('alfabetico');
      expect(service.detectarTipoNota('A')).toBe('alfabetico');
      expect(service.detectarTipoNota('B')).toBe('alfabetico');
      expect(service.detectarTipoNota('C')).toBe('alfabetico');
      expect(service.detectarTipoNota('ad')).toBe('alfabetico'); // Case insensitive
      expect(service.detectarTipoNota(' A ')).toBe('alfabetico'); // Con espacios
    });

    it('debe detectar notas numéricas correctamente', () => {
      expect(service.detectarTipoNota('20')).toBe('numerico');
      expect(service.detectarTipoNota('18')).toBe('numerico');
      expect(service.detectarTipoNota('15.5')).toBe('numerico');
      expect(service.detectarTipoNota('0')).toBe('numerico');
      expect(service.detectarTipoNota('10.75')).toBe('numerico');
    });

    it('debe rechazar formatos inválidos', () => {
      expect(() => service.detectarTipoNota('X')).toThrow();
      expect(() => service.detectarTipoNota('21')).toThrow();
      expect(() => service.detectarTipoNota('-5')).toThrow();
      expect(() => service.detectarTipoNota('ABC')).toThrow();
      expect(() => service.detectarTipoNota('')).toThrow();
    });
  });

  describe('convertirAEscalaCalculo', () => {
    it('debe convertir notas alfabéticas a escala 1.0-4.0', () => {
      expect(service.convertirAEscalaCalculo('AD')).toBe(4.0);
      expect(service.convertirAEscalaCalculo('A')).toBe(3.0);
      expect(service.convertirAEscalaCalculo('B')).toBe(2.0);
      expect(service.convertirAEscalaCalculo('C')).toBe(1.0);
    });

    it('debe convertir notas numéricas a escala 1.0-4.0', () => {
      // Rango AD (18-20)
      expect(service.convertirAEscalaCalculo('20')).toBe(4.0);
      expect(service.convertirAEscalaCalculo('18')).toBe(4.0);
      expect(service.convertirAEscalaCalculo('19.5')).toBe(4.0);
      
      // Rango A (14-17)
      expect(service.convertirAEscalaCalculo('17')).toBe(3.0);
      expect(service.convertirAEscalaCalculo('14')).toBe(3.0);
      expect(service.convertirAEscalaCalculo('15.5')).toBe(3.0);
      
      // Rango B (11-13)
      expect(service.convertirAEscalaCalculo('13')).toBe(2.0);
      expect(service.convertirAEscalaCalculo('11')).toBe(2.0);
      expect(service.convertirAEscalaCalculo('12.5')).toBe(2.0);
      
      // Rango C (0-10)
      expect(service.convertirAEscalaCalculo('10')).toBe(1.0);
      expect(service.convertirAEscalaCalculo('0')).toBe(1.0);
      expect(service.convertirAEscalaCalculo('5')).toBe(1.0);
    });
  });

  describe('calcularPromedioEscalaCalculo', () => {
    it('debe calcular promedios correctamente usando escala 1.0-4.0', () => {
      const valores = [4.0, 3.0, 2.0, 1.0]; // AD, A, B, C
      const resultado = service.calcularPromedioEscalaCalculo(valores);
      
      expect(resultado.promedioNumerico).toBe(2.5);
      expect(resultado.propuestaLiteral).toBe('A');
      expect(resultado.cantidadNotas).toBe(4);
    });

    it('debe manejar arrays vacíos', () => {
      const resultado = service.calcularPromedioEscalaCalculo([]);
      
      expect(resultado.promedioNumerico).toBe(0);
      expect(resultado.propuestaLiteral).toBe('C');
      expect(resultado.cantidadNotas).toBe(0);
    });
  });

  describe('Integración: Flujo completo dual', () => {
    it('debe procesar correctamente un mix de notas alfabéticas y numéricas', () => {
      const notasOriginales = ['AD', '18', 'A', '15', 'B', '12', 'C', '8'];
      
      // Convertir todas a escala de cálculo
      const valoresEscala = notasOriginales.map(nota => 
        service.convertirAEscalaCalculo(nota)
      );
      
      // Verificar conversiones individuales
      expect(valoresEscala).toEqual([4.0, 4.0, 3.0, 3.0, 2.0, 2.0, 1.0, 1.0]);
      
      // Calcular promedio
      const resultado = service.calcularPromedioEscalaCalculo(valoresEscala);
      
      expect(resultado.promedioNumerico).toBe(2.5);
      expect(resultado.propuestaLiteral).toBe('A');
      expect(resultado.cantidadNotas).toBe(8);
    });

    it('debe mantener consistencia entre métodos antiguos y nuevos para notas alfabéticas', () => {
      const notasAlfabeticas = ['AD', 'A', 'B', 'C'];
      
      // Método antiguo
      const promedioAntiguo = service.calcularPromedioCompetencia(notasAlfabeticas);
      
      // Método nuevo
      const valoresEscala = notasAlfabeticas.map(nota => 
        service.convertirAEscalaCalculo(nota)
      );
      const promedioNuevo = service.calcularPromedioEscalaCalculo(valoresEscala);
      
      // Deben dar el mismo resultado
      expect(promedioAntiguo.promedioNumerico).toBe(promedioNuevo.promedioNumerico);
      expect(promedioAntiguo.propuestaLiteral).toBe(promedioNuevo.propuestaLiteral);
    });
  });
});
