import { IsString, IsOptional, ValidatorConstraint, ValidatorConstraintInterface, Validate } from 'class-validator';

@ValidatorConstraint({ name: 'isValidNota', async: false })
export class IsValidNotaConstraint implements ValidatorConstraintInterface {
  validate(nota: string): boolean {
    if (!nota || typeof nota !== 'string') {
      return false;
    }

    const notaLimpia = nota.trim().toUpperCase();
    
    // Verificar si es alfabético (AD, A, B, C)
    const esAlfabetico = /^(AD|A|B|C)$/i.test(notaLimpia);
    if (esAlfabetico) {
      return true;
    }
    
    // Verificar si es numérico (0-20, incluyendo decimales)
    const esNumerico = /^\d+(\.\d+)?$/.test(notaLimpia);
    if (esNumerico) {
      const valor = parseFloat(notaLimpia);
      return valor >= 0 && valor <= 20;
    }
    
    return false;
  }

  defaultMessage(): string {
    return 'La nota debe ser AD/A/B/C o un número entre 0-20';
  }
}

export class ActualizarRegistroNotaDto {
  @IsOptional()
  @IsString({ message: 'La nota debe ser una cadena de texto' })
  @Validate(IsValidNotaConstraint)
  nota?: string;
}
