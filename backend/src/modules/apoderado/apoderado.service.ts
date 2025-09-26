import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { CreateApoderadoDto, RelacionApoderadoAlumnoDto, CrearRelacionesDto, ActualizarRelacionDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApoderadoService {
  constructor(private prisma: PrismaService) {}

  async crearApoderado(createApoderadoDto: CreateApoderadoDto, userId: number) {
    // 1. Determinar si es director o administrativo y obtener el colegio
    let colegioId: number;
    let createdBy = userId;

    // Buscar si es director
    const directorInfo = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: userId,
        rol: { nombre: 'DIRECTOR' }
      },
      include: {
        colegio: {
          include: {
            ugel: { include: { dre: true } }
          }
        }
      }
    });

    if (directorInfo && directorInfo.colegio && directorInfo.colegio_id) {
      // Es director
      colegioId = directorInfo.colegio_id;
    } else {
      // Buscar si es administrativo
      const administrativoInfo = await this.prisma.administrativo.findFirst({
        where: {
          usuarioRol: {
            usuario_id: userId,
            rol: { nombre: 'ADMINISTRATIVO' }
          }
        },
        include: {
          usuarioRol: true,
          permisos: true
        }
      });

      if (!administrativoInfo || !administrativoInfo.usuarioRol.colegio_id) {
        throw new ForbiddenException('Solo directores y administrativos pueden crear apoderados');
      }

      // Verificar permisos del administrativo
      if (!administrativoInfo.permisos || !administrativoInfo.permisos.puedeRegistrarApoderados) {
        throw new ForbiddenException('No tienes permisos para registrar apoderados');
      }

      colegioId = administrativoInfo.usuarioRol.colegio_id;
    }

    // 2. Verificar que el email no esté en uso
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: createApoderadoDto.email }
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // 3. Verificar que el DNI no esté en uso (si se proporciona)
    if (createApoderadoDto.dni) {
      const existingDni = await this.prisma.usuario.findUnique({
        where: { dni: createApoderadoDto.dni }
      });

      if (existingDni) {
        throw new ConflictException('El DNI ya está registrado');
      }
    }

    // 4. Obtener el rol APODERADO
    const rolApoderado = await this.prisma.rol.findUnique({
      where: { nombre: 'APODERADO' }
    });

    if (!rolApoderado) {
      throw new NotFoundException('Rol APODERADO no encontrado');
    }

    // 5. Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createApoderadoDto.password, 10);

    // 6. Crear usuario, usuarioRol y apoderado en una transacción
    const result = await this.prisma.$transaction(async (prisma) => {
      // Crear Usuario
      const usuario = await prisma.usuario.create({
        data: {
          email: createApoderadoDto.email,
          password_hash: hashedPassword,
          dni: createApoderadoDto.dni,
          nombres: createApoderadoDto.nombres,
          apellidos: createApoderadoDto.apellidos,
          telefono: createApoderadoDto.telefono,
        }
      });

      // Crear UsuarioRol vinculado al colegio del director
      const usuarioRol = await prisma.usuarioRol.create({
        data: {
          usuario_id: usuario.id,
          rol_id: rolApoderado.id,
          colegio_id: colegioId, // ← Vinculación automática al colegio
          hecho_por: createdBy, // Auditoría: quién lo creó
          hecho_en: new Date(), // Auditoría: cuándo se creó
        }
      });

      // Crear Apoderado
      const apoderado = await prisma.apoderado.create({
        data: {
          usuarioRolId: usuarioRol.id,
          fechaNacimiento: createApoderadoDto.fechaNacimiento ? new Date(createApoderadoDto.fechaNacimiento) : null,
          sexo: createApoderadoDto.sexo,
          estadoCivil: createApoderadoDto.estadoCivil,
          nacionalidad: createApoderadoDto.nacionalidad,
          direccion: createApoderadoDto.direccion,
          ocupacion: createApoderadoDto.ocupacion,
          centroTrabajo: createApoderadoDto.centroTrabajo,
          telefonoTrabajo: createApoderadoDto.telefonoTrabajo,
        }
      });

      // Crear relaciones con alumnos si se proporcionaron
      if (createApoderadoDto.alumnos && createApoderadoDto.alumnos.length > 0) {
        // Verificar que todos los alumnos pertenecen al mismo colegio
        const alumnosIds = createApoderadoDto.alumnos.map(rel => rel.alumnoId);
        const alumnos = await prisma.alumno.findMany({
          where: {
            id: { in: alumnosIds },
            colegio: { id: colegioId }
          }
        });

        if (alumnos.length !== alumnosIds.length) {
          throw new ForbiddenException('Algunos alumnos no pertenecen a este colegio o no existen');
        }

        // Crear las relaciones (usando el nombre correcto de la tabla)
        await prisma.apoderadoAlumno.createMany({
          data: createApoderadoDto.alumnos.map(rel => ({
            apoderadoId: apoderado.id,
            alumnoId: rel.alumnoId,
            parentesco: rel.parentesco,
            esPrincipal: rel.esPrincipal || false,
            creadoPor: userId
          }))
        });
      }

      return { usuario, usuarioRol, apoderado };
    });

    // Retornar el apoderado con toda la información relacionada
    return this.prisma.apoderado.findUnique({
      where: { id: result.apoderado.id },
      include: {
        usuarioRol: {
          include: {
            usuario: {
              select: {
                id: true,
                email: true,
                dni: true,
                nombres: true,
                apellidos: true,
                telefono: true,
                estado: true,
                creado_en: true,
              }
            },
            rol: true,
            colegio: {
              include: {
                ugel: { include: { dre: true } }
              }
            },
            creadoPor: {
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
    });
  }

  async obtenerApoderados(directorUserId: number) {
    // Solo mostrar apoderados del colegio del director
    const directorInfo = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: directorUserId,
        rol: { nombre: 'DIRECTOR' }
      }
    });

    if (!directorInfo) {
      throw new ForbiddenException('Solo directores pueden ver apoderados');
    }

    return this.prisma.apoderado.findMany({
      where: {
        usuarioRol: {
          colegio_id: directorInfo.colegio_id // ← Filtro por colegio del director
        }
      },
      include: {
        usuarioRol: {
          include: {
            usuario: {
              select: {
                id: true,
                email: true,
                dni: true,
                nombres: true,
                apellidos: true,
                telefono: true,
                estado: true,
                creado_en: true,
              }
            },
            rol: true,
            colegio: {
              include: {
                ugel: { include: { dre: true } }
              }
            }
          }
        }
      },
      orderBy: { creadoEn: 'desc' }
    });
  }

  async obtenerApoderado(id: number, directorUserId: number) {
    // Verificar que el director puede ver este apoderado
    const directorInfo = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: directorUserId,
        rol: { nombre: 'DIRECTOR' }
      }
    });

    if (!directorInfo) {
      throw new ForbiddenException('Solo directores pueden ver apoderados');
    }

    const apoderado = await this.prisma.apoderado.findUnique({
      where: { id },
      include: {
        usuarioRol: {
          include: {
            usuario: {
              select: {
                id: true,
                email: true,
                dni: true,
                nombres: true,
                apellidos: true,
                telefono: true,
                estado: true,
                creado_en: true,
              }
            },
            rol: true,
            colegio: {
              include: {
                ugel: { include: { dre: true } }
              }
            }
          }
        }
      }
    });

    if (!apoderado) {
      throw new NotFoundException('Apoderado no encontrado');
    }

    // Verificar que el apoderado pertenece al colegio del director
    if (apoderado.usuarioRol.colegio_id !== directorInfo.colegio_id) {
      throw new ForbiddenException('No tienes acceso a este apoderado');
    }

    return apoderado;
  }

  // ========================================
  // NUEVOS MÉTODOS PARA GESTIÓN DE RELACIONES APODERADO-ALUMNO
  // ========================================

  /**
   * Obtener alumnos disponibles del colegio para asignar a apoderados
   */
  async obtenerAlumnosDelColegio(usuarioId: number) {
    // Obtener el colegio del usuario (director o administrativo)
    const usuarioRol = await this.prisma.usuarioRol.findFirst({
      where: { 
        usuario_id: usuarioId,
        rol: {
          nombre: {
            in: ['DIRECTOR', 'ADMINISTRATIVO']
          }
        }
      },
      include: {
        rol: true
      }
    });

    if (!usuarioRol?.colegio_id) {
      throw new ForbiddenException('Usuario no tiene acceso a alumnos');
    }

    // Si es administrativo, verificar permisos
    if (usuarioRol.rol.nombre === 'ADMINISTRATIVO') {
      const administrativo = await this.prisma.administrativo.findFirst({
        where: {
          usuarioRolId: usuarioRol.id
        }
      });

      if (administrativo) {
        const permisos = await this.prisma.permisosAdministrativo.findUnique({
          where: {
            administrativoId: administrativo.id
          }
        });

        if (!permisos?.puedeRegistrarApoderados) {
          throw new ForbiddenException('No tienes permisos para gestionar apoderados');
        }
      }
    }

    // Obtener alumnos activos del colegio que NO tengan apoderado asignado
    return this.prisma.alumno.findMany({
      where: {
        colegio: {
          id: usuarioRol.colegio_id
        },
        activo: true,
        // EXCLUIR alumnos que ya tienen apoderado
        apoderados: {
          none: {
            activo: true
          }
        }
      },
      select: {
        id: true,
        dni: true,
        nombres: true,
        apellidos: true,
        fechaNacimiento: true,
        sexo: true,
        colegio: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: [
        { apellidos: 'asc' },
        { nombres: 'asc' }
      ]
    });
  }

  /**
   * Obtener estadísticas de alumnos disponibles vs asignados
   */
  async obtenerEstadisticasAlumnos(usuarioId: number) {
    // Verificar permisos (reutilizar lógica existente)
    const usuarioRol = await this.prisma.usuarioRol.findFirst({
      where: { 
        usuario_id: usuarioId,
        rol: { nombre: { in: ['DIRECTOR', 'ADMINISTRATIVO'] } }
      }
    });

    if (!usuarioRol?.colegio_id) {
      throw new ForbiddenException('Usuario no tiene acceso a estadísticas');
    }

    // Contar alumnos totales del colegio
    const totalAlumnos = await this.prisma.alumno.count({
      where: {
        colegioId: usuarioRol.colegio_id,
        activo: true
      }
    });

    // Contar alumnos con apoderado
    const alumnosConApoderado = await this.prisma.alumno.count({
      where: {
        colegioId: usuarioRol.colegio_id,
        activo: true,
        apoderados: {
          some: {
            activo: true
          }
        }
      }
    });

    // Contar alumnos sin apoderado
    const alumnosSinApoderado = totalAlumnos - alumnosConApoderado;

    return {
      totalAlumnos,
      alumnosConApoderado,
      alumnosSinApoderado,
      porcentajeAsignado: totalAlumnos > 0 ? Math.round((alumnosConApoderado / totalAlumnos) * 100) : 0
    };
  }

  /**
   * Obtener alumnos de un apoderado específico
   */
  async obtenerAlumnosDeApoderado(apoderadoId: number, usuarioId: number) {
    // Verificar acceso del usuario
    const usuarioRol = await this.prisma.usuarioRol.findFirst({
      where: { 
        usuario_id: usuarioId,
        rol: {
          nombre: {
            in: ['DIRECTOR', 'ADMINISTRATIVO']
          }
        }
      }
    });

    if (!usuarioRol?.colegio_id) {
      throw new ForbiddenException('Usuario no tiene acceso');
    }

    // Verificar que el apoderado pertenece al mismo colegio
    const apoderado = await this.prisma.apoderado.findUnique({
      where: { id: apoderadoId },
      include: {
        usuarioRol: true
      }
    });

    if (!apoderado || apoderado.usuarioRol.colegio_id !== usuarioRol.colegio_id) {
      throw new ForbiddenException('No tienes acceso a este apoderado');
    }

    // Obtener relaciones del apoderado con alumnos
    // NOTA: Este método funcionará después de la migración
    
    return this.prisma.apoderadoAlumno.findMany({
      where: {
        apoderadoId,
        activo: true
      },
      include: {
        alumno: {
          select: {
            id: true,
            dni: true,
            nombres: true,
            apellidos: true,
            fechaNacimiento: true,
            sexo: true,
            activo: true
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
      orderBy: {
        creadoEn: 'desc'
      }
    });
    
    
    // Placeholder hasta que se ejecute la migración
    return [];
  }

  /**
   * Crear relaciones entre apoderado y alumnos
   */
  async crearRelacionesApoderadoAlumno(
    apoderadoId: number, 
    relaciones: RelacionApoderadoAlumnoDto[], 
    usuarioId: number
  ) {
    // Verificar acceso del usuario
    const usuarioRol = await this.prisma.usuarioRol.findFirst({
      where: { 
        usuario_id: usuarioId,
        rol: {
          nombre: {
            in: ['DIRECTOR', 'ADMINISTRATIVO']
          }
        }
      }
    });

    if (!usuarioRol?.colegio_id) {
      throw new ForbiddenException('Usuario no tiene acceso');
    }

    // Verificar que el apoderado existe y pertenece al mismo colegio
    const apoderado = await this.prisma.apoderado.findUnique({
      where: { id: apoderadoId },
      include: {
        usuarioRol: true
      }
    });

    if (!apoderado || apoderado.usuarioRol.colegio_id !== usuarioRol.colegio_id) {
      throw new ForbiddenException('No tienes acceso a este apoderado');
    }

    // Verificar que todos los alumnos pertenecen al mismo colegio
    const alumnosIds = relaciones.map(rel => rel.alumnoId);
    const alumnos = await this.prisma.alumno.findMany({
      where: {
        id: { in: alumnosIds },
        colegio: { id: usuarioRol.colegio_id }
      }
    });

    if (alumnos.length !== alumnosIds.length) {
      throw new ForbiddenException('Algunos alumnos no pertenecen a este colegio o no existen');
    }

    // Crear las relaciones
    // NOTA: Este método funcionará después de la migración
    
    const relacionesCreadas = await this.prisma.apoderadoAlumno.createMany({
      data: relaciones.map(rel => ({
        apoderadoId,
        alumnoId: rel.alumnoId,
        parentesco: rel.parentesco,
        esPrincipal: rel.esPrincipal || false,
        creadoPor: usuarioId
      }))
    });

    return {
      success: true,
      message: 'Relaciones creadas exitosamente',
      count: relacionesCreadas.count
    };
    

    // Placeholder hasta que se ejecute la migración
    return {
      success: true,
      message: 'Funcionalidad disponible después de la migración',
      count: 0
    };
  }

  /**
   * Actualizar una relación específica apoderado-alumno
   */
  async actualizarRelacionApoderadoAlumno(
    relacionId: number,
    actualizarDto: ActualizarRelacionDto,
    usuarioId: number
  ) {
    // Verificar acceso del usuario
    const usuarioRol = await this.prisma.usuarioRol.findFirst({
      where: { 
        usuario_id: usuarioId,
        rol: {
          nombre: {
            in: ['DIRECTOR', 'ADMINISTRATIVO']
          }
        }
      }
    });

    if (!usuarioRol?.colegio_id) {
      throw new ForbiddenException('Usuario no tiene acceso');
    }

    // NOTA: Este método funcionará después de la migración
    
    // Verificar que la relación existe y pertenece al colegio del usuario
    const relacion = await this.prisma.apoderadoAlumno.findUnique({
      where: { id: relacionId },
      include: {
        apoderado: {
          include: {
            usuarioRol: true
          }
        }
      }
    });

    if (!relacion || relacion.apoderado.usuarioRol.colegio_id !== usuarioRol.colegio_id) {
      throw new ForbiddenException('No tienes acceso a esta relación');
    }

    // Actualizar la relación
    const relacionActualizada = await this.prisma.apoderadoAlumno.update({
      where: { id: relacionId },
      data: {
        ...actualizarDto,
        actualizadoPor: usuarioId
      },
      include: {
        alumno: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        },
        apoderado: {
          include: {
            usuarioRol: {
              include: {
                usuario: {
                  select: {
                    nombres: true,
                    apellidos: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return {
      success: true,
      message: 'Relación actualizada exitosamente',
      data: relacionActualizada
    };
    

    // Placeholder hasta que se ejecute la migración
    return {
      success: true,
      message: 'Funcionalidad disponible después de la migración',
      data: null
    };
  }

  /**
   * Eliminar (desactivar) una relación apoderado-alumno
   */
  async eliminarRelacionApoderadoAlumno(relacionId: number, usuarioId: number) {
    // Verificar acceso del usuario
    const usuarioRol = await this.prisma.usuarioRol.findFirst({
      where: { 
        usuario_id: usuarioId,
        rol: {
          nombre: {
            in: ['DIRECTOR', 'ADMINISTRATIVO']
          }
        }
      }
    });

    if (!usuarioRol?.colegio_id) {
      throw new ForbiddenException('Usuario no tiene acceso');
    }

    // NOTA: Este método funcionará después de la migración
    
    // Verificar que la relación existe y pertenece al colegio del usuario
    const relacion = await this.prisma.apoderadoAlumno.findUnique({
      where: { id: relacionId },
      include: {
        apoderado: {
          include: {
            usuarioRol: true
          }
        }
      }
    });

    if (!relacion || relacion.apoderado.usuarioRol.colegio_id !== usuarioRol.colegio_id) {
      throw new ForbiddenException('No tienes acceso a esta relación');
    }

    // Soft delete - marcar como inactivo
    await this.prisma.apoderadoAlumno.update({
      where: { id: relacionId },
      data: {
        activo: false,
        actualizadoPor: usuarioId
      }
    });

    return {
      success: true,
      message: 'Relación eliminada exitosamente'
    };
    

    // Placeholder hasta que se ejecute la migración
    return {
      success: true,
      message: 'Funcionalidad disponible después de la migración'
    };
  }
}
