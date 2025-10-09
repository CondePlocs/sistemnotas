import { Injectable, UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../providers/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar usuario con sus roles
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            rol: true,
            colegio: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que el usuario esté activo
    if (user.estado !== 'activo') {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Crear payload para JWT
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map(ur => ({
        rol: ur.rol.nombre,
        colegio_id: ur.colegio_id,
        colegio_nombre: ur.colegio?.nombre || null,
      })),
    };

    // Generar token
    const access_token = this.jwtService.sign(payload);

    // Datos del usuario sin contraseña
    const { password_hash, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'Login exitoso',
      access_token,
      user: {
        ...userWithoutPassword,
        roles: payload.roles,
      },
    };
  }

  async validateUser(userId: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            rol: true,
            colegio: true,
          },
        },
      },
    });

    if (!user || user.estado !== 'activo') {
      return null;
    }

    const { password_hash, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      roles: user.roles.map(ur => ({
        rol: ur.rol.nombre,
        colegio_id: ur.colegio_id,
        colegio_nombre: ur.colegio?.nombre || null,
      })),
    };
  }

  async verifyPassword(userId: number, password: string): Promise<boolean> {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    return bcrypt.compare(password, user.password_hash);
  }

  async cambiarEstadoUsuario(userId: number, nuevoEstado: 'activo' | 'inactivo', currentUserId: number) {
    // 1. Verificar permisos del usuario actual
    let colegioId: number;

    // Buscar si es director
    const directorInfo = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: currentUserId,
        rol: { nombre: 'DIRECTOR' }
      }
    });

    if (directorInfo && directorInfo.colegio_id) {
      colegioId = directorInfo.colegio_id;
    } else {
      // Buscar si es administrativo con permisos
      const administrativoInfo = await this.prisma.administrativo.findFirst({
        where: {
          usuarioRol: {
            usuario_id: currentUserId,
            rol: { nombre: 'ADMINISTRATIVO' }
          }
        },
        include: {
          usuarioRol: true,
          permisos: true
        }
      });

      if (!administrativoInfo || !administrativoInfo.usuarioRol.colegio_id) {
        throw new ForbiddenException('Solo directores y administrativos pueden cambiar el estado de usuarios');
      }

      // Para cambiar estado de profesores, necesita permisos de profesores
      if (!administrativoInfo.permisos || !administrativoInfo.permisos.puedeRegistrarProfesores) {
        throw new ForbiddenException('No tienes permisos para cambiar el estado de usuarios');
      }

      colegioId = administrativoInfo.usuarioRol.colegio_id;
    }

    // 2. Verificar que el usuario a cambiar existe y pertenece al mismo colegio
    const usuarioACambiar = await this.prisma.usuarioRol.findFirst({
      where: {
        usuario_id: userId,
        colegio_id: colegioId
      },
      include: {
        usuario: true,
        rol: true
      }
    });

    if (!usuarioACambiar) {
      throw new NotFoundException('Usuario no encontrado o no pertenece a tu colegio');
    }

    // 3. No permitir que se desactive a sí mismo
    if (userId === currentUserId) {
      throw new ForbiddenException('No puedes cambiar tu propio estado');
    }

    // 4. Actualizar el estado del usuario
    const usuarioActualizado = await this.prisma.usuario.update({
      where: { id: userId },
      data: {
        estado: nuevoEstado,
        actualizado_en: new Date()
      },
      select: {
        id: true,
        email: true,
        nombres: true,
        apellidos: true,
        estado: true,
        actualizado_en: true
      }
    });

    return usuarioActualizado;
  }
}
