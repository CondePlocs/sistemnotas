import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
  ForbiddenException
} from '@nestjs/common';
import { SalonService } from './salon.service';
import { SalonAlumnosService } from './salon-alumnos.service';
import { SalonCursosService } from './salon-cursos.service';
import { CreateSalonDto } from './dto/create-salon.dto';
import { CreateSalonesLoteDto } from './dto/create-salones-lote.dto';
import { UpdateSalonDto } from './dto/update-salon.dto';
import { AsignarAlumnosDto, RemoverAlumnoDto, FiltrosAlumnosDisponiblesDto } from './dto/asignar-alumnos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../../providers/prisma.service';

@Controller('api/salones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalonController {
  constructor(
    private readonly salonService: SalonService,
    private readonly salonAlumnosService: SalonAlumnosService,
    private readonly salonCursosService: SalonCursosService,
    private readonly prisma: PrismaService
  ) {}

  // Crear un salón individual (modo manual)
  @Post()
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  @HttpCode(HttpStatus.CREATED)
  async crearSalon(@Body() createSalonDto: CreateSalonDto, @Request() req: any) {
    return this.salonService.crearSalon(createSalonDto, req.user.id);
  }

  // Crear múltiples salones (modo automático)
  @Post('lote')
  @Roles('DIRECTOR')
  @HttpCode(HttpStatus.CREATED)
  async crearSalonesLote(@Body() createSalonesLoteDto: CreateSalonesLoteDto, @Request() req: any) {
    return this.salonService.crearSalonesLote(createSalonesLoteDto, req.user.id);
  }

  // Obtener todos los salones del colegio del director
  @Get()
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async obtenerSalones(@Request() req: any) {
    return this.salonService.obtenerSalonesPorDirector(req.user.id);
  }

  // Actualizar un salón específico
  @Patch(':id')
  @Roles('DIRECTOR')
  async actualizarSalon(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSalonDto: UpdateSalonDto,
    @Request() req: any
  ) {
    return this.salonService.actualizarSalon(id, updateSalonDto, req.user.id);
  }

  // Eliminar (desactivar) un salón
  @Delete(':id')
  @Roles('DIRECTOR')
  @HttpCode(HttpStatus.OK)
  async eliminarSalon(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.salonService.eliminarSalon(id, req.user.id);
  }

  // ========================================
  // ENDPOINTS PARA GESTIÓN DE ALUMNOS
  // ========================================

  // Asignar múltiples alumnos a un salón
  @Post(':id/alumnos')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  @HttpCode(HttpStatus.CREATED)
  async asignarAlumnos(
    @Param('id', ParseIntPipe) salonId: number,
    @Body() asignarAlumnosDto: AsignarAlumnosDto,
    @Request() req: any
  ) {
    // Asegurar que el salonId del parámetro coincida con el del DTO
    asignarAlumnosDto.salonId = salonId;
    
    const resultado = await this.salonAlumnosService.asignarAlumnos(asignarAlumnosDto, req.user.id);
    
    return {
      success: true,
      message: `${resultado.totalAsignados} alumno(s) asignado(s) exitosamente al salón`,
      data: resultado
    };
  }

  // Obtener alumnos de un salón específico
  @Get(':id/alumnos')
  @Roles('DIRECTOR', 'ADMINISTRATIVO', 'PROFESOR')
  async obtenerAlumnosDeSalon(
    @Param('id', ParseIntPipe) salonId: number,
    @Request() req: any
  ) {
    const resultado = await this.salonAlumnosService.obtenerAlumnosDeSalon(salonId, req.user.id);
    
    return {
      success: true,
      data: resultado
    };
  }

  // Obtener alumnos disponibles para asignar
  @Get('alumnos-disponibles')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async obtenerAlumnosDisponibles(
    @Request() req: any,
    @Query('busqueda') busqueda?: string
  ) {
    // Obtener alumnos del colegio del usuario
    const usuario = await this.prisma.usuarioRol.findFirst({
      where: { usuario_id: req.user.id },
      include: { colegio: true }
    });

    if (!usuario || !usuario.colegio_id) {
      throw new ForbiddenException('No tienes permisos para consultar alumnos');
    }

    // Buscar alumnos activos del colegio que NO estén asignados a ningún salón
    const whereConditions: any = {
      colegioId: usuario.colegio_id,
      activo: true,
      // Excluir alumnos que ya están asignados a un salón
      salones: {
        none: {}
      }
    };

    // Filtro por búsqueda (nombre, apellido o DNI)
    if (busqueda) {
      whereConditions.OR = [
        { nombres: { contains: busqueda, mode: 'insensitive' } },
        { apellidos: { contains: busqueda, mode: 'insensitive' } },
        { dni: { contains: busqueda } }
      ];
    }

    const alumnos = await this.prisma.alumno.findMany({
      where: whereConditions,
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        dni: true,
        fechaNacimiento: true,
        sexo: true,
      },
      orderBy: [
        { apellidos: 'asc' },
        { nombres: 'asc' }
      ]
    });

    return {
      success: true,
      data: alumnos,
      total: alumnos.length
    };
  }

  // Remover alumno de un salón
  @Delete(':salonId/alumnos/:alumnoId')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  @HttpCode(HttpStatus.OK)
  async removerAlumno(
    @Param('salonId', ParseIntPipe) salonId: number,
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Request() req: any
  ) {
    const removerAlumnoDto: RemoverAlumnoDto = {
      salonId,
      alumnoId
    };
    
    const resultado = await this.salonAlumnosService.removerAlumno(removerAlumnoDto, req.user.id);
    
    return {
      success: true,
      message: resultado.message,
      data: { alumnoId: resultado.alumnoId }
    };
  }

  // ========================================
  // ENDPOINTS PARA GESTIÓN DE CURSOS
  // ========================================

  // Obtener cursos asignados a un salón
  @Get(':id/cursos')
  @Roles('DIRECTOR', 'ADMINISTRATIVO', 'PROFESOR')
  async obtenerCursosDeSalon(
    @Param('id', ParseIntPipe) salonId: number,
    @Request() req: any
  ) {
    const cursos = await this.salonCursosService.obtenerCursosDeSalon(salonId);
    
    return {
      success: true,
      cursos: cursos,
      total: cursos.length
    };
  }
}