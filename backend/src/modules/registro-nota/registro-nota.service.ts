import { Injectable, Logger, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { NotaCalculoService } from './services/nota-calculo.service';
import { CrearRegistroNotaDto, ActualizarRegistroNotaDto, GuardarNotasLoteDto } from './dto';

@Injectable()
export class RegistroNotaService {
  private readonly logger = new Logger(RegistroNotaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notaCalculoService: NotaCalculoService,
  ) {}

  /**
   * Crear una nota individual
   */
  async crearNota(
    createDto: CrearRegistroNotaDto, 
    registradoPor: number,
    colegioId: number
  ) {
    // Verificar que el alumno y evaluación pertenezcan al mismo colegio
    await this.verificarPertenenciaColegio(createDto.alumnoId, createDto.evaluacionId, colegioId);

    // Verificar que no exista ya una nota para este alumno-evaluación
    const notaExistente = await this.prisma.registroNota.findFirst({
      where: {
        alumnoId: createDto.alumnoId,
        evaluacionId: createDto.evaluacionId
      }
    });

    if (notaExistente) {
      throw new ConflictException(
        `Ya existe una nota registrada para este alumno en esta evaluación`
      );
    }

    const nota = await this.prisma.registroNota.create({
      data: {
        ...createDto,
        registradoPor
      },
      include: {
        alumno: {
          select: { nombres: true, apellidos: true, dni: true }
        },
        evaluacion: {
          select: { nombre: true }
        },
        registrador: {
          select: { nombres: true, apellidos: true }
        }
      }
    });

    this.logger.log(`Nota creada: ${nota.nota} para alumno ${nota.alumno.nombres} ${nota.alumno.apellidos} en evaluación ${nota.evaluacion.nombre}`);

    return nota;
  }

  /**
   * Actualizar una nota existente
   */
  async actualizarNota(
    id: number, 
    updateDto: ActualizarRegistroNotaDto,
    usuarioId: number,
    colegioId: number
  ) {
    const notaExistente = await this.prisma.registroNota.findUnique({
      where: { id },
      include: {
        alumno: { include: { colegio: true } },
        evaluacion: true
      }
    });

    if (!notaExistente) {
      throw new NotFoundException(`Nota con ID ${id} no encontrada`);
    }

    // Verificar pertenencia al colegio
    if (notaExistente.alumno.colegioId !== colegioId) {
      throw new ForbiddenException('No tienes permisos para modificar esta nota');
    }

    const notaActualizada = await this.prisma.registroNota.update({
      where: { id },
      data: updateDto,
      include: {
        alumno: {
          select: { nombres: true, apellidos: true, dni: true }
        },
        evaluacion: {
          select: { nombre: true }
        }
      }
    });

    this.logger.log(`Nota actualizada: ${notaActualizada.nota} para alumno ${notaActualizada.alumno.nombres} ${notaActualizada.alumno.apellidos}`);

    return notaActualizada;
  }

  /**
   * Guardar múltiples notas en lote (para el botón "Guardar Notas")
   */
  async guardarNotasLote(
    guardarDto: GuardarNotasLoteDto,
    registradoPor: number,
    colegioId: number
  ) {
    const resultados: any[] = [];
    const errores: any[] = [];

    // Procesar cada nota en una transacción
    await this.prisma.$transaction(async (prisma) => {
      for (const notaDto of guardarDto.notas) {
        try {
          // Verificar pertenencia al colegio
          await this.verificarPertenenciaColegio(notaDto.alumnoId, notaDto.evaluacionId, colegioId);

          // Buscar si ya existe la nota
          const notaExistente = await prisma.registroNota.findFirst({
            where: {
              alumnoId: notaDto.alumnoId,
              evaluacionId: notaDto.evaluacionId
            }
          });

          let nota;
          if (notaExistente) {
            // Actualizar nota existente
            nota = await prisma.registroNota.update({
              where: { id: notaExistente.id },
              data: { nota: notaDto.nota },
              include: {
                alumno: { select: { nombres: true, apellidos: true } },
                evaluacion: { select: { nombre: true } }
              }
            });
          } else {
            // Crear nueva nota
            nota = await prisma.registroNota.create({
              data: {
                ...notaDto,
                registradoPor
              },
              include: {
                alumno: { select: { nombres: true, apellidos: true } },
                evaluacion: { select: { nombre: true } }
              }
            });
          }

          resultados.push(nota);
        } catch (error: any) {
          this.logger.error(`Error al guardar nota para alumno ${notaDto.alumnoId}, evaluación ${notaDto.evaluacionId}: ${error.message}`, error.stack);
          errores.push({
            alumnoId: notaDto.alumnoId,
            evaluacionId: notaDto.evaluacionId,
            error: error.message
          });
        }
      }
    });

    this.logger.log(`Lote procesado: ${resultados.length} notas guardadas, ${errores.length} errores`);

    return {
      notasGuardadas: resultados,
      errores,
      totalProcesadas: guardarDto.notas.length,
      fallidas: errores.length
    };
  }

  /**
   * Obtener notas por contexto (asignación + período)
   */
  async obtenerNotasPorContexto(
    asignacionId: number,
    periodoId: number,
    colegioId: number
  ) {
    this.logger.log(`Obteniendo notas para asignación ${asignacionId}, período ${periodoId}, colegio ${colegioId}`);

    const notas = await this.prisma.registroNota.findMany({
      where: {
        evaluacion: {
          profesorAsignacionId: asignacionId,
          periodoId: periodoId,
          profesorAsignacion: {
            salon: {
              colegioId: colegioId
            }
          }
        }
      },
      include: {
        alumno: {
          select: { id: true, nombres: true, apellidos: true, dni: true }
        },
        evaluacion: {
          select: { id: true, nombre: true, competenciaId: true }
        }
      }
    });

    this.logger.log(`Encontradas ${notas.length} notas para el contexto`);
    return notas;
  }

  /**
   * Obtener notas de un alumno en un período específico
   */
  async obtenerNotasAlumnoPeriodo(
    alumnoId: number,
    periodoId: number,
    colegioId: number
  ) {
    // Verificar que el alumno pertenezca al colegio
    const alumno = await this.prisma.alumno.findUnique({
      where: { id: alumnoId }
    });

    if (!alumno || alumno.colegioId !== colegioId) {
      throw new ForbiddenException('No tienes permisos para ver las notas de este alumno');
    }

    const notas = await this.prisma.registroNota.findMany({
      where: {
        alumnoId,
        evaluacion: {
          periodoId
        }
      },
      include: {
        evaluacion: {
          include: {
            competencia: {
              include: {
                curso: true
              }
            }
          }
        }
      },
      orderBy: [
        { evaluacion: { competencia: { curso: { nombre: 'asc' } } } },
        { evaluacion: { competencia: { orden: 'asc' } } },
        { evaluacion: { nombre: 'asc' } }
      ]
    });

    return notas;
  }

  /**
   * Calcular promedio de competencia para un alumno en un período
   */
  async calcularPromedioCompetencia(
    alumnoId: number, 
    competenciaId: number, 
    periodoId: number,
    colegioId: number
  ) {
    // Verificar permisos
    const alumno = await this.prisma.alumno.findUnique({
      where: { id: alumnoId }
    });

    if (!alumno || alumno.colegioId !== colegioId) {
      throw new ForbiddenException('No tienes permisos para calcular promedios de este alumno');
    }

    // Obtener todas las notas de la competencia en el período
    const notas = await this.prisma.registroNota.findMany({
      where: {
        alumnoId,
        evaluacion: {
          competenciaId,
          periodoId
        }
      },
      select: {
        nota: true
      }
    });

    const notasLiterales = notas.map(n => n.nota);
    const resultado = this.notaCalculoService.calcularPromedioCompetencia(notasLiterales);

    return {
      alumnoId,
      competenciaId,
      periodoId,
      ...resultado
    };
  }

  /**
   * Calcular promedio de curso para un alumno en un período
   */
  async calcularPromedioCurso(
    alumnoId: number, 
    cursoId: number, 
    periodoId: number,
    colegioId: number
  ) {
    // Verificar permisos
    const alumno = await this.prisma.alumno.findUnique({
      where: { id: alumnoId }
    });

    if (!alumno || alumno.colegioId !== colegioId) {
      throw new ForbiddenException('No tienes permisos para calcular promedios de este alumno');
    }

    // Obtener todas las competencias del curso
    const competencias = await this.prisma.competencia.findMany({
      where: { cursoId },
      select: { id: true }
    });

    // Calcular promedio de cada competencia
    const promediosCompetencias: number[] = [];
    for (const competencia of competencias) {
      const promedio = await this.calcularPromedioCompetencia(
        alumnoId, 
        competencia.id, 
        periodoId, 
        colegioId
      );
      
      if (promedio.cantidadNotas > 0) {
        promediosCompetencias.push(promedio.promedioNumerico);
      }
    }

    const resultado = this.notaCalculoService.calcularPromedioCurso(promediosCompetencias);

    return {
      alumnoId,
      cursoId,
      periodoId,
      ...resultado
    };
  }

  /**
   * Verificar que alumno y evaluación pertenezcan al mismo colegio
   */
  private async verificarPertenenciaColegio(
    alumnoId: number, 
    evaluacionId: number, 
    colegioId: number
  ) {
    this.logger.debug(`Verificando pertenencia: alumnoId=${alumnoId}, evaluacionId=${evaluacionId}, colegioId=${colegioId}`);
    
    const alumno = await this.prisma.alumno.findUnique({
      where: { id: alumnoId }
    });

    const evaluacion = await this.prisma.evaluacion.findUnique({
      where: { id: evaluacionId },
      include: {
        profesorAsignacion: {
          include: {
            salon: true
          }
        }
      }
    });

    this.logger.debug(`Alumno encontrado: ${alumno ? `ID=${alumno.id}, colegioId=${alumno.colegioId}` : 'null'}`);
    this.logger.debug(`Evaluación encontrada: ${evaluacion ? `ID=${evaluacion.id}, salonColegioId=${evaluacion.profesorAsignacion?.salon?.colegioId}` : 'null'}`);

    if (!alumno) {
      throw new NotFoundException(`Alumno con ID ${alumnoId} no encontrado`);
    }

    if (!evaluacion) {
      throw new NotFoundException(`Evaluación con ID ${evaluacionId} no encontrada`);
    }

    if (alumno.colegioId !== colegioId || 
        evaluacion.profesorAsignacion.salon.colegioId !== colegioId) {
      this.logger.error(`Error de pertenencia: alumno.colegioId=${alumno.colegioId}, evaluacion.salon.colegioId=${evaluacion.profesorAsignacion.salon.colegioId}, colegioId esperado=${colegioId}`);
      throw new ForbiddenException('El alumno y la evaluación deben pertenecer al mismo colegio');
    }
    
    this.logger.debug(`Verificación exitosa para alumno ${alumnoId} y evaluación ${evaluacionId}`);
  }
}
