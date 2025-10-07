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

  async actualizarDirector(id: number, updateDirectorDto: any) {
    // Verificar que el director existe
    const directorExistente = await this.prisma.director.findUnique({
      where: { id },
      include: {
        usuarioRol: {
          include: {
            usuario: true
          }
        }
      }
    });

    if (!directorExistente) {
      throw new NotFoundException('Director no encontrado');
    }

    // Si se va a cambiar el colegio, verificar que no tenga ya un director
    if (updateDirectorDto.colegioId && updateDirectorDto.colegioId !== directorExistente.usuarioRol.colegio_id) {
      const directorEnNuevoColegio = await this.prisma.usuarioRol.findFirst({
        where: {
          colegio_id: updateDirectorDto.colegioId,
          rol: {
            nombre: 'DIRECTOR'
          },
          id: {
            not: directorExistente.usuarioRolId
          }
        }
      });

      if (directorEnNuevoColegio) {
        throw new ConflictException('El colegio ya tiene un director asignado');
      }
    }

    // Verificar email único (si se está cambiando)
    if (updateDirectorDto.email && updateDirectorDto.email !== directorExistente.usuarioRol.usuario.email) {
      const existingEmail = await this.prisma.usuario.findUnique({
        where: { email: updateDirectorDto.email }
      });

      if (existingEmail) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    // Verificar DNI único (si se está cambiando)
    if (updateDirectorDto.dni && updateDirectorDto.dni !== directorExistente.usuarioRol.usuario.dni) {
      const existingDni = await this.prisma.usuario.findUnique({
        where: { dni: updateDirectorDto.dni }
      });

      if (existingDni) {
        throw new ConflictException('El DNI ya está registrado');
      }
    }

    // Actualizar en transacción
    await this.prisma.$transaction(async (prisma) => {
      // 1. Actualizar Usuario
      const usuarioData: any = {};
      if (updateDirectorDto.email) usuarioData.email = updateDirectorDto.email;
      if (updateDirectorDto.dni) usuarioData.dni = updateDirectorDto.dni;
      if (updateDirectorDto.nombres) usuarioData.nombres = updateDirectorDto.nombres;
      if (updateDirectorDto.apellidos) usuarioData.apellidos = updateDirectorDto.apellidos;
      if (updateDirectorDto.telefono) usuarioData.telefono = updateDirectorDto.telefono;
      
      if (updateDirectorDto.password) {
        usuarioData.password_hash = await bcrypt.hash(updateDirectorDto.password, 10);
      }

      if (Object.keys(usuarioData).length > 0) {
        await prisma.usuario.update({
          where: { id: directorExistente.usuarioRol.usuario_id },
          data: usuarioData
        });
      }

      // 2. Actualizar UsuarioRol (si cambia colegio)
      if (updateDirectorDto.colegioId) {
        await prisma.usuarioRol.update({
          where: { id: directorExistente.usuarioRolId },
          data: {
            colegio_id: updateDirectorDto.colegioId
          }
        });
      }

      // 3. Actualizar Director
      const directorData: any = {};
      if (updateDirectorDto.fechaNacimiento) directorData.fechaNacimiento = new Date(updateDirectorDto.fechaNacimiento);
      if (updateDirectorDto.sexo) directorData.sexo = updateDirectorDto.sexo;
      if (updateDirectorDto.estadoCivil) directorData.estadoCivil = updateDirectorDto.estadoCivil;
      if (updateDirectorDto.nacionalidad) directorData.nacionalidad = updateDirectorDto.nacionalidad;
      if (updateDirectorDto.direccion) directorData.direccion = updateDirectorDto.direccion;
      if (updateDirectorDto.gradoAcademico) directorData.gradoAcademico = updateDirectorDto.gradoAcademico;
      if (updateDirectorDto.carrera) directorData.carrera = updateDirectorDto.carrera;
      if (updateDirectorDto.especializacion) directorData.especializacion = updateDirectorDto.especializacion;
      if (updateDirectorDto.institucionEgreso) directorData.institucionEgreso = updateDirectorDto.institucionEgreso;
      if (updateDirectorDto.fechaInicio) directorData.fechaInicio = new Date(updateDirectorDto.fechaInicio);

      if (Object.keys(directorData).length > 0) {
        await prisma.director.update({
          where: { id },
          data: directorData
        });
      }
    });

    // Retornar director actualizado
    return this.obtenerDirector(id);
  }

  async desactivarDirector(id: number) {
    const director = await this.prisma.director.findUnique({
      where: { id },
      include: {
        usuarioRol: {
          include: {
            usuario: true
          }
        }
      }
    });

    if (!director) {
      throw new NotFoundException('Director no encontrado');
    }

    // Desactivar usuario
    await this.prisma.usuario.update({
      where: { id: director.usuarioRol.usuario_id },
      data: { estado: 'inactivo' }
    });

    return { message: 'Director desactivado exitosamente' };
  }

  async activarDirector(id: number) {
    const director = await this.prisma.director.findUnique({
      where: { id },
      include: {
        usuarioRol: {
          include: {
            usuario: true
          }
        }
      }
    });

    if (!director) {
      throw new NotFoundException('Director no encontrado');
    }

    // Activar usuario
    await this.prisma.usuario.update({
      where: { id: director.usuarioRol.usuario_id },
      data: { estado: 'activo' }
    });

    return { message: 'Director activado exitosamente' };
  }
}
