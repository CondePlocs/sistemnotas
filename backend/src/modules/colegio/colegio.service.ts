import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { CreateColegioDto } from './dto/create-colegio.dto';
import { UpdateColegioDto } from './dto/update-colegio.dto';

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

      // 2. Crear los niveles permitidos usando tabla Nivel
      const nivelesCreados = await Promise.all(
        createColegioDto.nivelesPermitidos.map(async (nombreNivel) => {
          // Buscar el ID del nivel en la tabla Nivel
          const nivel = await prisma.nivel.findUnique({
            where: { nombre: nombreNivel }
          });
          
          if (!nivel) {
            throw new NotFoundException(`Nivel educativo '${nombreNivel}' no encontrado`);
          }

          return prisma.colegioNivel.create({
            data: {
              colegioId: colegio.id,
              nivelId: nivel.id, // ← Usar FK a tabla Nivel
              puedeCrearSalones: true,
              activo: true,
              // TODO: Agregar creadoPor cuando tengamos el usuario autenticado
            },
          });
        })
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
        nivelesPermitidos: {
          include: {
            nivel: true // ← Incluir relación con tabla Nivel
          }
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
        nivelesPermitidos: {
          include: {
            nivel: true // ← Incluir relación con tabla Nivel
          }
        },
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
              include: {
                nivel: true // ← Incluir datos de la tabla Nivel
              }
            }
          }
        }
      }
    });

    if (!director || !director.colegio) {
      throw new NotFoundException('Director no encontrado o no tiene colegio asignado');
    }

    // 2. Extraer solo los niveles activos donde puede crear salones
    const niveles = director.colegio.nivelesPermitidos
      .filter(colegioNivel => colegioNivel.puedeCrearSalones && colegioNivel.nivel?.activo)
      .map(colegioNivel => ({
        id: colegioNivel.nivel!.id,
        nombre: colegioNivel.nivel!.nombre,
        puedeCrearSalones: colegioNivel.puedeCrearSalones
      }));

    return {
      colegioId: director.colegio.id,
      colegioNombre: director.colegio.nombre,
      nivelesPermitidos: niveles
    };
  }

  // Método para obtener colegios sin director asignado
  async obtenerColegiosSinDirector() {
    // Obtener todos los colegios
    const colegios = await this.prisma.colegio.findMany({
      include: {
        ugel: {
          include: {
            dre: true,
          },
        },
        nivelesPermitidos: {
          include: {
            nivel: true // ← Incluir relación con tabla Nivel
          }
        },
        usuariosRol: {
          where: {
            rol: {
              nombre: 'DIRECTOR'
            }
          },
          include: {
            usuario: {
              select: {
                estado: true
              }
            }
          }
        }
      },
      orderBy: { nombre: 'asc' },
    });

    // Filtrar colegios que no tienen director activo
    return colegios.filter(colegio => {
      const tieneDirectorActivo = colegio.usuariosRol.some(
        usuarioRol => usuarioRol.usuario.estado === 'activo'
      );
      return !tieneDirectorActivo;
    }).map(colegio => {
      // Remover la relación usuariosRol del resultado
      const { usuariosRol, ...colegioSinRoles } = colegio;
      return colegioSinRoles;
    });
  }

  async actualizarColegio(id: number, updateColegioDto: UpdateColegioDto) {
    // Verificar que el colegio existe
    const colegioExistente = await this.prisma.colegio.findUnique({
      where: { id },
      include: { nivelesPermitidos: { include: { nivel: true } } }
    });

    if (!colegioExistente) {
      throw new NotFoundException('Colegio no encontrado');
    }

    // Si se actualiza la UGEL, verificar que existe
    if (updateColegioDto.ugelId) {
      const ugel = await this.prisma.uGEL.findUnique({
        where: { id: updateColegioDto.ugelId },
      });

      if (!ugel) {
        throw new NotFoundException('UGEL no encontrada');
      }
    }

    // Actualizar en transacción
    const resultado = await this.prisma.$transaction(async (prisma) => {
      // 1. Actualizar datos básicos del colegio
      const colegio = await prisma.colegio.update({
        where: { id },
        data: {
          nombre: updateColegioDto.nombre,
          codigoModular: updateColegioDto.codigoModular,
          distrito: updateColegioDto.distrito,
          direccion: updateColegioDto.direccion,
          ugelId: updateColegioDto.ugelId,
        },
      });

      // 2. Si se actualizan los niveles permitidos
      if (updateColegioDto.nivelesPermitidos) {
        // Eliminar niveles antiguos
        await prisma.colegioNivel.deleteMany({
          where: { colegioId: id }
        });

        // Crear nuevos niveles
        await Promise.all(
          updateColegioDto.nivelesPermitidos.map(async (nombreNivel) => {
            const nivel = await prisma.nivel.findUnique({
              where: { nombre: nombreNivel }
            });
            
            if (!nivel) {
              throw new NotFoundException(`Nivel educativo '${nombreNivel}' no encontrado`);
            }

            return prisma.colegioNivel.create({
              data: {
                colegioId: colegio.id,
                nivelId: nivel.id,
                puedeCrearSalones: true,
                activo: true,
              },
            });
          })
        );
      }

      // 3. Retornar colegio actualizado con relaciones
      return prisma.colegio.findUnique({
        where: { id },
        include: {
          ugel: {
            include: {
              dre: true,
            },
          },
          nivelesPermitidos: {
            include: {
              nivel: true
            }
          },
        },
      });
    });

    return resultado;
  }
}
