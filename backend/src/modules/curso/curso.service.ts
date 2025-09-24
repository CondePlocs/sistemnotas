import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { CrearCursoDto, ActualizarCursoDto, NivelEducativo } from './dto';

@Injectable()
export class CursoService {
  constructor(private prisma: PrismaService) {}

  // Crear curso con competencias
  async crear(usuarioId: number, crearCursoDto: CrearCursoDto) {
    // Verificar que el usuario sea Owner
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        roles: {
          include: { 
            rol: true 
          }
        }
      }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const esOwner = usuario.roles.some(ur => ur.rol.nombre === 'OWNER');
    if (!esOwner) {
      throw new ForbiddenException('Solo los owners pueden crear cursos');
    }

    // Verificar que no exista un curso con el mismo nombre y nivel
    const cursoExistente = await this.prisma.curso.findFirst({
      where: {
        nombre: crearCursoDto.nombre,
        nivel: crearCursoDto.nivel,
        activo: true
      }
    });

    if (cursoExistente) {
      throw new ConflictException(`Ya existe un curso "${crearCursoDto.nombre}" para el nivel ${crearCursoDto.nivel}`);
    }

    // Crear curso con competencias en transacción
    return await this.prisma.$transaction(async (tx) => {
      // Crear curso
      const curso = await tx.curso.create({
        data: {
          nombre: crearCursoDto.nombre,
          descripcion: crearCursoDto.descripcion,
          nivel: crearCursoDto.nivel,
          color: crearCursoDto.color || '#3B82F6', // Azul por defecto
          creadoPor: usuarioId
        }
      });

      // Crear competencias
      const competencias: any[] = [];
      for (let i = 0; i < crearCursoDto.competencias.length; i++) {
        const competencia = await tx.competencia.create({
          data: {
            cursoId: curso.id,
            nombre: crearCursoDto.competencias[i].nombre,
            orden: i + 1,
            creadoPor: usuarioId
          }
        });
        competencias.push(competencia);
      }

      return {
        ...curso,
        competencias
      };
    });
  }

  // Obtener todos los cursos (solo para owners)
  async obtenerTodos(usuarioId: number) {
    // Verificar que el usuario sea Owner
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        roles: {
          include: { 
            rol: true 
          }
        }
      }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const esOwner = usuario.roles.some(ur => ur.rol.nombre === 'OWNER');
    if (!esOwner) {
      throw new ForbiddenException('Solo los owners pueden ver todos los cursos');
    }

    return await this.prisma.curso.findMany({
      where: { activo: true },
      include: {
        competencias: {
          where: { activo: true },
          orderBy: { orden: 'asc' }
        },
        creador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true
          }
        }
      },
      orderBy: [
        { nivel: 'asc' },
        { nombre: 'asc' }
      ]
    });
  }

  // Obtener curso por ID
  async obtenerPorId(usuarioId: number, cursoId: number) {
    // Verificar que el usuario sea Owner
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        roles: {
          include: { 
            rol: true 
          }
        }
      }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const esOwner = usuario.roles.some(ur => ur.rol.nombre === 'OWNER');
    if (!esOwner) {
      throw new ForbiddenException('Solo los owners pueden ver cursos');
    }

    const curso = await this.prisma.curso.findUnique({
      where: { id: cursoId },
      include: {
        competencias: {
          where: { activo: true },
          orderBy: { orden: 'asc' }
        },
        creador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true
          }
        }
      }
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    return curso;
  }

  // Actualizar curso (básico - solo campos del curso, no competencias)
  async actualizar(usuarioId: number, cursoId: number, actualizarCursoDto: ActualizarCursoDto) {
    // Verificar que el usuario sea Owner
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        roles: {
          include: { 
            rol: true 
          }
        }
      }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const esOwner = usuario.roles.some(ur => ur.rol.nombre === 'OWNER');
    if (!esOwner) {
      throw new ForbiddenException('Solo los owners pueden actualizar cursos');
    }

    // Verificar que el curso existe
    const cursoExistente = await this.prisma.curso.findUnique({
      where: { id: cursoId }
    });

    if (!cursoExistente) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Si se actualiza nombre y nivel, verificar duplicados
    if (actualizarCursoDto.nombre || actualizarCursoDto.nivel) {
      const nombreFinal = actualizarCursoDto.nombre || cursoExistente.nombre;
      const nivelFinal = actualizarCursoDto.nivel || cursoExistente.nivel;

      const cursoDuplicado = await this.prisma.curso.findFirst({
        where: {
          nombre: nombreFinal,
          nivel: nivelFinal,
          activo: true,
          id: { not: cursoId }
        }
      });

      if (cursoDuplicado) {
        throw new ConflictException(`Ya existe un curso "${nombreFinal}" para el nivel ${nivelFinal}`);
      }
    }

    // Actualizar solo campos básicos (sin competencias por ahora)
    const { competencias, ...datosActualizar } = actualizarCursoDto;
    
    return await this.prisma.curso.update({
      where: { id: cursoId },
      data: {
        ...datosActualizar,
        actualizadoEn: new Date()
      },
      include: {
        competencias: {
          where: { activo: true },
          orderBy: { orden: 'asc' }
        },
        creador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true
          }
        }
      }
    });
  }

  // Eliminar curso (soft delete)
  async eliminar(usuarioId: number, cursoId: number) {
    // Verificar que el usuario sea Owner
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        roles: {
          include: { 
            rol: true 
          }
        }
      }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const esOwner = usuario.roles.some(ur => ur.rol.nombre === 'OWNER');
    if (!esOwner) {
      throw new ForbiddenException('Solo los owners pueden eliminar cursos');
    }

    // Verificar que el curso existe
    const curso = await this.prisma.curso.findUnique({
      where: { id: cursoId }
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Soft delete del curso y sus competencias
    return await this.prisma.$transaction(async (tx) => {
      // Desactivar competencias
      await tx.competencia.updateMany({
        where: { cursoId: cursoId },
        data: { activo: false }
      });

      // Desactivar curso
      return await tx.curso.update({
        where: { id: cursoId },
        data: { activo: false }
      });
    });
  }

  // Obtener estadísticas de cursos
  async obtenerEstadisticas(usuarioId: number) {
    // Verificar que el usuario sea Owner
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        roles: {
          include: { 
            rol: true 
          }
        }
      }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const esOwner = usuario.roles.some(ur => ur.rol.nombre === 'OWNER');
    if (!esOwner) {
      throw new ForbiddenException('Solo los owners pueden ver estadísticas');
    }

    const [totalCursos, cursosPorNivel, competenciasTotales] = await Promise.all([
      // Total de cursos activos
      this.prisma.curso.count({
        where: { activo: true }
      }),

      // Cursos por nivel
      this.prisma.curso.groupBy({
        by: ['nivel'],
        where: { activo: true },
        _count: { id: true }
      }),

      // Total de competencias activas
      this.prisma.competencia.count({
        where: { activo: true }
      })
    ]);

    return {
      totalCursos,
      competenciasTotales,
      cursosPorNivel: cursosPorNivel.map(item => ({
        nivel: item.nivel,
        cantidad: item._count.id
      }))
    };
  }
}
