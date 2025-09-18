import { Injectable, UnauthorizedException } from '@nestjs/common';
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
        roles_usuario: {
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
      roles: user.roles_usuario.map(ur => ({
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
        roles_usuario: {
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
      roles: user.roles_usuario.map(ur => ({
        rol: ur.rol.nombre,
        colegio_id: ur.colegio_id,
        colegio_nombre: ur.colegio?.nombre || null,
      })),
    };
  }
}
