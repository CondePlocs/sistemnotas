import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OwnerService {
  constructor(private prisma: PrismaService) {}

  async createOwner(createOwnerDto: CreateOwnerDto) {
    const { email, password, nombres, apellidos, dni, telefono } = createOwnerDto;

    // Verificar si ya existe un usuario con ese email
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    // Verificar si ya existe un usuario con ese DNI
    if (dni) {
      const existingDni = await this.prisma.usuario.findUnique({
        where: { dni }
      });

      if (existingDni) {
        throw new ConflictException('Ya existe un usuario con ese DNI');
      }
    }

    try {
      // Hash de la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Buscar el rol OWNER
      const ownerRole = await this.prisma.rol.findUnique({
        where: { nombre: 'OWNER' }
      });

      if (!ownerRole) {
        throw new BadRequestException('Rol OWNER no encontrado');
      }

      // Crear usuario y asignar rol en una transacción
      const result = await this.prisma.$transaction(async (prisma) => {
        // Crear usuario
        const newUser = await prisma.usuario.create({
          data: {
            email,
            password_hash: hashedPassword,
            nombres,
            apellidos,
            dni,
            telefono,
            estado: 'activo',
          }
        });

        // Asignar rol OWNER (sin colegio porque es global)
        await prisma.usuarioRol.create({
          data: {
            usuario_id: newUser.id,
            rol_id: ownerRole.id,
            colegio_id: null, // OWNER no tiene colegio específico
            hecho_por: newUser.id, // Se crea a sí mismo
          }
        });

        return newUser;
      });

      // Retornar usuario sin contraseña
      const { password_hash, ...userWithoutPassword } = result;
      
      return {
        success: true,
        message: 'Owner creado exitosamente',
        user: userWithoutPassword,
      };

    } catch (error) {
      console.error('Error al crear Owner:', error);
      
      // Manejar errores específicos de Prisma
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0];
        if (field === 'email') {
          throw new ConflictException('Ya existe un usuario con ese email');
        } else if (field === 'dni') {
          throw new ConflictException('Ya existe un usuario con ese DNI');
        }
      }
      
      throw new BadRequestException('Error al registrar el Owner');
    }
  }

  // Método para obtener todos los owners (opcional)
  async getAllOwners() {
    const owners = await this.prisma.usuario.findMany({
      where: {
        roles: {
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
        nombres: true,
        apellidos: true,
        dni: true,
        telefono: true,
        estado: true,
        creado_en: true,
      },
    });

    return {
      success: true,
      owners,
    };
  }
}