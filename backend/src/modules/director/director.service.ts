import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { CreateDirectorDto } from './dto/create-director.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DirectorService {
  constructor(private prisma: PrismaService) {}

  async crearDirector(createDirectorDto: CreateDirectorDto) {
    // Verificar que el colegio existe
    const colegio = await this.prisma.colegio.findUnique({
      where: { id: createDirectorDto.colegioId },
      include: {
        ugel: {
          include: { dre: true }
        }
      }
    });

    if (!colegio) {
      throw new NotFoundException('Colegio no encontrado');
    }

    // Verificar que el colegio no tenga ya un director
    const directorExistente = await this.prisma.usuarioRol.findFirst({
      where: {
        colegio_id: createDirectorDto.colegioId,
        rol: {
          nombre: 'DIRECTOR'
        }
      },
      include: {
        usuario: {
          select: { nombres: true, apellidos: true, email: true }
        }
      }
    });

    if (directorExistente) {
      const nombreDirector = directorExistente.usuario.nombres && directorExistente.usuario.apellidos 
        ? `${directorExistente.usuario.nombres} ${directorExistente.usuario.apellidos}`
        : directorExistente.usuario.email;
      
      throw new ConflictException(
        `El colegio ya tiene un director asignado: ${nombreDirector}`
      );
    }

    // Verificar que el email no esté en uso
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: createDirectorDto.email }
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar que el DNI no esté en uso (si se proporciona)
    if (createDirectorDto.dni) {
      const existingDni = await this.prisma.usuario.findUnique({
        where: { dni: createDirectorDto.dni }
      });

      if (existingDni) {
        throw new ConflictException('El DNI ya está registrado');
      }
    }

    // Obtener el rol DIRECTOR
    const rolDirector = await this.prisma.rol.findUnique({
      where: { nombre: 'DIRECTOR' }
    });

    if (!rolDirector) {
      throw new NotFoundException('Rol DIRECTOR no encontrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createDirectorDto.password, 10);

    // Crear usuario, usuarioRol y director en una transacción
    const result = await this.prisma.$transaction(async (prisma) => {
      // 1. Crear Usuario
      const usuario = await prisma.usuario.create({
        data: {
          email: createDirectorDto.email,
          password_hash: hashedPassword,
          dni: createDirectorDto.dni,
          nombres: createDirectorDto.nombres,
          apellidos: createDirectorDto.apellidos,
          telefono: createDirectorDto.telefono,
        }
      });

      // 2. Crear UsuarioRol con auditoría
      const usuarioRol = await prisma.usuarioRol.create({
        data: {
          usuario_id: usuario.id,
          rol_id: rolDirector.id,
          colegio_id: createDirectorDto.colegioId,
          hecho_por: null, // TODO: Obtener ID del usuario autenticado que está creando
          hecho_en: new Date(), // Timestamp de creación
        }
      });

      // 3. Crear Director
      const director = await prisma.director.create({
        data: {
          usuarioRolId: usuarioRol.id,
          fechaNacimiento: createDirectorDto.fechaNacimiento ? new Date(createDirectorDto.fechaNacimiento) : null,
          sexo: createDirectorDto.sexo,
          estadoCivil: createDirectorDto.estadoCivil,
          nacionalidad: createDirectorDto.nacionalidad,
          direccion: createDirectorDto.direccion,
          gradoAcademico: createDirectorDto.gradoAcademico,
          carrera: createDirectorDto.carrera,
          especializacion: createDirectorDto.especializacion,
          institucionEgreso: createDirectorDto.institucionEgreso,
          fechaInicio: createDirectorDto.fechaInicio ? new Date(createDirectorDto.fechaInicio) : null,
        }
      });

      return { usuario, usuarioRol, director };
    });

    // Retornar el director con toda la información relacionada
    return this.prisma.director.findUnique({
      where: { id: result.director.id },
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
                ugel: {
                  include: { dre: true }
                }
              }
            }
          }
        }
      }
    });
  }

  async obtenerDirectores() {
    return this.prisma.director.findMany({
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
                ugel: {
                  include: { dre: true }
                }
              }
            }
          }
        }
      },
      orderBy: { creadoEn: 'desc' }
    });
  }

  async obtenerDirector(id: number) {
    const director = await this.prisma.director.findUnique({
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
                ugel: {
                  include: { dre: true }
                }
              }
            }
          }
        }
      }
    });

    if (!director) {
      throw new NotFoundException('Director no encontrado');
    }

    return director;
  }
}
