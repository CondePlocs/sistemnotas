import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { CrearProfesorAsignacionDto, ActualizarProfesorAsignacionDto } from './dto';

@Injectable()
export class ProfesorAsignacionService {
  constructor(private readonly prisma: PrismaService) {}

  // Verificar que el usuario sea DIRECTOR o ADMINISTRATIVO con permisos y obtener su colegioId
  private async verificarPermisoYColegio(usuarioId: number) {
    // Buscar si es DIRECTOR
    const directorRol = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: usuarioId,
        rol: {
          nombre: 'DIRECTOR'
        }
      }
    });

    if (directorRol && directorRol.colegio_id) {
      return directorRol.colegio_id;
    }

    // Buscar si es ADMINISTRATIVO con permisos
    const administrativoRol = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: usuarioId,
        rol: {
          nombre: 'ADMINISTRATIVO'
        }
      },
      include: {
        administrativo: {
          include: {
            permisos: true
          }
        }
      }
    });

    if (administrativoRol && administrativoRol.colegio_id && administrativoRol.administrativo?.permisos?.puedeAsignarProfesores) {
      return administrativoRol.colegio_id;
    }

    throw new ForbiddenException('No tienes permisos para gestionar asignaciones de profesores');
  }

  // Crear nueva asignación
  async crear(createDto: CrearProfesorAsignacionDto, usuarioId: number) {
    const colegioId = await this.verificarPermisoYColegio(usuarioId);

    // Verificar que el profesor pertenece al colegio
    const profesor = await this.prisma.profesor.findFirst({
      where: {
        id: createDto.profesorId,
        usuarioRol: {
          colegio_id: colegioId
        }
      }
    });

    if (!profesor) {
      throw new NotFoundException('Profesor no encontrado en este colegio');
    }

    // Verificar que el salón pertenece al colegio
    const salon = await this.prisma.salon.findFirst({
      where: {
        id: createDto.salonId,
        colegioNivel: {
          colegioId: colegioId
        }
      }
    });

    if (!salon) {
      throw new NotFoundException('Salón no encontrado en este colegio');
    }

    // Verificar que el curso está asignado al salón
    const salonCurso = await this.prisma.salonCurso.findFirst({
      where: {
        salonId: createDto.salonId,
        cursoId: createDto.cursoId,
        activo: true
      }
    });

    if (!salonCurso) {
      throw new BadRequestException('El curso no está asignado a este salón');
    }

    // VALIDACIÓN 1: Verificar si ya existe una asignación del MISMO profesor para este salón-curso (activa o inactiva)
    const asignacionMismoProfesor = await this.prisma.profesorAsignacion.findFirst({
      where: {
        profesorId: createDto.profesorId,
        salonId: createDto.salonId,
        cursoId: createDto.cursoId
      },
      include: {
        profesor: {
          include: {
            usuarioRol: {
              include: {
                usuario: true
              }
            }
          }
        }
      }
    });

    if (asignacionMismoProfesor) {
      const profesor = asignacionMismoProfesor.profesor.usuarioRol.usuario;
      const estado = asignacionMismoProfesor.activo ? 'activa' : 'inactiva';
      throw new ConflictException(
        `Ya existe una asignación ${estado} del profesor ${profesor.nombres} ${profesor.apellidos} ` +
        `para este curso en este salón. No se pueden crear asignaciones duplicadas del mismo profesor. ` +
        `${asignacionMismoProfesor.activo ? 'La asignación ya está activa.' : 'Active la asignación existente en lugar de crear una nueva.'}`
      );
    }

    // VALIDACIÓN 2: Verificar si ya existe una asignación activa de OTRO profesor para este salón-curso
    const asignacionOtroProfesor = await this.prisma.profesorAsignacion.findFirst({
      where: {
        salonId: createDto.salonId,
        cursoId: createDto.cursoId,
        activo: true,
        profesorId: { not: createDto.profesorId } // Excluir el profesor actual
      },
      include: {
        profesor: {
          include: {
            usuarioRol: {
              include: {
                usuario: true
              }
            }
          }
        }
      }
    });

    if (asignacionOtroProfesor) {
      const profesorAsignado = asignacionOtroProfesor.profesor.usuarioRol.usuario;
      throw new ConflictException(
        `Ya existe un profesor activo asignado a este curso en este salón. ` +
        `Profesor actual: ${profesorAsignado.nombres} ${profesorAsignado.apellidos}. ` +
        `Debe desactivar la asignación existente antes de crear una nueva.`
      );
    }

    // Crear la nueva asignación
    const nuevaAsignacion = await this.prisma.profesorAsignacion.create({
      data: {
        profesorId: createDto.profesorId,
        salonId: createDto.salonId,
        cursoId: createDto.cursoId,
        activo: createDto.activo ?? true,
        asignadoPor: usuarioId
      },
      include: {
        profesor: {
          include: {
            usuarioRol: {
              include: {
                usuario: {
                  select: {
                    nombres: true,
                    apellidos: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        salon: {
          include: {
            colegioNivel: {
              include: {
                nivel: true
              }
            }
          }
        },
        curso: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            color: true
          }
        }
      }
    });

    return {
      success: true,
      message: 'Asignación creada exitosamente',
      data: nuevaAsignacion
    };
  }

  // Obtener asignaciones por director (su colegio)
  async obtenerPorDirector(usuarioId: number, filtros?: { profesorId?: number; salonId?: number; cursoId?: number; activo?: boolean }) {
    const colegioId = await this.verificarPermisoYColegio(usuarioId);

    const asignaciones = await this.prisma.profesorAsignacion.findMany({
      where: {
        profesor: {
          usuarioRol: { colegio_id: colegioId }
        },
        ...(filtros?.profesorId && { profesorId: filtros.profesorId }),
        ...(filtros?.salonId && { salonId: filtros.salonId }),
        ...(filtros?.cursoId && { cursoId: filtros.cursoId }),
        ...(filtros?.activo !== undefined && { activo: filtros.activo })
      },
      include: {
        profesor: {
          include: {
            usuarioRol: {
              include: {
                usuario: {
                  select: {
                    nombres: true,
                    apellidos: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        salon: {
          include: {
            colegioNivel: {
              include: {
                nivel: true
              }
            }
          }
        },
        curso: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            color: true
          }
        }
      },
      orderBy: [
        { activo: 'desc' },
        { asignadoEn: 'desc' }
      ]
    });

    return {
      success: true,
      data: {
        asignaciones,
        totalAsignaciones: asignaciones.length,
        asignacionesActivas: asignaciones.filter(a => a.activo).length
      }
    };
  }

  // Obtener asignación por ID
  async obtenerPorId(id: number, usuarioId: number) {
    const colegioId = await this.verificarPermisoYColegio(usuarioId);

    const asignacion = await this.prisma.profesorAsignacion.findFirst({
      where: {
        id,
        profesor: {
          usuarioRol: { colegio_id: colegioId }
        }
      },
      include: {
        profesor: {
          include: {
            usuarioRol: {
              include: {
                usuario: {
                  select: {
                    nombres: true,
                    apellidos: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        salon: {
          include: {
            colegioNivel: {
              include: {
                nivel: true
              }
            }
          }
        },
        curso: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            color: true
          }
        }
      }
    });

    if (!asignacion) {
      throw new NotFoundException('Asignación no encontrada');
    }

    return {
      success: true,
      data: asignacion
    };
  }

  // Actualizar asignación
  async actualizar(id: number, updateDto: ActualizarProfesorAsignacionDto, usuarioId: number) {
    const colegioId = await this.verificarPermisoYColegio(usuarioId);

    // Verificar que la asignación existe y pertenece al colegio
    const asignacionExistente = await this.prisma.profesorAsignacion.findFirst({
      where: {
        id,
        profesor: {
          usuarioRol: { colegio_id: colegioId }
        }
      }
    });

    if (!asignacionExistente) {
      throw new NotFoundException('Asignación no encontrada');
    }

    const asignacionActualizada = await this.prisma.profesorAsignacion.update({
      where: { id },
      data: {
        ...updateDto,
        actualizadoEn: new Date()
      },
      include: {
        profesor: {
          include: {
            usuarioRol: {
              include: {
                usuario: {
                  select: {
                    nombres: true,
                    apellidos: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        salon: {
          include: {
            colegioNivel: {
              include: {
                nivel: true
              }
            }
          }
        },
        curso: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            color: true
          }
        }
      }
    });

    return {
      success: true,
      message: 'Asignación actualizada exitosamente',
      data: asignacionActualizada
    };
  }

  // Activar asignación (con validación de duplicados)
  async activarAsignacion(id: number, usuarioId: number) {
    const colegioId = await this.verificarPermisoYColegio(usuarioId);

    // Obtener la asignación que queremos activar
    const asignacion = await this.prisma.profesorAsignacion.findFirst({
      where: {
        id,
        profesor: {
          usuarioRol: { colegio_id: colegioId }
        }
      }
    });

    if (!asignacion) {
      throw new NotFoundException('Asignación no encontrada');
    }

    // Si ya está activa, no hacer nada
    if (asignacion.activo) {
      return {
        success: true,
        message: 'La asignación ya está activa',
        data: asignacion
      };
    }

    // VALIDACIÓN: Verificar si ya existe otra asignación activa para el mismo salón-curso
    const asignacionExistente = await this.prisma.profesorAsignacion.findFirst({
      where: {
        salonId: asignacion.salonId,
        cursoId: asignacion.cursoId,
        activo: true,
        id: { not: id } // Excluir la asignación actual
      },
      include: {
        profesor: {
          include: {
            usuarioRol: {
              include: {
                usuario: true
              }
            }
          }
        }
      }
    });

    if (asignacionExistente) {
      const profesorAsignado = asignacionExistente.profesor.usuarioRol.usuario;
      throw new ConflictException(
        `No se puede activar esta asignación porque ya existe un profesor activo para este curso en este salón. ` +
        `Profesor actual: ${profesorAsignado.nombres} ${profesorAsignado.apellidos}. ` +
        `Debe desactivar la asignación existente antes de activar esta.`
      );
    }

    // Activar la asignación
    return this.actualizar(id, { activo: true }, usuarioId);
  }

  // Desactivar asignación (sin validaciones adicionales)
  async desactivarAsignacion(id: number, usuarioId: number) {
    return this.actualizar(id, { activo: false }, usuarioId);
  }

  // Activar/Desactivar asignación (método legacy - mantener para compatibilidad)
  async cambiarEstado(id: number, activo: boolean, usuarioId: number) {
    if (activo) {
      return this.activarAsignacion(id, usuarioId);
    } else {
      return this.desactivarAsignacion(id, usuarioId);
    }
  }

  // Obtener asignaciones de un profesor específico (para su dashboard)
  async obtenerAsignacionesDeProfesor(profesorId: number) {
    const asignaciones = await this.prisma.profesorAsignacion.findMany({
      where: {
        profesorId,
        activo: true
      },
      include: {
        salon: {
          include: {
            colegioNivel: {
              include: {
                nivel: true
              }
            }
          }
        },
        curso: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            color: true
          }
        }
      },
      orderBy: {
        asignadoEn: 'desc'
      }
    });

    return {
      success: true,
      data: {
        asignaciones,
        totalAsignaciones: asignaciones.length
      }
    };
  }
}
