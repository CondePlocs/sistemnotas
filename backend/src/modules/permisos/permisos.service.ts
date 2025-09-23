import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { UpdatePermisosDto } from './dto/update-permisos.dto';
import { BatchUpdatePermisosDto } from './dto/batch-update-permisos.dto';

@Injectable()
export class PermisosService {
  constructor(private prisma: PrismaService) {}

  async actualizarPermisos(batchUpdateDto: BatchUpdatePermisosDto, directorUserId: number) {
    // 1. Verificar que el usuario es director
    const directorInfo = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: directorUserId,
        rol: { nombre: 'DIRECTOR' }
      }
    });

    if (!directorInfo) {
      throw new ForbiddenException('Solo directores pueden gestionar permisos');
    }

    // 2. Verificar que todos los administrativos pertenecen al colegio del director
    const administrativoIds = batchUpdateDto.permisos.map(p => p.administrativoId);
    
    const administrativos = await this.prisma.administrativo.findMany({
      where: {
        id: { in: administrativoIds },
        usuarioRol: {
          colegio_id: directorInfo.colegio_id
        }
      }
    });

    if (administrativos.length !== administrativoIds.length) {
      throw new ForbiddenException('Solo puedes gestionar permisos de administrativos de tu colegio');
    }

    // 3. Actualizar permisos en transacción
    const resultados = await this.prisma.$transaction(async (prisma) => {
      const updates: any[] = [];

      for (const permisoDto of batchUpdateDto.permisos) {
        const resultado = await prisma.permisosAdministrativo.upsert({
          where: {
            administrativoId: permisoDto.administrativoId
          },
          create: {
            administrativoId: permisoDto.administrativoId,
            puedeRegistrarProfesores: permisoDto.puedeRegistrarProfesores ?? false,
            puedeRegistrarApoderados: permisoDto.puedeRegistrarApoderados ?? false,
            puedeRegistrarAdministrativos: permisoDto.puedeRegistrarAdministrativos ?? false,
            puedeRegistrarAlumnos: permisoDto.puedeRegistrarAlumnos ?? false,
            otorgadoPor: directorUserId,
            otorgadoEn: new Date(),
          },
          update: {
            puedeRegistrarProfesores: permisoDto.puedeRegistrarProfesores ?? undefined,
            puedeRegistrarApoderados: permisoDto.puedeRegistrarApoderados ?? undefined,
            puedeRegistrarAdministrativos: permisoDto.puedeRegistrarAdministrativos ?? undefined,
            puedeRegistrarAlumnos: permisoDto.puedeRegistrarAlumnos ?? undefined,
            actualizadoPor: directorUserId,
            actualizadoEn: new Date(),
          },
          include: {
            administrativo: {
              include: {
                usuarioRol: {
                  include: {
                    usuario: {
                      select: {
                        id: true,
                        nombres: true,
                        apellidos: true,
                        email: true,
                      }
                    }
                  }
                }
              }
            }
          }
        });

        updates.push(resultado);
      }

      return updates;
    });

    return {
      message: 'Permisos actualizados exitosamente',
      actualizados: resultados.length,
      permisos: resultados
    };
  }

  async obtenerPermisos(directorUserId: number) {
    // 1. Verificar que el usuario es director
    const directorInfo = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: directorUserId,
        rol: { nombre: 'DIRECTOR' }
      }
    });

    if (!directorInfo) {
      throw new ForbiddenException('Solo directores pueden ver permisos');
    }

    // 2. Obtener todos los administrativos del colegio con sus permisos
    const administrativos = await this.prisma.administrativo.findMany({
      where: {
        usuarioRol: {
          colegio_id: directorInfo.colegio_id
        }
      },
      include: {
        usuarioRol: {
          include: {
            usuario: {
              select: {
                id: true,
                nombres: true,
                apellidos: true,
                email: true,
                dni: true,
              }
            },
            colegio: {
              select: {
                id: true,
                nombre: true,
              }
            }
          }
        },
        permisos: {
          include: {
            usuarioOtorgador: {
              select: {
                id: true,
                nombres: true,
                apellidos: true,
                email: true,
              }
            },
            usuarioActualizador: {
              select: {
                id: true,
                nombres: true,
                apellidos: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: { creadoEn: 'desc' }
    });

    return administrativos;
  }

  async obtenerPermisosAdministrativo(administrativoId: number) {
    // Obtener permisos específicos de un administrativo
    const permisos = await this.prisma.permisosAdministrativo.findUnique({
      where: {
        administrativoId: administrativoId
      },
      include: {
        administrativo: {
          include: {
            usuarioRol: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nombres: true,
                    apellidos: true,
                    email: true,
                  }
                },
                colegio: {
                  select: {
                    id: true,
                    nombre: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    // Si no tiene permisos, devolver permisos por defecto (todos false)
    if (!permisos) {
      return {
        puedeRegistrarProfesores: false,
        puedeRegistrarApoderados: false,
        puedeRegistrarAdministrativos: false,
        puedeRegistrarAlumnos: false,
      };
    }

    return permisos;
  }

  async verificarPermiso(administrativoId: number, tipoPermiso: 'profesores' | 'apoderados' | 'administrativos' | 'alumnos'): Promise<boolean> {
    const permisos = await this.prisma.permisosAdministrativo.findUnique({
      where: {
        administrativoId: administrativoId
      }
    });

    if (!permisos) {
      return false;
    }

    switch (tipoPermiso) {
      case 'profesores':
        return permisos.puedeRegistrarProfesores;
      case 'apoderados':
        return permisos.puedeRegistrarApoderados;
      case 'administrativos':
        return permisos.puedeRegistrarAdministrativos;
      case 'alumnos':
        return permisos.puedeRegistrarAlumnos;
      default:
        return false;
    }
  }
}
