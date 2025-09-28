import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { CreateSalonDto } from './dto/create-salon.dto';
import { CreateSalonesLoteDto } from './dto/create-salones-lote.dto';
import { UpdateSalonDto } from './dto/update-salon.dto';
import { NivelEducativo, SalonCreado } from '../../types/salon.types';
import { SalonCursosService } from './salon-cursos.service';

@Injectable()
export class SalonService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly salonCursosService: SalonCursosService
  ) {}

  // Crear un salón individual (modo manual)
  async crearSalon(createSalonDto: CreateSalonDto, usuarioId: number) {
    // 1. Verificar que el usuario es director y obtener su colegio
    const director = await this.verificarDirectorYColegio(usuarioId);
    
    // 2. Obtener colegioNivelId basado en colegio y nivel
    const colegioNivel = await this.obtenerColegioNivelId(director.colegioId, createSalonDto.nivel);
    
    // 3. Verificar que no existe un salón duplicado
    await this.verificarSalonDuplicado(
      director.colegioId, 
      colegioNivel.id, 
      createSalonDto.grado, 
      createSalonDto.seccion
    );

    // 4. Crear el salón
    const salon = await this.prisma.salon.create({
      data: {
        colegioId: director.colegioId,
        colegioNivelId: colegioNivel.id, // ← Usar FK a colegio_nivel
        grado: createSalonDto.grado,
        seccion: createSalonDto.seccion,
        creadoPor: usuarioId,
      },
      include: {
        colegio: {
          select: {
            id: true,
            nombre: true,
          }
        },
        creadorUser: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          }
        }
      }
    });

    // 5. Asignar cursos automáticamente al salón recién creado
    try {
      const resultadoCursos = await this.salonCursosService.asignarCursosAutomaticamenteASalon(
        salon.id, 
        createSalonDto.nivel, 
        usuarioId
      );
      
      return {
        success: true,
        message: 'Salón creado exitosamente',
        salon,
        cursosAsignados: resultadoCursos.cursosAsignados,
        cursosInfo: resultadoCursos.mensaje
      };
    } catch (error) {
      // Si falla la asignación de cursos, el salón ya está creado
      // Solo logueamos el error pero no fallamos la operación
      console.error('Error al asignar cursos automáticamente:', error);
      
      return {
        success: true,
        message: 'Salón creado exitosamente (sin asignación automática de cursos)',
        salon,
        cursosAsignados: 0,
        cursosInfo: 'Error en asignación automática de cursos'
      };
    }
  }

  // Crear múltiples salones (modo automático)
  async crearSalonesLote(createSalonesLoteDto: CreateSalonesLoteDto, usuarioId: number) {
    // 1. Verificar que el usuario es director y obtener su colegio
    const director = await this.verificarDirectorYColegio(usuarioId);
    
    // 2. Obtener colegioNivelId basado en colegio y nivel
    const colegioNivel = await this.obtenerColegioNivelId(director.colegioId, createSalonesLoteDto.nivel);
    
    // 3. Verificar que ningún salón del lote existe ya
    for (const seccion of createSalonesLoteDto.secciones) {
      await this.verificarSalonDuplicado(
        director.colegioId, 
        colegioNivel.id, 
        createSalonesLoteDto.grado, 
        seccion
      );
    }

    // 4. Crear todos los salones en una transacción
    const salones = await this.prisma.$transaction(async (prisma) => {
      const salonesCreados: any[] = [];
      
      for (const seccion of createSalonesLoteDto.secciones) {
        const salon = await prisma.salon.create({
          data: {
            colegioId: director.colegioId,
            colegioNivelId: colegioNivel.id, // ← Usar FK
            grado: createSalonesLoteDto.grado,
            seccion: seccion,
            creadoPor: usuarioId,
          },
          include: {
            colegio: {
              select: {
                id: true,
                nombre: true,
              }
            }
          }
        });
        
        salonesCreados.push(salon);
      }
      
      return salonesCreados;
    });

    // 5. Asignar cursos automáticamente a cada salón creado
    let totalCursosAsignados = 0;
    const cursosInfo: string[] = [];

    for (const salon of salones) {
      try {
        const resultadoCursos = await this.salonCursosService.asignarCursosAutomaticamenteASalon(
          salon.id, 
          createSalonesLoteDto.nivel, 
          usuarioId
        );
        
        totalCursosAsignados += resultadoCursos.cursosAsignados;
        cursosInfo.push(`Salón ${salon.grado} ${salon.seccion}: ${resultadoCursos.cursosAsignados} cursos`);
      } catch (error) {
        console.error(`Error al asignar cursos al salón ${salon.grado} ${salon.seccion}:`, error);
        cursosInfo.push(`Salón ${salon.grado} ${salon.seccion}: Error en asignación`);
      }
    }

    return {
      success: true,
      message: `${salones.length} salones creados exitosamente`,
      salones,
      resumen: {
        total: salones.length,
        nivel: createSalonesLoteDto.nivel,
        grado: createSalonesLoteDto.grado,
        secciones: createSalonesLoteDto.secciones,
      },
      cursosAsignados: {
        total: totalCursosAsignados,
        detalle: cursosInfo
      }
    };
  }

  // Obtener salones del colegio del director
  async obtenerSalonesPorDirector(usuarioId: number) {
    // 1. Verificar que el usuario es director y obtener su colegio
    const director = await this.verificarDirectorYColegio(usuarioId);
    
    // 2. Obtener todos los salones del colegio
    const salones = await this.prisma.salon.findMany({
      where: {
        colegioId: director.colegioId,
        activo: true,
      },
      include: {
        creadorUser: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          }
        },
        colegioNivel: {
          include: {
            nivel: true // ← Incluir datos del nivel
          }
        }
      },
      orderBy: [
        { colegioNivel: { nivel: { nombre: 'asc' } } }, // ← Ordenar por nombre del nivel
        { grado: 'asc' },
        { seccion: 'asc' },
      ]
    });

    // 3. Agrupar por nivel para mejor presentación
    const salonesPorNivel = salones.reduce((acc, salon) => {
      const nivelNombre = salon.colegioNivel?.nivel?.nombre || 'Sin nivel';
      if (!acc[nivelNombre]) {
        acc[nivelNombre] = [];
      }
      acc[nivelNombre].push(salon);
      return acc;
    }, {} as Record<string, any[]>);

    return {
      success: true,
      colegio: {
        id: director.colegioId,
        nombre: director.colegio.nombre,
      },
      salones,
      salonesPorNivel,
      estadisticas: {
        total: salones.length,
        porNivel: Object.keys(salonesPorNivel).map(nivel => ({
          nivel,
          cantidad: salonesPorNivel[nivel].length
        }))
      }
    };
  }

  // Actualizar un salón
  async actualizarSalon(id: number, updateSalonDto: UpdateSalonDto, usuarioId: number) {
    // 1. Verificar que el usuario es director y obtener su colegio
    const director = await this.verificarDirectorYColegio(usuarioId);
    
    // 2. Verificar que el salón existe y pertenece al colegio del director
    const salonExistente = await this.prisma.salon.findFirst({
      where: {
        id,
        colegioId: director.colegioId,
      }
    });

    if (!salonExistente) {
      throw new NotFoundException('Salón no encontrado o no pertenece a tu colegio');
    }

    // 3. Si se está cambiando grado/sección, verificar duplicados
    if (updateSalonDto.grado || updateSalonDto.seccion) {
      const nuevoGrado = updateSalonDto.grado || salonExistente.grado;
      const nuevaSeccion = updateSalonDto.seccion || salonExistente.seccion;
      
      // Solo verificar si realmente cambió
      if (nuevoGrado !== salonExistente.grado || nuevaSeccion !== salonExistente.seccion) {
        await this.verificarSalonDuplicado(
          director.colegioId,
          salonExistente.colegioNivelId,
          nuevoGrado,
          nuevaSeccion,
          id // Excluir el salón actual
        );
      }
    }

    // 4. Actualizar el salón
    const salonActualizado = await this.prisma.salon.update({
      where: { id },
      data: updateSalonDto,
      include: {
        colegio: {
          select: {
            id: true,
            nombre: true,
          }
        },
        creadorUser: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          }
        }
      }
    });

    return {
      success: true,
      message: 'Salón actualizado exitosamente',
      salon: salonActualizado,
    };
  }

  // Eliminar (desactivar) un salón
  async eliminarSalon(id: number, usuarioId: number) {
    // 1. Verificar que el usuario es director y obtener su colegio
    const director = await this.verificarDirectorYColegio(usuarioId);
    
    // 2. Verificar que el salón existe y pertenece al colegio del director
    const salon = await this.prisma.salon.findFirst({
      where: {
        id,
        colegioId: director.colegioId,
      }
    });

    if (!salon) {
      throw new NotFoundException('Salón no encontrado o no pertenece a tu colegio');
    }

    // 3. Desactivar el salón (soft delete)
    await this.prisma.salon.update({
      where: { id },
      data: { activo: false }
    });

    return {
      success: true,
      message: 'Salón eliminado exitosamente',
    };
  }

  // MÉTODOS PRIVADOS DE VALIDACIÓN

  async verificarDirectorYColegio(usuarioId: number) {
    // Primero verificar si es director
    const director = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: usuarioId,
        rol: {
          nombre: 'DIRECTOR'
        }
      },
      include: {
        colegio: {
          select: {
            id: true,
            nombre: true,
          }
        }
      }
    });

    if (director && director.colegio) {
      return {
        colegioId: director.colegio.id,
        colegio: director.colegio,
      };
    }

    // Si no es director, verificar si es administrativo con permisos
    const administrativo = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: usuarioId,
        rol: {
          nombre: 'ADMINISTRATIVO'
        }
      },
      include: {
        colegio: {
          select: {
            id: true,
            nombre: true,
          }
        },
        administrativo: {
          include: {
            permisos: true
          }
        }
      }
    });

    if (administrativo && administrativo.colegio && administrativo.administrativo?.permisos?.puedeGestionarSalones) {
      return {
        colegioId: administrativo.colegio.id,
        colegio: administrativo.colegio,
      };
    }

    throw new ForbiddenException('No tienes permisos para gestionar salones o no tienes colegio asignado');
  }

  // Nuevo método para obtener colegioNivelId
  private async obtenerColegioNivelId(colegioId: number, nivel: NivelEducativo) {
    const colegioNivel = await this.prisma.colegioNivel.findFirst({
      where: {
        colegioId,
        activo: true,
        puedeCrearSalones: true,
        nivel: {
          nombre: nivel as string
        }
      },
      include: {
        nivel: true
      }
    });

    if (!colegioNivel) {
      throw new ForbiddenException(`Tu colegio no está autorizado para crear salones de nivel ${nivel}`);
    }

    return colegioNivel;
  }

  private async verificarNivelAutorizado(colegioId: number, nivel: NivelEducativo) {
    // Este método ahora usa obtenerColegioNivelId internamente
    await this.obtenerColegioNivelId(colegioId, nivel);
  }

  private async verificarSalonDuplicado(
    colegioId: number, 
    colegioNivelId: number, 
    grado: string, 
    seccion: string,
    excluirId?: number
  ) {
    const salonExistente = await this.prisma.salon.findFirst({
      where: {
        colegioId,
        colegioNivelId, // ← Usar FK a colegio_nivel
        grado,
        seccion,
        activo: true,
        ...(excluirId && { id: { not: excluirId } })
      }
    });

    if (salonExistente) {
      throw new ConflictException(`Ya existe un salón "${grado} - ${seccion}" en tu colegio`);
    }
  }

}
