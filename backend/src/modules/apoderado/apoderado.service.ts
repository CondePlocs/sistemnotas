import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { CreateApoderadoDto } from './dto/create-apoderado.dto';
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
          parentesco: createApoderadoDto.parentesco,
          direccion: createApoderadoDto.direccion,
          ocupacion: createApoderadoDto.ocupacion,
          centroTrabajo: createApoderadoDto.centroTrabajo,
          telefonoTrabajo: createApoderadoDto.telefonoTrabajo,
        }
      });

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
}
