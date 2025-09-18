import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OwnerService {
  constructor(private prisma: PrismaService) {}

  async createOwner(createOwnerDto: CreateOwnerDto) {
    const { email, password, dni, nombres, apellidos, telefono } = createOwnerDto;

    // Validar que el email no exista
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Validar DNI si se proporciona
    if (dni) {
      const existingDni = await this.prisma.usuario.findUnique({
        where: { dni },
      });

      if (existingDni) {
        throw new ConflictException('El DNI ya está registrado');
      }
    }

    // Buscar o crear el rol OWNER
    let ownerRole = await this.prisma.rol.findUnique({
      where: { nombre: 'OWNER' },
    });

    if (!ownerRole) {
      ownerRole = await this.prisma.rol.create({
        data: { nombre: 'OWNER' },
      });
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      // Transacción para crear usuario y asignar rol
      const result = await this.prisma.$transaction(async (prisma) => {
        // 1. Crear el usuario
        const newUser = await prisma.usuario.create({
          data: {
            email,
            password_hash: hashedPassword,
            dni: dni || null,
            nombres: nombres || null,
            apellidos: apellidos || null,
            telefono: telefono || null,
            estado: 'activo',
          },
        });

        // 2. Asignar rol OWNER (sin colegio_id porque es global)
        const usuarioRol = await prisma.usuarioRol.create({
          data: {
            usuario_id: newUser.id,
            rol_id: ownerRole.id,
            colegio_id: null, // Owner no está vinculado a un colegio específico
            aprobado_por: null, // Se auto-aprueba
            aprobado_en: new Date(),
          },
        });

        return {
          usuario: newUser,
          rol: usuarioRol,
        };
      });

      // Retornar datos sin la contraseña
      const { password_hash, ...userWithoutPassword } = result.usuario;
      
      return {
        success: true,
        message: 'Owner registrado exitosamente',
        data: {
          usuario: userWithoutPassword,
          rol: 'OWNER',
        },
      };
    } catch (error) {
      console.error('Error al crear Owner:', error);
      throw new BadRequestException('Error al registrar el Owner');
    }
  }

  // Método para obtener todos los owners (opcional)
  async getAllOwners() {
    const owners = await this.prisma.usuario.findMany({
      where: {
        roles_usuario: {
          some: {
            rol: {
              nombre: 'OWNER',
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        dni: true,
        nombres: true,
        apellidos: true,
        telefono: true,
        estado: true,
        creado_en: true,
      },
    });

    return {
      success: true,
      data: owners,
      count: owners.length,
    };
  }
}
