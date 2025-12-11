import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProfesorAsignacionService } from './profesor-asignacion.service';
import { CrearProfesorAsignacionDto, ActualizarProfesorAsignacionDto } from './dto';

@Controller('api/profesor-asignaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProfesorAsignacionController {
  constructor(private readonly profesorAsignacionService: ProfesorAsignacionService) { }

  // Crear nueva asignación (DIRECTOR y ADMINISTRATIVO con permisos)
  @Post()
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async crear(@Body() createDto: CrearProfesorAsignacionDto, @Req() req: any) {
    return this.profesorAsignacionService.crear(createDto, req.user.id);
  }

  // Obtener todas las asignaciones del colegio (DIRECTOR y ADMINISTRATIVO con permisos)
  @Get()
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async obtenerTodas(
    @Req() req: any,
    @Query('profesorId') profesorId?: string,
    @Query('salonId') salonId?: string,
    @Query('cursoId') cursoId?: string,
    @Query('activo') activo?: string
  ) {
    const filtros = {
      ...(profesorId && { profesorId: parseInt(profesorId) }),
      ...(salonId && { salonId: parseInt(salonId) }),
      ...(cursoId && { cursoId: parseInt(cursoId) }),
      ...(activo !== undefined && { activo: activo === 'true' })
    };

    return this.profesorAsignacionService.obtenerPorDirector(req.user.id, filtros);
  }

  // Obtener asignación por ID (DIRECTOR y ADMINISTRATIVO con permisos)
  @Get(':id')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async obtenerPorId(@Param('id') id: string, @Req() req: any) {
    return this.profesorAsignacionService.obtenerPorId(parseInt(id), req.user.id);
  }

  // Actualizar asignación (DIRECTOR y ADMINISTRATIVO con permisos)
  @Put(':id')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async actualizar(
    @Param('id') id: string,
    @Body() updateDto: ActualizarProfesorAsignacionDto,
    @Req() req: any
  ) {
    return this.profesorAsignacionService.actualizar(parseInt(id), updateDto, req.user.id);
  }

  // Activar asignación (DIRECTOR y ADMINISTRATIVO con permisos)
  @Put(':id/activar')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async activar(@Param('id') id: string, @Req() req: any) {
    return this.profesorAsignacionService.cambiarEstado(parseInt(id), true, req.user.id);
  }

  // Desactivar asignación (DIRECTOR y ADMINISTRATIVO con permisos)
  @Put(':id/desactivar')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async desactivar(@Param('id') id: string, @Req() req: any) {
    return this.profesorAsignacionService.cambiarEstado(parseInt(id), false, req.user.id);
  }

  // Transferir asignación a otro profesor (DIRECTOR y ADMINISTRATIVO con permisos)
  @Put(':id/transferir-profesor')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async transferirProfesor(
    @Param('id') id: string,
    @Body() transferirDto: any, // TransferirProfesorDto
    @Req() req: any
  ) {
    return this.profesorAsignacionService.transferirProfesor(
      parseInt(id),
      transferirDto.nuevoProfesorId,
      req.user.id
    );
  }

  // Obtener asignaciones de un profesor específico (para dashboard del profesor)
  @Get('profesor/:profesorId')
  @Roles('PROFESOR', 'DIRECTOR')
  async obtenerAsignacionesDeProfesor(@Param('profesorId') profesorId: string) {
    return this.profesorAsignacionService.obtenerAsignacionesDeProfesor(parseInt(profesorId));
  }
}
