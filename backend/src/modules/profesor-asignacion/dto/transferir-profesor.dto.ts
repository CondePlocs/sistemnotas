import { IsInt, IsPositive } from 'class-validator';

export class TransferirProfesorDto {
    @IsInt({ message: 'El ID del nuevo profesor debe ser un número entero' })
    @IsPositive({ message: 'El ID del nuevo profesor debe ser positivo' })
    nuevoProfesorId: number;
}
