import { Injectable, ForbiddenException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { CreateProfesorDto } from './dto/create-profesor.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfesorService {
  constructor(private prisma: PrismaService) {}

  async crearProfesor(createProfesorDto: CreateProfesorDto, userId: number) {
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
        throw new ForbiddenException('Solo directores y administrativos pueden crear profesores');
      }

      // Verificar permisos del administrativo
      if (!administrativoInfo.permisos || !administrativoInfo.permisos.puedeRegistrarProfesores) {
        throw new ForbiddenException('No tienes permisos para registrar profesores');
      }

      colegioId = administrativoInfo.usuarioRol.colegio_id;
    }

    // 2. Verificar que el email no esté en uso
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: createProfesorDto.email }
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // 3. Verificar que el DNI no esté en uso (si se proporciona)
    if (createProfesorDto.dni) {
      const existingDni = await this.prisma.usuario.findUnique({
        where: { dni: createProfesorDto.dni }
      });

      if (existingDni) {
        throw new ConflictException('El DNI ya está registrado');
      }
    }

    // 4. Obtener el rol PROFESOR
    const rolProfesor = await this.prisma.rol.findUnique({
      where: { nombre: 'PROFESOR' }
    });

    if (!rolProfesor) {
      throw new NotFoundException('Rol PROFESOR no encontrado');
    }

    // 5. Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createProfesorDto.password, 10);

    // 6. Crear usuario, usuarioRol y profesor en una transacción
    const result = await this.prisma.$transaction(async (prisma) => {
      // Crear Usuario
      const usuario = await prisma.usuario.create({
        data: {
          email: createProfesorDto.email,
          password_hash: hashedPassword,
          dni: createProfesorDto.dni,
          nombres: createProfesorDto.nombres,
          apellidos: createProfesorDto.apellidos,
          telefono: createProfesorDto.telefono,
        }
      });

      // Crear UsuarioRol vinculado al colegio del director
      const usuarioRol = await prisma.usuarioRol.create({
        data: {
          usuario_id: usuario.id,
          rol_id: rolProfesor.id,
          colegio_id: colegioId, // ← Vinculación automática al colegio
          hecho_por: createdBy, // Auditoría: quién lo creó
          hecho_en: new Date(), // Auditoría: cuándo se creó
        }
      });

      // Crear Profesor
      const profesor = await prisma.profesor.create({
        data: {
          usuarioRolId: usuarioRol.id,
          fechaNacimiento: createProfesorDto.fechaNacimiento ? new Date(createProfesorDto.fechaNacimiento) : null,
          sexo: createProfesorDto.sexo,
          estadoCivil: createProfesorDto.estadoCivil,
          nacionalidad: createProfesorDto.nacionalidad,
          direccion: createProfesorDto.direccion,
          especialidad: createProfesorDto.especialidad,
          gradoAcademico: createProfesorDto.gradoAcademico,
          institucionEgreso: createProfesorDto.institucionEgreso,
          fechaIngreso: createProfesorDto.fechaIngreso ? new Date(createProfesorDto.fechaIngreso) : null,
          condicionLaboral: createProfesorDto.condicionLaboral,
        }
      });

      return { usuario, usuarioRol, profesor };
    });

    // Retornar el profesor con toda la información relacionada
    return this.prisma.profesor.findUnique({
      where: { id: result.profesor.id },
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


  async obtenerProfesores(directorUserId: number) {
    // Solo mostrar profesores del colegio del director
    const directorInfo = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: directorUserId,
        rol: { nombre: 'DIRECTOR' }
      }
    });

    if (!directorInfo) {
      throw new ForbiddenException('Solo directores pueden ver profesores');
    }

    return this.prisma.profesor.findMany({
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

  async obtenerProfesor(id: number, directorUserId: number) {
    // Verificar que el director puede ver este profesor
    const directorInfo = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: directorUserId,
        rol: {
          nombre: 'DIRECTOR'
        }
      }
    });

    if (!directorInfo) {
      throw new ForbiddenException('Solo los directores pueden ver profesores');
    }

    const profesor = await this.prisma.profesor.findFirst({
      where: {
        id: id,
        usuarioRol: {
          colegio_id: directorInfo.colegio_id
        }
      },
      include: {
        usuarioRol: {
          include: {
            usuario: {
              select: {
                id: true,
                nombres: true,
                apellidos: true,
                email: true,
                telefono: true,
                dni: true,
                estado: true,
                creado_en: true
              }
            },
            colegio: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        }
      }
    });

    if (!profesor) {
      throw new NotFoundException('Profesor no encontrado');
    }

    return {
      success: true,
      profesor
    };
  }

  // Obtener profesor por ID de usuario (para que el profesor vea su propia información)
  async obtenerProfesorPorUsuario(usuarioId: number) {
    const profesor = await this.prisma.profesor.findFirst({
      where: {
        usuarioRol: {
          usuario_id: usuarioId
        }
      },
      include: {
        usuarioRol: {
          include: {
            usuario: {
              select: {
                id: true,
                nombres: true,
                apellidos: true,
                email: true,
                telefono: true,
                dni: true,
                estado: true,
                creado_en: true
              }
            },
            colegio: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        }
      }
    });

    if (!profesor) {
      throw new NotFoundException('Profesor no encontrado para este usuario');
    }

    return {
      success: true,
      profesor
    };
  }
}
