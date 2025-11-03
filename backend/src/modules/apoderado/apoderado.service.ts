import { Injectable, Logger, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { NotaCalculoService } from '../registro-nota/services/nota-calculo.service';
import { IaService } from '../ia/ia.service';
import { CreateApoderadoDto, UpdateApoderadoDto, RelacionApoderadoAlumnoDto, CrearRelacionesDto, ActualizarRelacionDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApoderadoService {
  private readonly logger = new Logger(ApoderadoService.name);
  
  constructor(
    private readonly prisma: PrismaService,
    private readonly notaCalculoService: NotaCalculoService,
    private readonly iaService: IaService
  ) {}

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

  async obtenerApoderados(userId: number) {
    // Verificar permisos y obtener colegio
    const usuarioRol = await this.prisma.usuarioRol.findFirst({
      where: { usuario_id: userId },
      include: { rol: true }
    });

    if (!usuarioRol || !usuarioRol.colegio_id) {
      throw new ForbiddenException('Usuario no autorizado');
    }

    // Verificar permisos si es administrativo
    if (usuarioRol.rol.nombre === 'ADMINISTRATIVO') {
      const administrativo = await this.prisma.administrativo.findFirst({
        where: { usuarioRol: { usuario_id: userId } },
        include: { permisos: true }
      });

      if (!administrativo?.permisos?.puedeRegistrarApoderados) {
        throw new ForbiddenException('No tienes permisos para ver apoderados');
      }
    }

    return this.prisma.apoderado.findMany({
      where: {
        usuarioRol: {
          colegio_id: usuarioRol.colegio_id
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
                actualizado_en: true,
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
        },
        alumnos: {
          where: { activo: true },
          include: {
            alumno: {
              select: {
                id: true,
                dni: true,
                nombres: true,
                apellidos: true,
                fechaNacimiento: true,
                sexo: true,
                activo: true,
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
  }

  async actualizarApoderado(id: number, updateApoderadoDto: UpdateApoderadoDto, userId: number) {
    // 1. Verificar permisos y obtener colegio
    const usuarioRol = await this.prisma.usuarioRol.findFirst({
      where: { usuario_id: userId },
      include: { rol: true }
    });

    if (!usuarioRol || !usuarioRol.colegio_id) {
      throw new ForbiddenException('Usuario no autorizado');
    }

    // 2. Verificar que el apoderado existe y pertenece al mismo colegio
    const apoderado = await this.prisma.apoderado.findFirst({
      where: { 
        id,
        usuarioRol: { colegio_id: usuarioRol.colegio_id }
      },
      include: {
        usuarioRol: {
          include: { usuario: true }
        }
      }
    });

    if (!apoderado) {
      throw new NotFoundException('Apoderado no encontrado');
    }

    // 3. Verificar permisos si es administrativo
    if (usuarioRol.rol.nombre === 'ADMINISTRATIVO') {
      const administrativo = await this.prisma.administrativo.findFirst({
        where: { usuarioRol: { usuario_id: userId } },
        include: { permisos: true }
      });

      if (!administrativo?.permisos?.puedeRegistrarApoderados) {
        throw new ForbiddenException('No tienes permisos para actualizar apoderados');
      }
    }

    // 4. Verificar email único si se está cambiando
    if (updateApoderadoDto.email && updateApoderadoDto.email !== apoderado.usuarioRol.usuario.email) {
      const existingUser = await this.prisma.usuario.findUnique({
        where: { email: updateApoderadoDto.email }
      });

      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    // 5. Verificar DNI único si se está cambiando
    if (updateApoderadoDto.dni && updateApoderadoDto.dni !== apoderado.usuarioRol.usuario.dni) {
      const existingDni = await this.prisma.usuario.findUnique({
        where: { dni: updateApoderadoDto.dni }
      });

      if (existingDni) {
        throw new ConflictException('El DNI ya está registrado');
      }
    }

    // 6. Actualizar en transacción
    const result = await this.prisma.$transaction(async (prisma) => {
      // Actualizar datos de usuario si se proporcionan
      const usuarioData: any = {};
      if (updateApoderadoDto.email) usuarioData.email = updateApoderadoDto.email;
      if (updateApoderadoDto.dni) usuarioData.dni = updateApoderadoDto.dni;
      if (updateApoderadoDto.nombres) usuarioData.nombres = updateApoderadoDto.nombres;
      if (updateApoderadoDto.apellidos) usuarioData.apellidos = updateApoderadoDto.apellidos;
      if (updateApoderadoDto.telefono) usuarioData.telefono = updateApoderadoDto.telefono;

      if (Object.keys(usuarioData).length > 0) {
        usuarioData.actualizado_en = new Date();
        await prisma.usuario.update({
          where: { id: apoderado.usuarioRol.usuario.id },
          data: usuarioData
        });
      }

      // Actualizar datos específicos del apoderado
      const apoderadoData: any = {};
      if (updateApoderadoDto.fechaNacimiento) apoderadoData.fechaNacimiento = new Date(updateApoderadoDto.fechaNacimiento);
      if (updateApoderadoDto.sexo) apoderadoData.sexo = updateApoderadoDto.sexo;
      if (updateApoderadoDto.estadoCivil) apoderadoData.estadoCivil = updateApoderadoDto.estadoCivil;
      if (updateApoderadoDto.nacionalidad) apoderadoData.nacionalidad = updateApoderadoDto.nacionalidad;
      if (updateApoderadoDto.direccion) apoderadoData.direccion = updateApoderadoDto.direccion;
      if (updateApoderadoDto.ocupacion) apoderadoData.ocupacion = updateApoderadoDto.ocupacion;
      if (updateApoderadoDto.centroTrabajo) apoderadoData.centroTrabajo = updateApoderadoDto.centroTrabajo;
      if (updateApoderadoDto.telefonoTrabajo) apoderadoData.telefonoTrabajo = updateApoderadoDto.telefonoTrabajo;

      if (Object.keys(apoderadoData).length > 0) {
        apoderadoData.actualizadoPor = userId;
        apoderadoData.actualizadoEn = new Date();
        await prisma.apoderado.update({
          where: { id },
          data: apoderadoData
        });
      }

      // Obtener el apoderado actualizado
      return await prisma.apoderado.findUnique({
        where: { id },
        include: {
          usuarioRol: {
            include: {
              usuario: true,
              colegio: true
            }
          },
          alumnos: {
            where: { activo: true },
            include: {
              alumno: true
            }
          }
        }
      });
    });

    return result;
  }

  async cambiarEstadoApoderado(id: number, estado: 'activo' | 'inactivo', userId: number) {
    // 1. Verificar permisos
    const usuarioRol = await this.prisma.usuarioRol.findFirst({
      where: { usuario_id: userId },
      include: { rol: true }
    });

    if (!usuarioRol || !usuarioRol.colegio_id) {
      throw new ForbiddenException('Usuario no autorizado');
    }

    // 2. Verificar que el apoderado existe y pertenece al mismo colegio
    const apoderado = await this.prisma.apoderado.findFirst({
      where: { 
        id,
        usuarioRol: { colegio_id: usuarioRol.colegio_id }
      },
      include: {
        usuarioRol: {
          include: { usuario: true }
        }
      }
    });

    if (!apoderado) {
      throw new NotFoundException('Apoderado no encontrado');
    }

    // 3. Verificar permisos si es administrativo
    if (usuarioRol.rol.nombre === 'ADMINISTRATIVO') {
      const administrativo = await this.prisma.administrativo.findFirst({
        where: { usuarioRol: { usuario_id: userId } },
        include: { permisos: true }
      });

      if (!administrativo?.permisos?.puedeRegistrarApoderados) {
        throw new ForbiddenException('No tienes permisos para cambiar el estado de apoderados');
      }
    }

    // 4. Actualizar estado del usuario
    await this.prisma.usuario.update({
      where: { id: apoderado.usuarioRol.usuario.id },
      data: { 
        estado,
        actualizado_en: new Date()
      }
    });

    return {
      success: true,
      message: `Apoderado ${estado === 'activo' ? 'activado' : 'desactivado'} exitosamente`
    };
  }

  // ========================================
  // MÉTODOS PARA EL DASHBOARD DEL APODERADO
  // ========================================

  /**
   * Obtener los alumnos a cargo del apoderado autenticado
   */
  async obtenerMisAlumnosComoApoderado(userId: number) {
    // 1. Buscar las relaciones apoderado-alumno usando la cadena correcta
    const relaciones = await this.prisma.apoderadoAlumno.findMany({
      where: {
        apoderado: {
          usuarioRol: {
            usuario_id: userId
          }
        },
        activo: true
      },
      include: {
        alumno: {
          include: {
            colegio: {
              select: {
                id: true,
                nombre: true
              }
            },
            salon: {
              include: {
                salon: {
                  include: {
                    colegioNivel: {
                      include: {
                        nivel: {
                          select: {
                            id: true,
                            nombre: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { esPrincipal: 'desc' },
        { alumno: { apellidos: 'asc' } },
        { alumno: { nombres: 'asc' } }
      ]
    });

    return {
      success: true,
      data: relaciones
    };
  }

  /**
   * Obtener los cursos de un alumno específico (solo si el apoderado tiene acceso)
   */
  async obtenerCursosDelAlumno(alumnoId: number, userId: number) {
    // 1. Verificar que el apoderado tiene acceso a este alumno
    await this.verificarAccesoAlumno(alumnoId, userId);

    // 2. Obtener el salón del alumno
    const alumnoSalon = await this.prisma.alumnoSalon.findFirst({
      where: {
        alumnoId: alumnoId
      },
      include: {
        salon: true
      }
    });

    if (!alumnoSalon) {
      return {
        success: true,
        data: []
      };
    }

    // 3. Obtener las asignaciones de profesores para este salón
    const asignaciones = await this.prisma.profesorAsignacion.findMany({
      where: {
        salonId: alumnoSalon.salonId,
        activo: true
      },
      include: {
        curso: {
          include: {
            competencias: {
              where: { activo: true },
              orderBy: { orden: 'asc' }
            }
          }
        },
        profesor: {
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
      data: asignaciones.map(asignacion => ({
        id: asignacion.curso.id,
        nombre: asignacion.curso.nombre,
        descripcion: asignacion.curso.descripcion,
        color: asignacion.curso.color,
        profesor: {
          id: asignacion.profesor.id,
          nombres: asignacion.profesor.usuarioRol.usuario.nombres,
          apellidos: asignacion.profesor.usuarioRol.usuario.apellidos
        },
        competencias: asignacion.curso.competencias
      }))
    };
  }

  /**
   * Obtener los profesores de un alumno específico
   */
  async obtenerProfesoresDelAlumno(alumnoId: number, userId: number) {
    // 1. Verificar que el apoderado tiene acceso a este alumno
    await this.verificarAccesoAlumno(alumnoId, userId);

    // 2. Obtener el salón del alumno
    const alumnoSalon = await this.prisma.alumnoSalon.findFirst({
      where: {
        alumnoId: alumnoId
      }
    });

    if (!alumnoSalon) {
      return {
        success: true,
        data: []
      };
    }

    // 3. Obtener los profesores únicos que enseñan en este salón
    const profesores = await this.prisma.profesorAsignacion.findMany({
      where: {
        salonId: alumnoSalon.salonId,
        activo: true
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
        curso: {
          select: {
            id: true,
            nombre: true,
            color: true
          }
        }
      },
      distinct: ['profesorId']
    });

    return {
      success: true,
      data: profesores.map(asignacion => ({
        id: asignacion.profesor.id,
        nombres: asignacion.profesor.usuarioRol.usuario.nombres,
        apellidos: asignacion.profesor.usuarioRol.usuario.apellidos,
        email: asignacion.profesor.usuarioRol.usuario.email,
        cursos: [asignacion.curso]
      }))
    };
  }

  /**
   * Obtener detalle completo de un curso específico de un alumno
   */
  async obtenerDetalleCursoAlumno(alumnoId: number, cursoId: number, userId: number) {
    this.logger.log(`Obteniendo detalle del curso ${cursoId} para alumno ${alumnoId}`);
    
    // 1. Verificar que el apoderado tiene acceso a este alumno
    await this.verificarAccesoAlumno(alumnoId, userId);

    // 2. Obtener información del alumno y su colegio
    const alumno = await this.prisma.alumno.findUnique({
      where: { id: alumnoId },
      include: {
        colegio: true,
        salon: {
          include: {
            salon: true
          }
        }
      }
    });

    if (!alumno) {
      throw new NotFoundException('Alumno no encontrado');
    }

    // 3. Obtener el periodo académico activo del colegio
    const periodoActivo = await this.prisma.periodoAcademico.findFirst({
      where: {
        colegioId: alumno.colegioId,
        activo: true
      }
    });

    if (!periodoActivo) {
      throw new NotFoundException('No hay periodo académico activo');
    }

    this.logger.log(`Periodo activo encontrado: ${periodoActivo.nombre} (ID: ${periodoActivo.id})`);
    this.logger.log(`Alumno en salón: ${alumno.salon?.salonId || 'Sin salón asignado'}`);

    // 4. Obtener la asignación del profesor para este salón y curso
    let profesorAsignacionId: number | null = null;
    if (alumno.salon) {
      const asignacion = await this.prisma.profesorAsignacion.findFirst({
        where: {
          salonId: alumno.salon.salonId,
          cursoId: cursoId,
          activo: true
        }
      });
      profesorAsignacionId = asignacion?.id || null;
      this.logger.log(`Asignación profesor encontrada: ${profesorAsignacionId || 'No encontrada'}`);
    }

    // 5. Obtener información básica del curso con evaluaciones filtradas
    const curso = await this.prisma.curso.findUnique({
      where: { id: cursoId },
      include: {
        competencias: {
          where: { activo: true },
          include: {
            evaluaciones: {
              where: {
                periodoId: periodoActivo.id,
                ...(profesorAsignacionId && { profesorAsignacionId: profesorAsignacionId })
              },
              include: {
                notas: {
                  where: { alumnoId: alumnoId }
                }
              },
              orderBy: { fechaEvaluacion: 'asc' }
            }
          },
          orderBy: { orden: 'asc' }
        }
      }
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    // 6. Obtener información del profesor (reutilizar la asignación ya obtenida)
    let profesor: any = null;
    if (profesorAsignacionId) {
      const asignacion = await this.prisma.profesorAsignacion.findUnique({
        where: { id: profesorAsignacionId },
        include: {
          profesor: {
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

      if (asignacion) {
        profesor = {
          id: asignacion.profesor.id,
          nombres: asignacion.profesor.usuarioRol.usuario.nombres,
          apellidos: asignacion.profesor.usuarioRol.usuario.apellidos
        };
      }
    }

    // Log de resultados para debug
    const totalEvaluaciones = curso.competencias.reduce((total, comp) => total + comp.evaluaciones.length, 0);
    this.logger.log(`Evaluaciones encontradas: ${totalEvaluaciones} (filtradas por periodo ${periodoActivo.id} y asignación ${profesorAsignacionId})`);

    // 7. Calcular promedios usando NotaCalculoService + Estimaciones IA
    const competenciasConPromedios = await Promise.all(curso.competencias.map(async competencia => {
      const evaluacionesConNotas = await Promise.all(competencia.evaluaciones.map(async evaluacion => {
        let nota = evaluacion.notas[0]?.nota || null;
        let esEstimacion = false;
        
        // Si no hay nota registrada, intentar obtener estimación IA
        if (!nota) {
          try {
            // Obtener la asignación del profesor para esta evaluación
            const evaluacionCompleta = await this.prisma.evaluacion.findUnique({
              where: { id: evaluacion.id },
              select: { profesorAsignacionId: true }
            });
            
            if (evaluacionCompleta?.profesorAsignacionId) {
              const estimacion = await this.iaService.estimarNota({
                alumnoId: alumnoId,
                competenciaId: competencia.id,
                profesorAsignacionId: evaluacionCompleta.profesorAsignacionId,
                proximaTarea: 1 // Usar 1 como valor estándar para estimaciones de padres
              });
              
              // Solo usar la estimación si tiene confianza mínima
              if (estimacion.confianza >= 0.3) {
                nota = estimacion.notaEstimadaLiteral;
                esEstimacion = true;
              }
            }
          } catch (error) {
            // Si falla la estimación, continuar sin nota
            this.logger.warn(`Error al generar estimación IA para evaluación ${evaluacion.id}: ${error.message}`);
          }
        }
        
        return {
          id: evaluacion.id,
          nombre: evaluacion.nombre,
          fechaEvaluacion: evaluacion.fechaEvaluacion,
          nota: nota,
          esEstimacion: esEstimacion
        };
      }));

      // Calcular promedio de la competencia usando el servicio de cálculo
      const notasValidas = evaluacionesConNotas
        .map(e => e.nota)
        .filter(nota => nota !== null && nota !== undefined) as string[];
      
      let promedioCompetencia: string | null = null;
      if (notasValidas.length > 0) {
        const valoresEscala = notasValidas.map(nota => 
          this.notaCalculoService.convertirAEscalaCalculo(nota)
        );
        const resultado = this.notaCalculoService.calcularPromedioEscalaCalculo(valoresEscala);
        promedioCompetencia = resultado.propuestaLiteral;
      }

      return {
        id: competencia.id,
        nombre: competencia.nombre,
        promedio: promedioCompetencia,
        evaluaciones: evaluacionesConNotas
      };
    }));

    // 8. Calcular promedio general del curso
    const promediosCompetencias = competenciasConPromedios
      .map(c => c.promedio)
      .filter(p => p !== null) as string[];
    
    let promedioGeneral: string | null = null;
    if (promediosCompetencias.length > 0) {
      const valoresEscala = promediosCompetencias.map(nota => 
        this.notaCalculoService.convertirAEscalaCalculo(nota)
      );
      const resultado = this.notaCalculoService.calcularPromedioCurso(valoresEscala);
      promedioGeneral = resultado.propuestaLiteral;
    }

    return {
      success: true,
      data: {
        id: curso.id,
        nombre: curso.nombre,
        descripcion: curso.descripcion,
        color: curso.color,
        profesor: profesor,
        promedioGeneral: promedioGeneral,
        competencias: competenciasConPromedios
      }
    };
  }

  /**
   * Método auxiliar para verificar que el apoderado tiene acceso al alumno
   */
  private async verificarAccesoAlumno(alumnoId: number, userId: number) {
    const apoderado = await this.prisma.apoderado.findFirst({
      where: {
        usuarioRol: {
          usuario_id: userId,
          rol: { nombre: 'APODERADO' }
        }
      }
    });

    if (!apoderado) {
      throw new NotFoundException('Apoderado no encontrado');
    }

    const relacion = await this.prisma.apoderadoAlumno.findFirst({
      where: {
        apoderadoId: apoderado.id,
        alumnoId: alumnoId,
        activo: true
      }
    });

    if (!relacion) {
      throw new ForbiddenException('No tienes acceso a este alumno');
    }

    return relacion;
  }
}
