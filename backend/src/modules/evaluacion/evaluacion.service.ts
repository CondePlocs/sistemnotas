import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { CreateEvaluacionDto, UpdateEvaluacionDto } from './dto';

@Injectable()
export class EvaluacionService {
  private readonly logger = new Logger(EvaluacionService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene el contexto completo de trabajo del profesor
   * Dashboard → Grupo → Período → Hoja de trabajo
   */
  async obtenerContextoTrabajo(profesorAsignacionId: number, periodoId: number, usuarioId: number) {
    this.logger.log(`Obteniendo contexto de trabajo para profesorAsignacionId: ${profesorAsignacionId}, periodoId: ${periodoId}`);

    // Verificar que la asignación existe
    const asignacion = await this.prisma.profesorAsignacion.findUnique({
      where: { id: profesorAsignacionId },
      include: {
        profesor: true,
        salon: true,
        curso: {
          include: {
            competencias: {
              where: { activo: true },
              orderBy: { orden: 'asc' }
            }
          }
        }
      }
    });

    if (!asignacion) {
      throw new NotFoundException('Asignación de profesor no encontrada');
    }

    // Verificar que el período existe
    const periodo = await this.prisma.periodoAcademico.findUnique({
      where: { id: periodoId }
    });

    if (!periodo) {
      throw new NotFoundException('Período académico no encontrado');
    }

    // Obtener alumnos del salón
    const alumnos = await this.prisma.alumnoSalon.findMany({
      where: {
        salonId: asignacion.salonId
      },
      include: {
        alumno: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true
          }
        }
      }
    });

    // Obtener evaluaciones existentes para este contexto
    const evaluaciones = await this.prisma.evaluacion.findMany({
      where: {
        profesorAsignacionId,
        periodoId
      },
      include: {
        competencia: true
      },
      orderBy: [
        { competencia: { orden: 'asc' } },
        { creadoEn: 'asc' }
      ]
    });

    return {
      asignacion: {
        id: asignacion.id,
        curso: asignacion.curso.nombre,
        salon: `${asignacion.salon.grado} ${asignacion.salon.seccion}`,
        colegioId: asignacion.salon.colegioId
      },
      periodo: {
        id: periodo.id,
        nombre: periodo.nombre,
        tipo: periodo.tipo,
        anioAcademico: periodo.anioAcademico
      },
      competencias: asignacion.curso.competencias,
      alumnos: alumnos.map(as => as.alumno),
      evaluaciones
    };
  }

  /**
   * Obtiene las asignaciones activas de un profesor para su dashboard
   */
  async obtenerAsignacionesProfesor(usuarioId: number) {
    this.logger.log(`Obteniendo asignaciones para profesor usuarioId: ${usuarioId}`);

    const asignaciones = await this.prisma.profesorAsignacion.findMany({
      where: {
        activo: true
      },
      include: {
        salon: true,
        curso: true
      }
    });

    return asignaciones.map(asignacion => ({
      id: asignacion.id,
      curso: asignacion.curso.nombre,
      salon: `${asignacion.salon.grado} ${asignacion.salon.seccion}`,
      colegioId: asignacion.salon.colegioId
    }));
  }

  /**
   * Obtiene los períodos activos de un colegio
   */
  async obtenerPeriodosActivos(colegioId: number) {
    this.logger.log(`Obteniendo períodos activos para colegio: ${colegioId}`);

    return await this.prisma.periodoAcademico.findMany({
      where: {
        colegioId,
        activo: true
      },
      orderBy: [
        { anioAcademico: 'desc' },
        { orden: 'asc' }
      ]
    });
  }

  /**
   * Crea una nueva evaluación con validaciones básicas
   */
  async create(createEvaluacionDto: CreateEvaluacionDto, usuarioId: number) {
    this.logger.log(`Creando evaluación: ${JSON.stringify(createEvaluacionDto)}`);

    // Verificar que la asignación existe
    const asignacion = await this.prisma.profesorAsignacion.findUnique({
      where: { id: createEvaluacionDto.profesorAsignacionId },
      include: { salon: true }
    });

    if (!asignacion) {
      throw new NotFoundException('Asignación de profesor no encontrada');
    }

    // Verificar que el período existe
    const periodo = await this.prisma.periodoAcademico.findUnique({
      where: { id: createEvaluacionDto.periodoId }
    });

    if (!periodo) {
      throw new NotFoundException('Período académico no encontrado');
    }

    // Verificar que la competencia existe
    const competencia = await this.prisma.competencia.findUnique({
      where: { id: createEvaluacionDto.competenciaId }
    });

    if (!competencia) {
      throw new NotFoundException('Competencia no encontrada');
    }

    // Crear la evaluación
    const evaluacion = await this.prisma.evaluacion.create({
      data: {
        ...createEvaluacionDto,
        fechaEvaluacion: createEvaluacionDto.fechaEvaluacion ? new Date(createEvaluacionDto.fechaEvaluacion) : null,
        creadoPor: usuarioId
      },
      include: {
        competencia: true,
        profesorAsignacion: {
          include: {
            salon: true,
            curso: true
          }
        },
        periodo: true,
        creador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        }
      }
    });

    this.logger.log(`Evaluación creada exitosamente con ID: ${evaluacion.id}`);
    return evaluacion;
  }

  /**
   * Obtiene todas las evaluaciones de un contexto específico
   */
  async findByContext(profesorAsignacionId: number, periodoId: number, usuarioId: number) {
    this.logger.log(`Obteniendo evaluaciones para contexto: profesorAsignacionId=${profesorAsignacionId}, periodoId=${periodoId}`);

    return await this.prisma.evaluacion.findMany({
      where: {
        profesorAsignacionId,
        periodoId
      },
      include: {
        competencia: true,
        creador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        }
      },
      orderBy: [
        { competencia: { orden: 'asc' } },
        { creadoEn: 'asc' }
      ]
    });
  }

  /**
   * Obtiene una evaluación específica
   */
  async findOne(id: number, usuarioId: number) {
    this.logger.log(`Obteniendo evaluación ID: ${id}`);

    const evaluacion = await this.prisma.evaluacion.findUnique({
      where: { id },
      include: {
        competencia: true,
        profesorAsignacion: {
          include: {
            salon: true,
            curso: true,
            profesor: true
          }
        },
        periodo: true,
        creador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        }
      }
    });

    if (!evaluacion) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    return evaluacion;
  }

  /**
   * Actualiza una evaluación
   */
  async update(id: number, updateEvaluacionDto: UpdateEvaluacionDto, usuarioId: number) {
    this.logger.log(`Actualizando evaluación ID: ${id}`);

    // Verificar que la evaluación existe
    await this.findOne(id, usuarioId);

    const evaluacion = await this.prisma.evaluacion.update({
      where: { id },
      data: {
        ...updateEvaluacionDto,
        fechaEvaluacion: updateEvaluacionDto.fechaEvaluacion ? new Date(updateEvaluacionDto.fechaEvaluacion) : undefined
      },
      include: {
        competencia: true,
        profesorAsignacion: {
          include: {
            salon: true,
            curso: true
          }
        },
        periodo: true,
        creador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        }
      }
    });

    this.logger.log(`Evaluación actualizada exitosamente ID: ${id}`);
    return evaluacion;
  }

  /**
   * Elimina una evaluación
   */
  async remove(id: number, usuarioId: number) {
    this.logger.log(`Eliminando evaluación ID: ${id}`);

    // Verificar que la evaluación existe
    await this.findOne(id, usuarioId);

    await this.prisma.evaluacion.delete({
      where: { id }
    });

    this.logger.log(`Evaluación eliminada exitosamente ID: ${id}`);
    return { message: 'Evaluación eliminada exitosamente' };
  }
}
