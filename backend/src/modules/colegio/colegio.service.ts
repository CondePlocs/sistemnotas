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

    // Crear colegio y niveles en una transacción
    const resultado = await this.prisma.$transaction(async (prisma) => {
      // 1. Crear el colegio
      const colegio = await prisma.colegio.create({
        data: {
          nombre: createColegioDto.nombre,
          codigoModular: createColegioDto.codigoModular,
          distrito: createColegioDto.distrito,
          direccion: createColegioDto.direccion,
          ugelId: createColegioDto.ugelId,
        },
      });

      // 2. Crear los niveles permitidos
      const nivelesCreados = await Promise.all(
        createColegioDto.nivelesPermitidos.map(nivel =>
          prisma.colegioNivel.create({
            data: {
              colegioId: colegio.id,
              nivel: nivel as any, // Conversión temporal - el string coincide con el enum
              puedeCrearSalones: true,
              activo: true,
              // TODO: Agregar creadoPor cuando tengamos el usuario autenticado
            },
          })
        )
      );

      // 3. Retornar colegio con relaciones
      return prisma.colegio.findUnique({
        where: { id: colegio.id },
        include: {
          ugel: {
            include: {
              dre: true,
            },
          },
          nivelesPermitidos: true, // ← Incluir niveles creados
        },
      });
    });

    return resultado;
  }

  async obtenerColegios() {
    return this.prisma.colegio.findMany({
      include: {
        ugel: {
          include: {
            dre: true,
          },
        },
        nivelesPermitidos: true, // ← Incluir niveles permitidos
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
        nivelesPermitidos: true, // ← Incluir niveles permitidos
      },
    });

    if (!colegio) {
      throw new NotFoundException('Colegio no encontrado');
    }

    return colegio;
  }

  // Método para directores - Obtener niveles de SU colegio
  async obtenerNivelesPorDirector(usuarioId: number) {
    // 1. Buscar el director y su colegio
    const director = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: usuarioId,
        rol: {
          nombre: 'DIRECTOR'
        }
      },
      include: {
        colegio: {
          include: {
            nivelesPermitidos: {
              where: {
                activo: true // Solo niveles activos
              },
              select: {
                nivel: true,
                puedeCrearSalones: true
              }
            }
          }
        }
      }
    });

    if (!director || !director.colegio) {
      throw new NotFoundException('Director no encontrado o no tiene colegio asignado');
    }

    // 2. Extraer solo los niveles
    const niveles = director.colegio.nivelesPermitidos
      .filter(nivel => nivel.puedeCrearSalones) // Solo niveles donde puede crear salones
      .map(nivel => nivel.nivel);

    return {
      colegioId: director.colegio.id,
      colegioNombre: director.colegio.nombre,
      nivelesPermitidos: niveles
    };
  }
}
