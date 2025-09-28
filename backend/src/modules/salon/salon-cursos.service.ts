import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { NivelEducativo } from '../../types/salon.types';

@Injectable()
export class SalonCursosService {
  private readonly logger = new Logger(SalonCursosService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Asigna automáticamente todos los cursos de un nivel específico a un salón
   * Se ejecuta cuando se crea un nuevo salón
   */
  async asignarCursosAutomaticamenteASalon(salonId: number, nivel: NivelEducativo, usuarioId?: number) {
    this.logger.log(`Iniciando asignación automática de cursos para salón ${salonId}, nivel: ${nivel}`);

    try {
      // 1. Buscar todos los cursos activos del nivel especificado
      this.logger.log(`Buscando cursos activos para nivel: ${nivel}`);
      
      const cursosDelNivel = await this.prisma.curso.findMany({
        where: {
          nivel: nivel,
          activo: true
        },
        select: {
          id: true,
          nombre: true,
          nivel: true
        }
      });

      this.logger.log(`Cursos encontrados: ${cursosDelNivel.length}`, cursosDelNivel);

      if (cursosDelNivel.length === 0) {
        this.logger.warn(`No se encontraron cursos activos para el nivel ${nivel}`);
        return {
          success: true,
          cursosAsignados: 0,
          mensaje: `No hay cursos disponibles para el nivel ${nivel}`
        };
      }

      // 2. Crear las asignaciones en lote usando transacción
      this.logger.log(`💾 Iniciando transacción para asignar ${cursosDelNivel.length} cursos`);
      
      const asignaciones = await this.prisma.$transaction(async (tx) => {
        const resultados: any[] = [];

        for (const curso of cursosDelNivel) {
          this.logger.log(`🔄 Procesando curso: ${curso.nombre} (ID: ${curso.id})`);
          
          // Verificar si ya existe la asignación (por si acaso)
          const existeAsignacion = await tx.salonCurso.findUnique({
            where: {
              salonId_cursoId: {
                salonId: salonId,
                cursoId: curso.id
              }
            }
          });

          if (existeAsignacion) {
            this.logger.warn(`⚠️ Ya existe asignación para curso ${curso.nombre} en salón ${salonId}`);
          } else {
            this.logger.log(`✅ Creando nueva asignación para curso ${curso.nombre}`);
            
            const asignacion = await tx.salonCurso.create({
              data: {
                salonId: salonId,
                cursoId: curso.id,
                activo: true,
                asignadoPor: usuarioId || null,
              },
              include: {
                curso: {
                  select: {
                    id: true,
                    nombre: true,
                    nivel: true,
                    color: true
                  }
                }
              }
            });
            
            this.logger.log(`🎉 Asignación creada exitosamente: ${JSON.stringify(asignacion)}`);
            resultados.push(asignacion);
          }
        }

        return resultados;
      });

      this.logger.log(`Asignación automática completada: ${asignaciones.length} cursos asignados al salón ${salonId}`);

      return {
        success: true,
        cursosAsignados: asignaciones.length,
        cursos: asignaciones.map((a: any) => a.curso),
        mensaje: `${asignaciones.length} cursos asignados automáticamente`
      };

    } catch (error) {
      this.logger.error(`Error en asignación automática para salón ${salonId}:`, error);
      throw error;
    }
  }

  /**
   * Asigna automáticamente todos los cursos de un salón a un alumno
   * Se ejecuta cuando se asigna un alumno a un salón
   */
  async asignarCursosAutomaticamenteAAlumno(
    alumnoId: number, 
    salonId: number, 
    usuarioId?: number
  ) {
    this.logger.log(`Iniciando asignación automática de cursos para alumno ${alumnoId} en salón ${salonId}`);

    try {
      // 1. Buscar todos los cursos activos del salón
      const cursosDelSalon = await this.prisma.salonCurso.findMany({
        where: {
          salonId: salonId,
          activo: true
        },
        include: {
          curso: {
            select: {
              id: true,
              nombre: true,
              nivel: true,
              color: true
            }
          }
        }
      });

      if (cursosDelSalon.length === 0) {
        this.logger.warn(`No se encontraron cursos activos para el salón ${salonId}`);
        return {
          success: true,
          cursosAsignados: 0,
          mensaje: `El salón no tiene cursos asignados`
        };
      }

      // 2. Crear las asignaciones alumno-curso en lote
      const asignaciones = await this.prisma.$transaction(async (tx) => {
        const resultados: any[] = [];

        for (const salonCurso of cursosDelSalon) {
          // Verificar si ya existe la asignación
          const existeAsignacion = await tx.alumnoCurso.findUnique({
            where: {
              alumnoId_cursoId: {
                alumnoId: alumnoId,
                cursoId: salonCurso.cursoId
              }
            }
          });

          if (!existeAsignacion) {
            const asignacion = await tx.alumnoCurso.create({
              data: {
                alumnoId: alumnoId,
                cursoId: salonCurso.cursoId,
                salonId: salonId,
                activo: true,
                asignadoPor: usuarioId || null,
              },
              include: {
                curso: {
                  select: {
                    id: true,
                    nombre: true,
                    nivel: true,
                    color: true
                  }
                }
              }
            });
            resultados.push(asignacion);
          }
        }

        return resultados;
      });

      this.logger.log(`Asignación automática completada: ${asignaciones.length} cursos asignados al alumno ${alumnoId}`);

      return {
        success: true,
        cursosAsignados: asignaciones.length,
        cursos: asignaciones.map((a: any) => a.curso),
        mensaje: `${asignaciones.length} cursos heredados del salón`
      };

    } catch (error) {
      this.logger.error(`Error en asignación automática para alumno ${alumnoId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene todos los cursos asignados a un salón
   */
  async obtenerCursosDeSalon(salonId: number) {
    return await this.prisma.salonCurso.findMany({
      where: {
        salonId: salonId,
        activo: true
      },
      include: {
        curso: {
          select: {
            id: true,
            nombre: true,
            nivel: true,
            color: true,
            competencias: {
              where: { activo: true },
              select: {
                id: true,
                nombre: true
              }
            }
          }
        }
      },
      orderBy: {
        curso: {
          nombre: 'asc'
        }
      }
    });
  }

  /**
   * Obtiene todos los cursos asignados a un alumno
   */
  async obtenerCursosDeAlumno(alumnoId: number) {
    return await this.prisma.alumnoCurso.findMany({
      where: {
        alumnoId: alumnoId,
        activo: true
      },
      include: {
        curso: {
          select: {
            id: true,
            nombre: true,
            
            nivel: true,
            color: true,
            competencias: {
              where: { activo: true },
              select: {
                id: true,
                nombre: true
              }
            }
          }
        },
        salon: {
          select: {
            id: true,
            grado: true,
            seccion: true,
            colegioNivel: {
              include: {
                nivel: true
              }
            }
          }
        }
      },
      orderBy: {
        curso: {
          nombre: 'asc'
        }
      }
    });
  }

  /**
   * Desactiva todos los cursos de un alumno (para promoción de año)
   */
  async desactivarCursosDeAlumno(alumnoId: number, usuarioId?: number) {
    this.logger.log(`Desactivando cursos del alumno ${alumnoId}`);

    const resultado = await this.prisma.alumnoCurso.updateMany({
      where: {
        alumnoId: alumnoId,
        activo: true
      },
      data: {
        activo: false,
        // Nota: Prisma no permite actualizar campos de relación en updateMany
        // Si necesitamos auditoría, habría que hacer update individual
      }
    });

    this.logger.log(`${resultado.count} cursos desactivados para el alumno ${alumnoId}`);

    return {
      success: true,
      cursosDesactivados: resultado.count,
      mensaje: `${resultado.count} cursos desactivados`
    };
  }
}
