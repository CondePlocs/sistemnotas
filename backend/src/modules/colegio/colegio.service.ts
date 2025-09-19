import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { CreateColegioDto } from './dto/create-colegio.dto';

@Injectable()
export class ColegioService {
  constructor(private prisma: PrismaService) {}

  async crearColegio(createColegioDto: CreateColegioDto) {
    // Verificar que la UGEL existe
    const ugel = await this.prisma.uGEL.findUnique({
      where: { id: createColegioDto.ugelId },
      include: { dre: true },
    });

    if (!ugel) {
      throw new NotFoundException('UGEL no encontrada');
    }

    const colegio = await this.prisma.colegio.create({
      data: {
        nombre: createColegioDto.nombre,
        codigoModular: createColegioDto.codigoModular,
        distrito: createColegioDto.distrito,
        direccion: createColegioDto.direccion,
        nivel: createColegioDto.nivel,
        ugelId: createColegioDto.ugelId,
      },
      include: {
        ugel: {
          include: {
            dre: true,
          },
        },
      },
    });

    return colegio;
  }

  async obtenerColegios() {
    return this.prisma.colegio.findMany({
      include: {
        ugel: {
          include: {
            dre: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async obtenerColegio(id: number) {
    const colegio = await this.prisma.colegio.findUnique({
      where: { id },
      include: {
        ugel: {
          include: {
            dre: true,
          },
        },
      },
    });

    if (!colegio) {
      throw new NotFoundException('Colegio no encontrado');
    }

    return colegio;
  }
}
