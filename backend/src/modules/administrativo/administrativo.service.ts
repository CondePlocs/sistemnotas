import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { CreateAdministrativoDto, UpdateAdministrativoDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdministrativoService {
  constructor(private prisma: PrismaService) {}

  async crearAdministrativo(createAdministrativoDto: CreateAdministrativoDto, userId: number) {
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
        throw new ForbiddenException('Solo directores y administrativos pueden crear administrativos');
      }

      // Verificar permisos del administrativo
      if (!administrativoInfo.permisos || !administrativoInfo.permisos.puedeRegistrarAdministrativos) {
        throw new ForbiddenException('No tienes permisos para registrar administrativos');
      }

      colegioId = administrativoInfo.usuarioRol.colegio_id;
    }

    // 2. Verificar que el email no esté en uso
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: createAdministrativoDto.email }
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // 3. Verificar que el DNI no esté en uso (si se proporciona)
    if (createAdministrativoDto.dni) {
      const existingDni = await this.prisma.usuario.findUnique({
        where: { dni: createAdministrativoDto.dni }
      });

      if (existingDni) {
        throw new ConflictException('El DNI ya está registrado');
      }
    }

    // 4. Obtener el rol ADMINISTRATIVO
    const rolAdministrativo = await this.prisma.rol.findUnique({
      where: { nombre: 'ADMINISTRATIVO' }
    });

    if (!rolAdministrativo) {
      throw new NotFoundException('Rol ADMINISTRATIVO no encontrado');
    }

    // 5. Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createAdministrativoDto.password, 10);

    // 6. Crear usuario, usuarioRol y administrativo en una transacción
    const result = await this.prisma.$transaction(async (prisma) => {
      // Crear Usuario
      const usuario = await prisma.usuario.create({
        data: {
          email: createAdministrativoDto.email,
          password_hash: hashedPassword,
          dni: createAdministrativoDto.dni,
          nombres: createAdministrativoDto.nombres,
          apellidos: createAdministrativoDto.apellidos,
          telefono: createAdministrativoDto.telefono,
        }
      });

      // Crear UsuarioRol vinculado al colegio del director
      const usuarioRol = await prisma.usuarioRol.create({
        data: {
          usuario_id: usuario.id,
          rol_id: rolAdministrativo.id,
          colegio_id: colegioId, // ← Vinculación automática al colegio
          hecho_por: createdBy, // Auditoría: quién lo creó
          hecho_en: new Date(), // Auditoría: cuándo se creó
        }
      });

      // Crear Administrativo
      const administrativo = await prisma.administrativo.create({
        data: {
          usuarioRolId: usuarioRol.id,
          fechaNacimiento: createAdministrativoDto.fechaNacimiento ? new Date(createAdministrativoDto.fechaNacimiento) : null,
          sexo: createAdministrativoDto.sexo,
          estadoCivil: createAdministrativoDto.estadoCivil,
          nacionalidad: createAdministrativoDto.nacionalidad,
          direccion: createAdministrativoDto.direccion,
          cargo: createAdministrativoDto.cargo,
          fechaIngreso: createAdministrativoDto.fechaIngreso ? new Date(createAdministrativoDto.fechaIngreso) : null,
          condicionLaboral: createAdministrativoDto.condicionLaboral,
        }
      });

      return { usuario, usuarioRol, administrativo };
    });

    // Retornar el administrativo con toda la información relacionada
    return this.prisma.administrativo.findUnique({
      where: { id: result.administrativo.id },
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

  async obtenerAdministrativos(directorUserId: number) {
    // Solo mostrar administrativos del colegio del director
    const directorInfo = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: directorUserId,
        rol: { nombre: 'DIRECTOR' }
      }
    });

    if (!directorInfo) {
      throw new ForbiddenException('Solo directores pueden ver administrativos');
    }

    const administrativos = await this.prisma.administrativo.findMany({
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
                email: true,
                nombres: true,
                apellidos: true,
              }
            }
          }
        },
        permisos: true
      },
      orderBy: { creadoEn: 'desc' }
    });

    // Obtener información de usuarios que actualizaron 
    const administrativosConActualizador = await Promise.all(
      administrativos.map(async (admin) => {
        let actualizadoPorUsuario: any = null;
        
        if (admin.actualizadoPor) {
          actualizadoPorUsuario = await this.prisma.usuario.findUnique({
            where: { id: admin.actualizadoPor },
            select: {
              id: true,
              email: true,
              nombres: true,
              apellidos: true,
            }
          });
        }

        return {
          ...admin,
          actualizadoPorUsuario
        };
      })
    );

    return administrativosConActualizador;
  }

  async obtenerAdministrativoPropio(userId: number) {
    // Obtener el administrativo que corresponde al usuario logueado
    const administrativo = await this.prisma.administrativo.findFirst({
      where: {
        usuarioRol: {
          usuario_id: userId,
          rol: { nombre: 'ADMINISTRATIVO' }
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
        },
        permisos: true
      }
    });

    if (!administrativo) {
      throw new NotFoundException('Administrativo no encontrado');
    }

    return [administrativo]; // Devolver como array para mantener compatibilidad
  }

  async obtenerAdministrativo(id: number, userId: number) {
    // Verificar si es director o administrativo
    const usuarioRol = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: userId,
        rol: { nombre: { in: ['DIRECTOR', 'ADMINISTRATIVO'] } }
      }
    });

    if (!usuarioRol) {
      throw new ForbiddenException('Solo directores y administrativos pueden ver administrativos');
    }

    const administrativo = await this.prisma.administrativo.findUnique({
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
        permisos: true
      }
    });

    if (!administrativo) {
      throw new NotFoundException('Administrativo no encontrado');
    }

    // Verificar que el administrativo pertenece al mismo colegio
    if (administrativo.usuarioRol.colegio_id !== usuarioRol.colegio_id) {
      throw new ForbiddenException('No tienes acceso a este administrativo');
    }

    return administrativo;
  }

  async actualizarAdministrativo(id: number, updateAdministrativoDto: UpdateAdministrativoDto, userId: number) {
    // Verificar permisos del usuario
    const usuarioRol = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: userId,
        rol: { nombre: { in: ['DIRECTOR', 'ADMINISTRATIVO'] } }
      }
    });

    if (!usuarioRol) {
      throw new ForbiddenException('Solo directores y administrativos pueden actualizar administrativos');
    }

    // Obtener el administrativo a actualizar
    const administrativo = await this.prisma.administrativo.findUnique({
      where: { id },
      include: {
        usuarioRol: {
          include: {
            usuario: true
          }
        }
      }
    });

    if (!administrativo) {
      throw new NotFoundException('Administrativo no encontrado');
    }

    // Verificar que pertenece al mismo colegio
    if (administrativo.usuarioRol.colegio_id !== usuarioRol.colegio_id) {
      throw new ForbiddenException('No tienes acceso a este administrativo');
    }

    // Verificar conflictos de email y DNI si se están actualizando
    if (updateAdministrativoDto.email && updateAdministrativoDto.email !== administrativo.usuarioRol.usuario.email) {
      const existingEmail = await this.prisma.usuario.findUnique({
        where: { email: updateAdministrativoDto.email }
      });
      if (existingEmail) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    if (updateAdministrativoDto.dni && updateAdministrativoDto.dni !== administrativo.usuarioRol.usuario.dni) {
      const existingDni = await this.prisma.usuario.findUnique({
        where: { dni: updateAdministrativoDto.dni }
      });
      if (existingDni) {
        throw new ConflictException('El DNI ya está registrado');
      }
    }

    // Actualizar en transacción
    const result = await this.prisma.$transaction(async (prisma) => {
      // Preparar datos del usuario
      const usuarioData: any = {};
      if (updateAdministrativoDto.email) usuarioData.email = updateAdministrativoDto.email;
      if (updateAdministrativoDto.dni) usuarioData.dni = updateAdministrativoDto.dni;
      if (updateAdministrativoDto.nombres) usuarioData.nombres = updateAdministrativoDto.nombres;
      if (updateAdministrativoDto.apellidos) usuarioData.apellidos = updateAdministrativoDto.apellidos;
      if (updateAdministrativoDto.telefono) usuarioData.telefono = updateAdministrativoDto.telefono;

      // Agregar auditoría
      if (Object.keys(usuarioData).length > 0) {
        usuarioData.actualizado_en = new Date();
      }

      // Actualizar usuario si hay cambios
      if (Object.keys(usuarioData).length > 0) {
        await prisma.usuario.update({
          where: { id: administrativo.usuarioRol.usuario.id },
          data: usuarioData
        });
      }

      // Preparar datos del administrativo
      const administrativoData: any = {};
      if (updateAdministrativoDto.fechaNacimiento) {
        administrativoData.fechaNacimiento = new Date(updateAdministrativoDto.fechaNacimiento);
      }
      if (updateAdministrativoDto.sexo) administrativoData.sexo = updateAdministrativoDto.sexo;
      if (updateAdministrativoDto.estadoCivil) administrativoData.estadoCivil = updateAdministrativoDto.estadoCivil;
      if (updateAdministrativoDto.nacionalidad) administrativoData.nacionalidad = updateAdministrativoDto.nacionalidad;
      if (updateAdministrativoDto.direccion) administrativoData.direccion = updateAdministrativoDto.direccion;
      if (updateAdministrativoDto.cargo) administrativoData.cargo = updateAdministrativoDto.cargo;
      if (updateAdministrativoDto.fechaIngreso) {
        administrativoData.fechaIngreso = new Date(updateAdministrativoDto.fechaIngreso);
      }
      if (updateAdministrativoDto.condicionLaboral) administrativoData.condicionLaboral = updateAdministrativoDto.condicionLaboral;

      // Agregar auditoría
      if (Object.keys(administrativoData).length > 0) {
        administrativoData.actualizadoEn = new Date();
      }

      // Actualizar administrativo si hay cambios
      if (Object.keys(administrativoData).length > 0) {
        await prisma.administrativo.update({
          where: { id },
          data: administrativoData
        });
      }

      return { success: true };
    });

    // Retornar el administrativo actualizado
    return this.obtenerAdministrativo(id, userId);
  }

  async cambiarEstadoAdministrativo(id: number, estado: 'activo' | 'inactivo', userId: number) {
    // Verificar permisos del usuario
    const usuarioRol = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: userId,
        rol: { nombre: { in: ['DIRECTOR', 'ADMINISTRATIVO'] } }
      }
    });

    if (!usuarioRol) {
      throw new ForbiddenException('Solo directores y administrativos pueden cambiar el estado de administrativos');
    }

    // Obtener el administrativo
    const administrativo = await this.prisma.administrativo.findUnique({
      where: { id },
      include: {
        usuarioRol: {
          include: {
            usuario: true
          }
        }
      }
    });

    if (!administrativo) {
      throw new NotFoundException('Administrativo no encontrado');
    }

    // Verificar que pertenece al mismo colegio
    if (administrativo.usuarioRol.colegio_id !== usuarioRol.colegio_id) {
      throw new ForbiddenException('No tienes acceso a este administrativo');
    }

    // Actualizar estado del usuario
    await this.prisma.usuario.update({
      where: { id: administrativo.usuarioRol.usuario.id },
      data: {
        estado,
        actualizado_en: new Date()
      }
    });

    // Retornar el administrativo actualizado
    return this.obtenerAdministrativo(id, userId);
  }
}
