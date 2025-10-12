import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { CrearPeriodoAcademicoDto, ActualizarPeriodoAcademicoDto, ActivarPeriodoAcademicoDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PeriodoAcademicoService {
  constructor(private prisma: PrismaService) {}

  // Verificar que el usuario es director del colegio
  private async verificarDirectorYColegio(directorUserId: number): Promise<number> {
    const usuarioRol = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: directorUserId,
        rol: {
          nombre: 'DIRECTOR'
        }
      },
      include: {
        colegio: true
      }
    });

    if (!usuarioRol || !usuarioRol.colegio_id) {
      throw new ForbiddenException('Solo los directores pueden gestionar períodos académicos');
    }

    return usuarioRol.colegio_id;
  }

  // Crear período académico
  async crear(directorUserId: number, crearDto: CrearPeriodoAcademicoDto) {
    const colegioId = await this.verificarDirectorYColegio(directorUserId);

    // Validar fechas
    const fechaInicio = new Date(crearDto.fechaInicio);
    const fechaFin = new Date(crearDto.fechaFin);

    if (fechaFin <= fechaInicio) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    // Verificar que no existe el mismo período
    const periodoExistente = await this.prisma.periodoAcademico.findFirst({
      where: {
        colegioId,
        anioAcademico: crearDto.anioAcademico,
        orden: crearDto.orden
      }
    });

    if (periodoExistente) {
      throw new BadRequestException(`Ya existe un período con orden ${crearDto.orden} para el año ${crearDto.anioAcademico}`);
    }

    // Crear período académico
    const periodo = await this.prisma.periodoAcademico.create({
      data: {
        colegioId,
        nombre: crearDto.nombre,
        tipo: crearDto.tipo,
        anioAcademico: crearDto.anioAcademico,
        orden: crearDto.orden,
        fechaInicio,
        fechaFin,
        creadoPor: directorUserId
      },
      include: {
        colegio: {
          select: {
            id: true,
            nombre: true
          }
        },
        creador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        }
      }
    });

    return {
      success: true,
      message: 'Período académico creado exitosamente',
      data: periodo
    };
  }

  // Obtener períodos del colegio del director
  async obtenerPorDirector(directorUserId: number) {
    const colegioId = await this.verificarDirectorYColegio(directorUserId);

    const periodos = await this.prisma.periodoAcademico.findMany({
      where: {
        colegioId
      },
      include: {
        colegio: {
          select: {
            id: true,
            nombre: true
          }
        },
        creador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        }
      },
      orderBy: [
        { anioAcademico: 'desc' },
        { orden: 'asc' }
      ]
    });

    // Agrupar por año académico
    const periodosPorAnio = periodos.reduce((acc, periodo) => {
      const anio = periodo.anioAcademico;
      if (!acc[anio]) {
        acc[anio] = [];
      }
      acc[anio].push(periodo);
      return acc;
    }, {} as Record<number, typeof periodos>);

    return {
      success: true,
      data: {
        periodos,
        periodosPorAnio,
        totalPeriodos: periodos.length,
        aniosAcademicos: Object.keys(periodosPorAnio).map(Number).sort((a, b) => b - a)
      }
    };
  }

  // Obtener período específico
  async obtenerPorId(directorUserId: number, periodoId: number) {
    const colegioId = await this.verificarDirectorYColegio(directorUserId);

    const periodo = await this.prisma.periodoAcademico.findFirst({
      where: {
        id: periodoId,
        colegioId // Scope por colegio
      },
      include: {
        colegio: {
          select: {
            id: true,
            nombre: true
          }
        },
        creador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        }
      }
    });

    if (!periodo) {
      throw new NotFoundException('Período académico no encontrado');
    }

    return {
      success: true,
      data: periodo
    };
  }

  // Actualizar período académico
  async actualizar(directorUserId: number, periodoId: number, actualizarDto: ActualizarPeriodoAcademicoDto) {
    const colegioId = await this.verificarDirectorYColegio(directorUserId);

    // Verificar contraseña si se proporciona
    if (actualizarDto.password) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: directorUserId }
      });

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const passwordValida = await bcrypt.compare(actualizarDto.password, usuario.password_hash);
      if (!passwordValida) {
        throw new BadRequestException('Contraseña incorrecta');
      }
    }

    // Verificar que el período existe y pertenece al colegio
    const periodoExistente = await this.prisma.periodoAcademico.findFirst({
      where: {
        id: periodoId,
        colegioId
      }
    });

    if (!periodoExistente) {
      throw new NotFoundException('Período académico no encontrado');
    }

    // Validar fechas si se proporcionan
    if (actualizarDto.fechaInicio && actualizarDto.fechaFin) {
      const fechaInicio = new Date(actualizarDto.fechaInicio);
      const fechaFin = new Date(actualizarDto.fechaFin);

      if (fechaFin <= fechaInicio) {
        throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    // Si se está activando este período, desactivar otros del mismo colegio
    if (actualizarDto.activo === true) {
      await this.prisma.periodoAcademico.updateMany({
        where: {
          colegioId,
          activo: true
        },
        data: {
          activo: false
        }
      });
    }

    // Preparar datos para actualización (excluir password)
    const { password, ...datosActualizacion } = actualizarDto;

    // Verificar duplicados si se están cambiando campos únicos
    if (datosActualizacion.nombre || datosActualizacion.anioAcademico) {
      const orden = datosActualizacion.orden || periodoExistente.orden;
      const anioAcademico = datosActualizacion.anioAcademico || periodoExistente.anioAcademico;
      
      const duplicado = await this.prisma.periodoAcademico.findFirst({
        where: {
          colegioId,
          anioAcademico,
          orden,
          id: { not: periodoId } // Excluir el período actual
        }
      });

      if (duplicado) {
        throw new BadRequestException(`Ya existe un período con el mismo orden en el año académico ${anioAcademico}`);
      }
    }

    // Actualizar período
    const periodoActualizado = await this.prisma.periodoAcademico.update({
      where: {
        id: periodoId
      },
      data: {
        ...datosActualizacion,
        fechaInicio: datosActualizacion.fechaInicio ? new Date(datosActualizacion.fechaInicio) : undefined,
        fechaFin: datosActualizacion.fechaFin ? new Date(datosActualizacion.fechaFin) : undefined
      },
      include: {
        colegio: {
          select: {
            id: true,
            nombre: true
          }
        },
        creador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        }
      }
    });

    return {
      success: true,
      message: 'Período académico actualizado exitosamente',
      data: periodoActualizado
    };
  }

  // Activar período académico (solo uno activo por colegio)
  async activar(directorUserId: number, periodoId: number, activarDto: ActivarPeriodoAcademicoDto) {
    const colegioId = await this.verificarDirectorYColegio(directorUserId);

    // Verificar contraseña
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: directorUserId }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const passwordValida = await bcrypt.compare(activarDto.password, usuario.password_hash);
    if (!passwordValida) {
      throw new BadRequestException('Contraseña incorrecta');
    }

    // Verificar que el período existe y pertenece al colegio
    const periodo = await this.prisma.periodoAcademico.findFirst({
      where: {
        id: periodoId,
        colegioId
      }
    });

    if (!periodo) {
      throw new NotFoundException('Período académico no encontrado');
    }

    // Transacción para desactivar otros y activar este
    const resultado = await this.prisma.$transaction(async (prisma) => {
      // Desactivar todos los períodos del colegio
      await prisma.periodoAcademico.updateMany({
        where: {
          colegioId,
          activo: true
        },
        data: {
          activo: false
        }
      });

      // Activar el período seleccionado
      const periodoActivado = await prisma.periodoAcademico.update({
        where: {
          id: periodoId
        },
        data: {
          activo: true
        },
        include: {
          colegio: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      });

      return periodoActivado;
    });

    return {
      success: true,
      message: 'Período académico activado exitosamente',
      data: resultado
    };
  }

  // Obtener período activo del colegio
  async obtenerPeriodoActivo(directorUserId: number) {
    const colegioId = await this.verificarDirectorYColegio(directorUserId);

    const periodoActivo = await this.prisma.periodoAcademico.findFirst({
      where: {
        colegioId,
        activo: true
      },
      include: {
        colegio: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    return {
      success: true,
      data: periodoActivo
    };
  }
}
