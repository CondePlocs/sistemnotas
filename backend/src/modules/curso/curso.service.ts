import { Injectable, NotFoundException, ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { CrearCursoDto, ActualizarCursoDto, NivelEducativo } from './dto';

@Injectable()
export class CursoService {
  private readonly logger = new Logger(CursoService.name);

  constructor(private prisma: PrismaService) {}

  // Crear curso con competencias
  async crear(usuarioId: number, crearCursoDto: CrearCursoDto) {
    // Verificar que el usuario sea Owner
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        roles: {
          include: { 
            rol: true 
          }
        }
      }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const esOwner = usuario.roles.some(ur => ur.rol.nombre === 'OWNER');
    if (!esOwner) {
      throw new ForbiddenException('Solo los owners pueden crear cursos');
    }

    // Verificar que no exista un curso con el mismo nombre y nivel
    const cursoExistente = await this.prisma.curso.findFirst({
      where: {
        nombre: crearCursoDto.nombre,
        nivelId: crearCursoDto.nivelId,
        activo: true
      }
    });

    if (cursoExistente) {
      throw new ConflictException(`Ya existe un curso "${crearCursoDto.nombre}" para el nivel especificado`);
    }

    // Crear curso con competencias en transacción
    const resultado = await this.prisma.$transaction(async (tx) => {
      // Crear curso
      const curso = await tx.curso.create({
        data: {
          nombre: crearCursoDto.nombre,
          descripcion: crearCursoDto.descripcion,
          nivelId: crearCursoDto.nivelId,
          color: crearCursoDto.color || '#3B82F6', // Azul por defecto
          creadoPor: usuarioId
        },
        include: {
          nivel: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      });

      // Crear competencias
      const competencias: any[] = [];
      for (let i = 0; i < crearCursoDto.competencias.length; i++) {
        const competencia = await tx.competencia.create({
          data: {
            cursoId: curso.id,
            nombre: crearCursoDto.competencias[i].nombre,
            orden: i + 1,
            creadoPor: usuarioId
          }
        });
        competencias.push(competencia);
      }

      return {
        ...curso,
        competencias
      };
    });

    // NUEVA FUNCIONALIDAD: Asignar automáticamente a salones existentes del mismo nivel
    try {
      await this.asignarCursoASalonesExistentes(resultado.id, resultado.nivel.nombre as NivelEducativo, usuarioId);
    } catch (error) {
      this.logger.error(`Error al asignar curso ${resultado.id} a salones existentes:`, error);
      // No fallar la operación principal, solo loguear el error
    }

    return resultado;
  }

  // Obtener todos los cursos (solo para owners)
  async obtenerTodos(usuarioId: number) {
    // Verificar que el usuario sea Owner
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        roles: {
          include: { 
            rol: true 
          }
        }
      }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const esOwner = usuario.roles.some(ur => ur.rol.nombre === 'OWNER');
    if (!esOwner) {
      throw new ForbiddenException('Solo los owners pueden ver todos los cursos');
    }

    return await this.prisma.curso.findMany({
      where: { activo: true },
      include: {
        nivel: {
          select: {
            id: true,
            nombre: true
          }
        },
        competencias: {
          where: { activo: true },
          orderBy: { orden: 'asc' }
        },
        creador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true
          }
        }
      },
      orderBy: [
        { nivel: { nombre: 'asc' } },
        { nombre: 'asc' }
      ]
    });
  }

  // Obtener curso por ID
  async obtenerPorId(usuarioId: number, cursoId: number) {
    // Verificar que el usuario sea Owner
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        roles: {
          include: { 
            rol: true 
          }
        }
      }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const esOwner = usuario.roles.some(ur => ur.rol.nombre === 'OWNER');
    if (!esOwner) {
      throw new ForbiddenException('Solo los owners pueden ver cursos');
    }

    const curso = await this.prisma.curso.findUnique({
      where: { id: cursoId },
      include: {
        nivel: {
          select: {
            id: true,
            nombre: true
          }
        },
        competencias: {
          where: { activo: true },
          orderBy: { orden: 'asc' }
        },
        creador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true
          }
        }
      }
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    return curso;
  }

  // Actualizar curso (básico - solo campos del curso, no competencias)
  async actualizar(usuarioId: number, cursoId: number, actualizarCursoDto: ActualizarCursoDto) {
    // Verificar que el usuario sea Owner
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        roles: {
          include: { 
            rol: true 
          }
        }
      }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const esOwner = usuario.roles.some(ur => ur.rol.nombre === 'OWNER');
    if (!esOwner) {
      throw new ForbiddenException('Solo los owners pueden actualizar cursos');
    }

    // Verificar que el curso existe
    const cursoExistente = await this.prisma.curso.findUnique({
      where: { id: cursoId }
    });

    if (!cursoExistente) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Si se actualiza nombre y nivelId, verificar duplicados
    if (actualizarCursoDto.nombre || actualizarCursoDto.nivelId) {
      const nombreFinal = actualizarCursoDto.nombre || cursoExistente.nombre;
      const nivelIdFinal = actualizarCursoDto.nivelId || cursoExistente.nivelId;

      const cursoDuplicado = await this.prisma.curso.findFirst({
        where: {
          nombre: nombreFinal,
          nivelId: nivelIdFinal,
          activo: true,
          id: { not: cursoId }
        }
      });

      if (cursoDuplicado) {
        throw new ConflictException(`Ya existe un curso "${nombreFinal}" para el nivel especificado`);
      }
    }

    // Actualizar curso y competencias en transacción
    const { competencias, ...datosActualizar } = actualizarCursoDto;
    
    return await this.prisma.$transaction(async (tx) => {
      // 1. Actualizar datos básicos del curso
      const cursoActualizado = await tx.curso.update({
        where: { id: cursoId },
        data: {
          ...datosActualizar,
          actualizadoEn: new Date()
        }
      });

      // 2. Si se enviaron competencias, actualizarlas
      if (competencias && competencias.length > 0) {
        // Obtener competencias existentes
        const competenciasExistentes = await tx.competencia.findMany({
          where: { cursoId: cursoId, activo: true }
        });

        // Identificar competencias a eliminar (las que ya no están en la lista)
        const idsEnviados = competencias
          .filter(c => c.id)
          .map(c => c.id!);
        
        const competenciasAEliminar = competenciasExistentes
          .filter(c => !idsEnviados.includes(c.id));

        // Eliminar competencias que ya no están
        for (const comp of competenciasAEliminar) {
          await tx.competencia.delete({
            where: { id: comp.id }
          });
        }

        // Actualizar o crear competencias
        for (let i = 0; i < competencias.length; i++) {
          const competenciaDto = competencias[i];
          
          // Validar que tenga nombre
          if (!competenciaDto.nombre) {
            continue; // Saltar competencias sin nombre
          }
          
          if (competenciaDto.id) {
            // Actualizar competencia existente
            await tx.competencia.update({
              where: { id: competenciaDto.id },
              data: {
                nombre: competenciaDto.nombre,
                orden: i + 1,
                actualizadoEn: new Date()
              }
            });
          } else {
            // Crear nueva competencia
            await tx.competencia.create({
              data: {
                cursoId: cursoId,
                nombre: competenciaDto.nombre,
                orden: i + 1,
                creadoPor: usuarioId
              }
            });
          }
        }
      }

      // 3. Retornar curso actualizado con competencias
      return await tx.curso.findUnique({
        where: { id: cursoId },
        include: {
          competencias: {
            where: { activo: true },
            orderBy: { orden: 'asc' }
          },
          creador: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              email: true
            }
          }
        }
      });
    });
  }

  // Eliminar curso (hard delete - eliminación permanente)
  async eliminar(usuarioId: number, cursoId: number) {
    // Verificar que el usuario sea Owner
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        roles: {
          include: { 
            rol: true 
          }
        }
      }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const esOwner = usuario.roles.some(ur => ur.rol.nombre === 'OWNER');
    if (!esOwner) {
      throw new ForbiddenException('Solo los owners pueden eliminar cursos');
    }

    // Verificar que el curso existe
    const curso = await this.prisma.curso.findUnique({
      where: { id: cursoId }
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Hard delete del curso, sus competencias y relaciones en una transacción
    return await this.prisma.$transaction(async (tx) => {
      // 1. Eliminar relaciones salon_curso (cursos asignados a salones)
      await tx.salonCurso.deleteMany({
        where: { cursoId: cursoId }
      });

      // 2. Eliminar competencias del curso
      await tx.competencia.deleteMany({
        where: { cursoId: cursoId }
      });

      // 3. Eliminar el curso
      return await tx.curso.delete({
        where: { id: cursoId }
      });
    });
  }

  // Obtener estadísticas de cursos
  async obtenerEstadisticas(usuarioId: number) {
    // Verificar que el usuario sea Owner
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        roles: {
          include: { 
            rol: true 
          }
        }
      }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const esOwner = usuario.roles.some(ur => ur.rol.nombre === 'OWNER');
    if (!esOwner) {
      throw new ForbiddenException('Solo los owners pueden ver estadísticas');
    }

    const [totalCursos, cursosPorNivel, competenciasTotales] = await Promise.all([
      // Total de cursos activos
      this.prisma.curso.count({
        where: { activo: true }
      }),

      // Cursos por nivel
      this.prisma.curso.groupBy({
        by: ['nivelId'],
        where: { activo: true },
        _count: { id: true }
      }),

      // Total de competencias activas
      this.prisma.competencia.count({
        where: { activo: true }
      })
    ]);

    return {
      totalCursos,
      competenciasTotales,
      cursosPorNivel: cursosPorNivel.map(item => ({
        nivelId: item.nivelId,
        cantidad: item._count.id
      }))
    };
  }

  /**
   * Asigna un curso recién creado a todos los salones existentes del mismo nivel educativo
   * Se ejecuta automáticamente cuando se crea un nuevo curso
   */
  private async asignarCursoASalonesExistentes(cursoId: number, nivel: NivelEducativo, usuarioId: number) {
    this.logger.log(`🎯 Iniciando asignación automática del curso ${cursoId} a salones existentes del nivel: ${nivel}`);

    try {
      // 1. Buscar todos los salones activos del mismo nivel educativo
      const salonesDelNivel = await this.prisma.salon.findMany({
        where: {
          colegioNivel: {
            nivel: {
              nombre: nivel
            }
          }
        },
        select: {
          id: true,
          grado: true,
          seccion: true,
          colegio: {
            select: {
              id: true,
              nombre: true
            }
          },
          colegioNivel: {
            select: {
              nivel: {
                select: {
                  nombre: true
                }
              }
            }
          }
        }
      });

      this.logger.log(`📚 Salones encontrados del nivel ${nivel}: ${salonesDelNivel.length}`);

      if (salonesDelNivel.length === 0) {
        this.logger.log(`ℹ️ No hay salones existentes para el nivel ${nivel}`);
        return {
          success: true,
          salonesActualizados: 0,
          mensaje: `No hay salones existentes para el nivel ${nivel}`
        };
      }

      // 2. Asignar el curso a cada salón (en lote usando transacción)
      const asignaciones = await this.prisma.$transaction(async (tx) => {
        const resultados: any[] = [];

        for (const salon of salonesDelNivel) {
          this.logger.log(`🔄 Procesando salón: ${salon.grado}° ${salon.seccion} - ${salon.colegio.nombre}`);
          
          // Verificar si ya existe la asignación
          const existeAsignacion = await tx.salonCurso.findUnique({
            where: {
              salonId_cursoId: {
                salonId: salon.id,
                cursoId: cursoId
              }
            }
          });

          if (existeAsignacion) {
            this.logger.warn(`⚠️ Ya existe asignación del curso en salón ${salon.grado}° ${salon.seccion}`);
          } else {
            this.logger.log(`✅ Creando nueva asignación para salón ${salon.grado}° ${salon.seccion}`);
            
            const asignacion = await tx.salonCurso.create({
              data: {
                salonId: salon.id,
                cursoId: cursoId,
                activo: true,
                asignadoPor: usuarioId,
              }
            });
            
            this.logger.log(`🎉 Asignación creada exitosamente para salón ${salon.id}`);
            resultados.push({
              salonId: salon.id,
              salon: `${salon.grado}° ${salon.seccion}`,
              colegio: salon.colegio.nombre,
              asignacionId: asignacion.id
            });
          }
        }

        return resultados;
      });

      this.logger.log(`✨ Asignación automática completada: ${asignaciones.length} salones actualizados`);

      return {
        success: true,
        salonesActualizados: asignaciones.length,
        salones: asignaciones,
        mensaje: `Curso asignado automáticamente a ${asignaciones.length} salones del nivel ${nivel}`
      };

    } catch (error) {
      this.logger.error(`❌ Error en asignación automática del curso ${cursoId}:`, error);
      throw new Error(`Error en asignación automática del curso ${cursoId}: ${error.message}`);
    }
  }
}
