import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';

@Injectable()
export class UbicacionService {
  constructor(private prisma: PrismaService) {}

  async obtenerDres() {
    return this.prisma.dRE.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async obtenerUgelesPorDre(dreId: number) {
    return this.prisma.uGEL.findMany({
      where: { dreId },
      include: {
        dre: true,
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async obtenerUgeles() {
    return this.prisma.uGEL.findMany({
      include: {
        dre: true,
      },
      orderBy: { nombre: 'asc' },
    });
  }
}
