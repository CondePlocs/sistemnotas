import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { AsignarAlumnosDto, RemoverAlumnoDto, FiltrosAlumnosDisponiblesDto } from './dto/asignar-alumnos.dto';
import { SalonCursosService } from './salon-cursos.service';

@Injectable()
export class SalonAlumnosService {
  constructor(
    private prisma: PrismaService,
    private salonCursosService: SalonCursosService
  ) {}

  // Asignar múltiples alumnos a un salón (ESTRATEGIA REGISTRO ÚNICO)
  async asignarAlumnos(asignarAlumnosDto: AsignarAlumnosDto, usuarioId: number) {
    // 1. Verificar que el usuario tenga permisos
    const usuario = await this.verificarPermisosAsignacion(usuarioId);
    
    // 2. Verificar que el salón existe y pertenece al colegio del usuario
    const salon = await this.verificarSalonYColegio(asignarAlumnosDto.salonId, usuario.colegioId);
    
    // 3. Verificar que todos los alumnos existen y pertenecen al mismo colegio
    const alumnos = await this.verificarAlumnosYColegio(
      asignarAlumnosDto.alumnos.map(a => a.alumnoId), 
      usuario.colegioId
    );

    // 4. Procesar asignaciones con registro único por alumno
    const resultadoAsignacion = await this.prisma.$transaction(async (tx) => {
      const asignaciones: any[] = [];
      
      for (const alumnoDto of asignarAlumnosDto.alumnos) {
        // Verificar si el alumno ya tiene una asignación
        const asignacionExistente = await tx.alumnoSalon.findUnique({
          where: { alumnoId: alumnoDto.alumnoId },
          include: {
            salon: { select: { id: true, grado: true, seccion: true } }
          }
        });

        let asignacion;
        
        if (asignacionExistente) {
          // DELETE + CREATE: Eliminar registro anterior y crear nuevo (estrategia simplificada)
          await tx.alumnoSalon.delete({
            where: { alumnoId: alumnoDto.alumnoId }
          });
          
          asignacion = await tx.alumnoSalon.create({
            data: {
              alumnoId: alumnoDto.alumnoId,
              salonId: asignarAlumnosDto.salonId,
              asignadoPor: usuarioId,
            },
            include: {
              alumno: {
                select: {
                  id: true,
                  nombres: true,
                  apellidos: true,
                  dni: true,
                  fechaNacimiento: true,
                }
              },
              salon: { select: { grado: true, seccion: true } }
            }
          });
        } else {
          // CREATE: Nueva asignación para alumno sin salón previo
          asignacion = await tx.alumnoSalon.create({
            data: {
              alumnoId: alumnoDto.alumnoId,
              salonId: asignarAlumnosDto.salonId,
              asignadoPor: usuarioId,
            },
            include: {
              alumno: {
                select: {
                  id: true,
                  nombres: true,
                  apellidos: true,
                  dni: true,
                  fechaNacimiento: true,
                }
              },
              salon: { select: { grado: true, seccion: true } }
            }
          });
        }

        asignaciones.push(asignacion);
      }

      return {
        salon: salon,
        asignaciones: asignaciones,
        totalAsignados: asignaciones.length
      };
    });

    // 5. Asignar cursos automáticamente a cada alumno
    for (const asignacion of resultadoAsignacion.asignaciones) {
      try {
        await this.salonCursosService.asignarCursosAutomaticamenteAAlumno(
          asignacion.alumnoId,
          asignarAlumnosDto.salonId,
          usuarioId
        );
      } catch (error) {
        console.log(`⚠️ Error asignando cursos al alumno ${asignacion.alumnoId}:`, error);
      }
    }

    return {
      message: `Se asignaron ${resultadoAsignacion.totalAsignados} alumnos al salón ${salon.grado} - ${salon.seccion}`,
      salon: resultadoAsignacion.salon,
      asignaciones: resultadoAsignacion.asignaciones,
      totalAsignados: resultadoAsignacion.totalAsignados
    };
  }

  // Obtener alumnos de un salón específico
  async obtenerAlumnosDeSalon(salonId: number, usuarioId: number) {
    // Verificar permisos del usuario
    const usuario = await this.verificarPermisosConsulta(usuarioId);
    
    // Verificar que el salón pertenece al colegio del usuario
    const salon = await this.verificarSalonYColegio(salonId, usuario.colegioId);

    // Obtener alumnos asignados al salón
    const asignaciones = await this.prisma.alumnoSalon.findMany({
      where: {
        salonId: salonId,
      },
      include: {
        alumno: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            fechaNacimiento: true,
            sexo: true,
            numeroContacto: true,
          }
        },
        salon: {
          select: {
            grado: true,
            seccion: true,
            nivel: true,
          }
        },
        asignador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          }
        }
      },
      orderBy: [
        { alumno: { apellidos: 'asc' } },
        { alumno: { nombres: 'asc' } }
      ]
    });

    // Calcular estadísticas
    const estadisticas = {
      totalAlumnos: asignaciones.length,
      porSexo: {
        masculino: asignaciones.filter(a => a.alumno.sexo === 'masculino').length,
        femenino: asignaciones.filter(a => a.alumno.sexo === 'femenino').length,
      },
      edadPromedio: this.calcularEdadPromedio(asignaciones.map(a => a.alumno.fechaNacimiento))
    };

    return {
      salon: salon,
      asignaciones: asignaciones,
      estadisticas: estadisticas
    };
  }

  // Remover alumno de un salón (ELIMINAR REGISTRO ÚNICO)
  async removerAlumno(removerAlumnoDto: RemoverAlumnoDto, usuarioId: number) {
    // 1. Verificar permisos del usuario
    const usuario = await this.verificarPermisosAsignacion(usuarioId);
    
    // 2. Verificar que la asignación existe
    const asignacion = await this.prisma.alumnoSalon.findUnique({
      where: { alumnoId: removerAlumnoDto.alumnoId },
      include: {
        alumno: { select: { nombres: true, apellidos: true } },
        salon: { select: { grado: true, seccion: true, colegioId: true } }
      }
    });

    if (!asignacion) {
      throw new NotFoundException('No se encontró la asignación del alumno al salón');
    }

    // 3. Verificar que el salón pertenece al colegio del usuario
    if (asignacion.salon.colegioId !== usuario.colegioId) {
      throw new ForbiddenException('No tienes permisos para modificar este salón');
    }

    // 4. Eliminar la asignación (hard delete - registro único)
    await this.prisma.alumnoSalon.delete({
      where: { alumnoId: removerAlumnoDto.alumnoId }
    });

    return {
      message: `${asignacion.alumno.nombres} ${asignacion.alumno.apellidos} fue removido del salón ${asignacion.salon.grado} - ${asignacion.salon.seccion}`,
      alumnoId: removerAlumnoDto.alumnoId
    };
  }

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  private async verificarPermisosAsignacion(usuarioId: number) {
    // Verificar si es Director
    const usuarioRolDirector = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: usuarioId,
        rol: { nombre: 'DIRECTOR' }
      },
      include: { colegio: true }
    });

    if (usuarioRolDirector && usuarioRolDirector.colegio_id) {
      return { colegioId: usuarioRolDirector.colegio_id, tipo: 'DIRECTOR' };
    }

    // Verificar si es Administrativo con permisos
    const usuarioRolAdmin = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: usuarioId,
        rol: { nombre: 'ADMINISTRATIVO' }
      },
      include: { colegio: true }
    });

    if (usuarioRolAdmin && usuarioRolAdmin.colegio_id) {
      // Verificar que el administrativo tenga permisos para gestionar salones
      const administrativo = await this.prisma.administrativo.findFirst({
        where: { usuarioRolId: usuarioRolAdmin.id },
        include: { permisos: true }
      });

      if (!administrativo?.permisos?.puedeGestionarSalones) {
        throw new ForbiddenException('No tienes permisos para gestionar salones. Contacta al director para obtener permisos.');
      }

      return { colegioId: usuarioRolAdmin.colegio_id, tipo: 'ADMINISTRATIVO' };
    }

    throw new ForbiddenException('No tienes permisos para asignar alumnos a salones');
  }

  private async verificarPermisosConsulta(usuarioId: number) {
    const usuarioRol = await this.prisma.usuarioRol.findFirst({
      where: { usuario_id: usuarioId },
      include: { rol: true, colegio: true }
    });

    if (!usuarioRol || !usuarioRol.colegio_id) {
      throw new ForbiddenException('No tienes permisos para consultar salones');
    }

    return { colegioId: usuarioRol.colegio_id, rol: usuarioRol.rol.nombre };
  }

  private async verificarSalonYColegio(salonId: number, colegioId: number) {
    const salon = await this.prisma.salon.findFirst({
      where: { 
        id: salonId,
        colegioId: colegioId 
      }
    });

    if (!salon) {
      throw new NotFoundException('Salón no encontrado o no pertenece a tu colegio');
    }

    return salon;
  }

  private async verificarAlumnosYColegio(alumnosIds: number[], colegioId: number) {
    const alumnos = await this.prisma.alumno.findMany({
      where: { 
        id: { in: alumnosIds },
        colegioId: colegioId 
      }
    });

    if (alumnos.length !== alumnosIds.length) {
      const alumnosEncontrados = alumnos.map(a => a.id);
      const alumnosNoEncontrados = alumnosIds.filter(id => !alumnosEncontrados.includes(id));
      throw new NotFoundException(`Los siguientes alumnos no fueron encontrados o no pertenecen a tu colegio: ${alumnosNoEncontrados.join(', ')}`);
    }

    return alumnos;
  }

  private calcularEdadPromedio(fechasNacimiento: (Date | null)[]): number | null {
    const fechasValidas = fechasNacimiento.filter(fecha => fecha !== null) as Date[];
    
    if (fechasValidas.length === 0) return null;
    
    const hoy = new Date();
    const edades = fechasValidas.map(fecha => {
      const edad = hoy.getFullYear() - fecha.getFullYear();
      const mesActual = hoy.getMonth();
      const mesNacimiento = fecha.getMonth();
      
      if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < fecha.getDate())) {
        return edad - 1;
      }
      
      return edad;
    });
    
    return Math.round(edades.reduce((sum, edad) => sum + edad, 0) / edades.length);
  }
}