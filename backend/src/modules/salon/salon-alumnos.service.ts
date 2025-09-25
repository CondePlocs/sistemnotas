import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { AsignarAlumnosDto, RemoverAlumnoDto, FiltrosAlumnosDisponiblesDto } from './dto/asignar-alumnos.dto';

@Injectable()
export class SalonAlumnosService {
  constructor(private prisma: PrismaService) {}

  // Asignar múltiples alumnos a un salón
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

    // 4. Verificar que los alumnos no estén ya asignados a otro salón activo
    await this.verificarAlumnosDisponibles(asignarAlumnosDto.alumnos.map(a => a.alumnoId));

    // 5. Crear las asignaciones en transacción
    return await this.prisma.$transaction(async (tx) => {
      const asignaciones: any[] = [];
      
      for (const alumnoDto of asignarAlumnosDto.alumnos) {
        const asignacion = await tx.alumnoSalon.create({
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
            }
          }
        });
        asignaciones.push(asignacion);
      }

      return {
        salon: salon,
        asignaciones: asignaciones,
        totalAsignados: asignaciones.length
      };
    });
  }

  // Obtener alumnos de un salón específico
  async obtenerAlumnosDeSalon(salonId: number, usuarioId: number) {
    // 1. Verificar permisos del usuario
    const usuario = await this.verificarPermisosConsulta(usuarioId);
    
    // 2. Verificar que el salón existe y pertenece al colegio del usuario
    const salon = await this.verificarSalonYColegio(salonId, usuario.colegioId);

    // 3. Obtener alumnos asignados al salón
    const asignaciones = await this.prisma.alumnoSalon.findMany({
      where: {
        salonId: salonId,
        activo: true
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

    // 4. Calcular edades y formatear respuesta
    const alumnosConEdad = asignaciones.map(asignacion => ({
      id: asignacion.id,
      fechaAsignacion: asignacion.fechaAsignacion,
      alumno: {
        ...asignacion.alumno,
        edad: this.calcularEdad(asignacion.alumno.fechaNacimiento)
      },
      asignador: asignacion.asignador
    }));

    return {
      salon: salon,
      alumnos: alumnosConEdad,
      totalAlumnos: alumnosConEdad.length
    };
  }

  // Obtener alumnos disponibles para asignar (con filtros)
  async obtenerAlumnosDisponibles(
    colegioId: number, 
    filtros: FiltrosAlumnosDisponiblesDto,
    usuarioId: number
  ) {
    // 1. Verificar permisos del usuario
    await this.verificarPermisosConsulta(usuarioId);

    // 2. Construir filtros de búsqueda
    const whereConditions: any = {
      colegioId: colegioId,
      activo: true,
      // Solo alumnos que NO tienen asignación activa a ningún salón
      salones: {
        none: {
          activo: true
        }
      }
    };

    // Filtro por búsqueda (nombre, apellido o DNI)
    if (filtros.busqueda) {
      whereConditions.OR = [
        { nombres: { contains: filtros.busqueda, mode: 'insensitive' } },
        { apellidos: { contains: filtros.busqueda, mode: 'insensitive' } },
        { dni: { contains: filtros.busqueda } }
      ];
    }

    // 3. Obtener alumnos
    const alumnos = await this.prisma.alumno.findMany({
      where: whereConditions,
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        dni: true,
        fechaNacimiento: true,
        sexo: true,
        numeroContacto: true,
      },
      orderBy: [
        { apellidos: 'asc' },
        { nombres: 'asc' }
      ]
    });

    // 4. Filtrar por edad si se especifica
    let alumnosFiltrados = alumnos;
    if (filtros.edadMinima || filtros.edadMaxima) {
      alumnosFiltrados = alumnos.filter(alumno => {
        if (!alumno.fechaNacimiento) return false;
        
        const edad = this.calcularEdad(alumno.fechaNacimiento);
        if (!edad) return false;
        
        if (filtros.edadMinima && edad < filtros.edadMinima) return false;
        if (filtros.edadMaxima && edad > filtros.edadMaxima) return false;
        
        return true;
      });
    }

    // 5. Agregar edad calculada
    const alumnosConEdad = alumnosFiltrados.map(alumno => ({
      ...alumno,
      edad: this.calcularEdad(alumno.fechaNacimiento)
    }));

    return {
      alumnos: alumnosConEdad,
      total: alumnosConEdad.length,
      filtros: filtros
    };
  }

  // Remover alumno de un salón
  async removerAlumno(removerAlumnoDto: RemoverAlumnoDto, usuarioId: number) {
    // 1. Verificar permisos del usuario
    const usuario = await this.verificarPermisosAsignacion(usuarioId);
    
    // 2. Verificar que la asignación existe
    const asignacion = await this.prisma.alumnoSalon.findFirst({
      where: {
        alumnoId: removerAlumnoDto.alumnoId,
        salonId: removerAlumnoDto.salonId,
        activo: true
      },
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

    // 4. Desactivar la asignación (soft delete)
    const asignacionActualizada = await this.prisma.alumnoSalon.update({
      where: { id: asignacion.id },
      data: {
        activo: false,
        fechaRetiro: new Date(),
        actualizadoEn: new Date()
      }
    });

    return {
      message: `${asignacion.alumno.nombres} ${asignacion.alumno.apellidos} fue removido del salón ${asignacion.salon.grado} - ${asignacion.salon.seccion}`,
      asignacion: asignacionActualizada
    };
  }

  // ========================================
  // MÉTODOS AUXILIARES SIMPLIFICADOS
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
      // Por ahora permitir a todos los administrativos
      return { colegioId: usuarioRolAdmin.colegio_id, tipo: 'ADMINISTRATIVO' };
    }

    throw new ForbiddenException('No tienes permisos para asignar alumnos');
  }

  private async verificarPermisosConsulta(usuarioId: number) {
    // Verificar cualquier rol que permita consultar
    const usuarioRol = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: usuarioId,
        rol: { 
          nombre: { 
            in: ['DIRECTOR', 'ADMINISTRATIVO', 'PROFESOR'] 
          } 
        }
      },
      include: { colegio: true, rol: true }
    });

    if (usuarioRol && usuarioRol.colegio_id) {
      return { colegioId: usuarioRol.colegio_id, tipo: usuarioRol.rol.nombre };
    }

    throw new ForbiddenException('No tienes permisos para consultar información de salones');
  }

  private async verificarSalonYColegio(salonId: number, colegioId: number) {
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
      select: {
        id: true,
        colegioId: true,
        nivel: true,
        grado: true,
        seccion: true,
        activo: true
      }
    });

    if (!salon) {
      throw new NotFoundException('Salón no encontrado');
    }

    if (!salon.activo) {
      throw new ConflictException('El salón está inactivo');
    }

    if (salon.colegioId !== colegioId) {
      throw new ForbiddenException('El salón no pertenece a tu colegio');
    }

    return salon;
  }

  private async verificarAlumnosYColegio(alumnosIds: number[], colegioId: number) {
    const alumnos = await this.prisma.alumno.findMany({
      where: {
        id: { in: alumnosIds },
        activo: true
      },
      select: {
        id: true,
        colegioId: true,
        nombres: true,
        apellidos: true
      }
    });

    if (alumnos.length !== alumnosIds.length) {
      throw new NotFoundException('Algunos alumnos no fueron encontrados o están inactivos');
    }

    const alumnosDeOtroColegio = alumnos.filter(alumno => alumno.colegioId !== colegioId);
    if (alumnosDeOtroColegio.length > 0) {
      throw new ForbiddenException('Algunos alumnos no pertenecen a tu colegio');
    }

    return alumnos;
  }

  private async verificarAlumnosDisponibles(alumnosIds: number[]) {
    const asignacionesActivas = await this.prisma.alumnoSalon.findMany({
      where: {
        alumnoId: { in: alumnosIds },
        activo: true
      },
      include: {
        alumno: { select: { nombres: true, apellidos: true } },
        salon: { select: { grado: true, seccion: true } }
      }
    });

    if (asignacionesActivas.length > 0) {
      const nombresAsignados = asignacionesActivas.map(a => 
        `${a.alumno.nombres} ${a.alumno.apellidos} (${a.salon.grado} - ${a.salon.seccion})`
      );
      throw new ConflictException(
        `Los siguientes alumnos ya están asignados a un salón: ${nombresAsignados.join(', ')}`
      );
    }
  }

  private calcularEdad(fechaNacimiento: Date | null): number | null {
    if (!fechaNacimiento) return null;
    
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();
    
    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }

  // Método para obtener colegio del usuario (usado por el controller)
  async obtenerColegioUsuario(usuarioId: number) {
    const usuarioRol = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: usuarioId,
        rol: { 
          nombre: { 
            in: ['DIRECTOR', 'ADMINISTRATIVO'] 
          } 
        }
      },
      include: { colegio: true }
    });

    if (!usuarioRol || !usuarioRol.colegio_id) {
      throw new ForbiddenException('No tienes permisos para esta operación');
    }

    return { colegioId: usuarioRol.colegio_id };
  }
}
