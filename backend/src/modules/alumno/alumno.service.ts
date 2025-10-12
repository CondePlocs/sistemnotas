import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { CrearAlumnoDto, ActualizarAlumnoDto } from './dto';

@Injectable()
export class AlumnoService {
  constructor(private prisma: PrismaService) {}

  async crear(crearAlumnoDto: CrearAlumnoDto, usuarioId: number) {
    try {
      // Obtener información del usuario que crea el alumno
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
          rol: true,
          colegio: true
        }
      });

      if (!usuarioRol) {
        throw new ForbiddenException('Solo directores y administrativos pueden registrar alumnos');
      }

      const colegioId = usuarioRol.colegio_id;
      if (!colegioId) {
        throw new ForbiddenException('Usuario no tiene colegio asignado');
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

          if (!permisos?.puedeRegistrarAlumnos) {
            throw new ForbiddenException('No tienes permisos para registrar alumnos');
          }
        }
      }

      // Verificar DNI único si se proporciona
      if (crearAlumnoDto.dni) {
        const alumnoExistente = await this.prisma.alumno.findUnique({
          where: { dni: crearAlumnoDto.dni }
        });

        if (alumnoExistente) {
          throw new ConflictException('Ya existe un alumno con este DNI');
        }
      }

      // Verificar código de alumno único si se proporciona
      if (crearAlumnoDto.codigoAlumno) {
        const alumnoExistente = await this.prisma.alumno.findUnique({
          where: { codigoAlumno: crearAlumnoDto.codigoAlumno }
        });

        if (alumnoExistente) {
          throw new ConflictException('Ya existe un alumno con este código');
        }
      }

      // Crear el alumno
      const alumno = await this.prisma.alumno.create({
        data: {
          dni: crearAlumnoDto.dni,
          codigoAlumno: crearAlumnoDto.codigoAlumno,
          nombres: crearAlumnoDto.nombres,
          apellidos: crearAlumnoDto.apellidos,
          fechaNacimiento: crearAlumnoDto.fechaNacimiento 
            ? new Date(crearAlumnoDto.fechaNacimiento) 
            : null,
          sexo: crearAlumnoDto.sexo,
          nacionalidad: crearAlumnoDto.nacionalidad || 'Peruana',
          direccion: crearAlumnoDto.direccion,
          distrito: crearAlumnoDto.distrito,
          numeroContacto: crearAlumnoDto.numeroContacto,
          colegio: {
            connect: { id: colegioId }
          },
          creadorUser: {
            connect: { id: usuarioId }
          }
        },
        include: {
          colegio: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      });

      return {
        success: true,
        message: 'Alumno registrado exitosamente',
        data: alumno
      };

    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof ConflictException || 
          error instanceof ForbiddenException) {
        throw error;
      }
      
      console.error('Error al crear alumno:', error);
      throw new Error('Error interno del servidor al crear alumno');
    }
  }

  async obtenerTodos(usuarioId: number, filtros?: {
    activo?: boolean;
    busqueda?: string;
    pagina?: number;
    limite?: number;
  }) {
    try {
      // Obtener colegio del usuario
      const usuarioRol = await this.prisma.usuarioRol.findFirst({
        where: { 
          usuario_id: usuarioId,
          rol: {
            nombre: {
              in: ['DIRECTOR', 'ADMINISTRATIVO', 'PROFESOR']
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

      const colegioId = usuarioRol.colegio_id;

      // Construir filtros de búsqueda
      const where: any = {
        colegio: {
          id: colegioId
        },
        ...(filtros?.activo !== undefined && { activo: filtros.activo }),
        ...(filtros?.busqueda && {
          OR: [
            { nombres: { contains: filtros.busqueda, mode: 'insensitive' } },
            { apellidos: { contains: filtros.busqueda, mode: 'insensitive' } },
            { dni: { contains: filtros.busqueda } }
          ]
        })
      };

      // Paginación
      const pagina = filtros?.pagina || 1;
      const limite = filtros?.limite || 20;
      const skip = (pagina - 1) * limite;

      // Obtener alumnos y total
      const [alumnos, total] = await Promise.all([
        this.prisma.alumno.findMany({
          where,
          skip,
          take: limite,
          orderBy: [
            { apellidos: 'asc' },
            { nombres: 'asc' }
          ],
          include: {
            colegio: {
              select: {
                id: true,
                nombre: true
              }
            },
            creadorUser: {
              select: {
                id: true,
                nombres: true,
                apellidos: true
              }
            },
            actualizadorUser: {
              select: {
                id: true,
                nombres: true,
                apellidos: true
              }
            }
          }
        }),
        this.prisma.alumno.count({ where })
      ]);

      return {
        success: true,
        data: alumnos,
        meta: {
          total,
          pagina,
          limite,
          totalPaginas: Math.ceil(total / limite)
        }
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      
      console.error('Error al obtener alumnos:', error);
      throw new Error('Error interno del servidor al obtener alumnos');
    }
  }

  async obtenerPorId(id: number, usuarioId: number) {
    try {
      // Verificar acceso del usuario
      const usuarioRol = await this.prisma.usuarioRol.findFirst({
        where: { 
          usuario_id: usuarioId,
          rol: {
            nombre: {
              in: ['DIRECTOR', 'ADMINISTRATIVO', 'PROFESOR']
            }
          }
        }
      });

      if (!usuarioRol?.colegio_id) {
        throw new ForbiddenException('Usuario no tiene acceso a alumnos');
      }

      // Buscar alumno
      const alumno = await this.prisma.alumno.findFirst({
        where: {
          id,
          colegio: {
            id: usuarioRol.colegio_id // Solo del mismo colegio
          }
        },
        include: {
          colegio: {
            select: {
              id: true,
              nombre: true
            }
          },
          creadorUser: {
            select: {
              id: true,
              nombres: true,
              apellidos: true
            }
          },
          actualizadorUser: {
            select: {
              id: true,
              nombres: true,
              apellidos: true
            }
          }
        }
      });

      if (!alumno) {
        throw new NotFoundException('Alumno no encontrado');
      }

      return {
        success: true,
        data: alumno
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      
      console.error('Error al obtener alumno:', error);
      throw new Error('Error interno del servidor al obtener alumno');
    }
  }

  async actualizar(id: number, actualizarAlumnoDto: ActualizarAlumnoDto, usuarioId: number) {
    try {
      // Verificar que el alumno existe y pertenece al colegio del usuario
      const alumnoExistente = await this.obtenerPorId(id, usuarioId);
      
      // Verificar permisos de edición
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

      if (!usuarioRol) {
        throw new ForbiddenException('Solo directores y administrativos pueden editar alumnos');
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

          if (!permisos?.puedeRegistrarAlumnos) {
            throw new ForbiddenException('No tienes permisos para editar alumnos');
          }
        }
      }

      // Verificar DNI único si se está actualizando
      if (actualizarAlumnoDto.dni && actualizarAlumnoDto.dni !== alumnoExistente.data.dni) {
        const alumnoConDni = await this.prisma.alumno.findUnique({
          where: { dni: actualizarAlumnoDto.dni }
        });

        if (alumnoConDni) {
          throw new ConflictException('Ya existe un alumno con este DNI');
        }
      }

      // Verificar código de alumno único si se está actualizando
      if (actualizarAlumnoDto.codigoAlumno && actualizarAlumnoDto.codigoAlumno !== alumnoExistente.data.codigoAlumno) {
        const alumnoConCodigo = await this.prisma.alumno.findUnique({
          where: { codigoAlumno: actualizarAlumnoDto.codigoAlumno }
        });

        if (alumnoConCodigo) {
          throw new ConflictException('Ya existe un alumno con este código');
        }
      }

      // Actualizar alumno
      const alumnoActualizado = await this.prisma.alumno.update({
        where: { id },
        data: {
          dni: actualizarAlumnoDto.dni,
          codigoAlumno: actualizarAlumnoDto.codigoAlumno,
          nombres: actualizarAlumnoDto.nombres,
          apellidos: actualizarAlumnoDto.apellidos,
          fechaNacimiento: actualizarAlumnoDto.fechaNacimiento 
            ? new Date(actualizarAlumnoDto.fechaNacimiento) 
            : undefined,
          sexo: actualizarAlumnoDto.sexo,
          nacionalidad: actualizarAlumnoDto.nacionalidad,
          direccion: actualizarAlumnoDto.direccion,
          distrito: actualizarAlumnoDto.distrito,
          numeroContacto: actualizarAlumnoDto.numeroContacto,
          activo: actualizarAlumnoDto.activo,
          actualizadoPor: usuarioId,
        },
        include: {
          colegio: {
            select: {
              id: true,
              nombre: true
            }
          },
          creadorUser: {
            select: {
              id: true,
              nombres: true,
              apellidos: true
            }
          },
          actualizadorUser: {
            select: {
              id: true,
              nombres: true,
              apellidos: true
            }
          }
        }
      });

      return {
        success: true,
        message: 'Alumno actualizado exitosamente',
        data: alumnoActualizado
      };

    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof ConflictException || 
          error instanceof ForbiddenException) {
        throw error;
      }
      
      console.error('Error al actualizar alumno:', error);
      throw new Error('Error interno del servidor al actualizar alumno');
    }
  }

  async eliminar(id: number, usuarioId: number) {
    try {
      // Verificar que el alumno existe y pertenece al colegio del usuario
      await this.obtenerPorId(id, usuarioId);
      
      // Verificar permisos (solo directores pueden eliminar)
      const usuarioRol = await this.prisma.usuarioRol.findFirst({
        where: { 
          usuario_id: usuarioId,
          rol: {
            nombre: 'DIRECTOR'
          }
        }
      });

      if (!usuarioRol) {
        throw new ForbiddenException('Solo directores pueden eliminar alumnos');
      }

      // Soft delete (marcar como inactivo)
      await this.prisma.alumno.update({
        where: { id },
        data: { activo: false }
      });

      return {
        success: true,
        message: 'Alumno eliminado exitosamente'
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      
      console.error('Error al eliminar alumno:', error);
      throw new Error('Error interno del servidor al eliminar alumno');
    }
  }
}
