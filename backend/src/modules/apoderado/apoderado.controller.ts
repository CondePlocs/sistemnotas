import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ApoderadoService } from './apoderado.service';
import { CreateApoderadoDto } from './dto/create-apoderado.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/apoderados')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApoderadoController {
  constructor(private readonly apoderadoService: ApoderadoService) {}

  @Post()
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async crearApoderado(@Body() createApoderadoDto: CreateApoderadoDto, @Req() request: any) {
    const userId = request.user.id;
    return this.apoderadoService.crearApoderado(createApoderadoDto, userId);
  }

  @Get()
  @Roles('DIRECTOR')
  async obtenerApoderados(@Req() request: any) {
    const directorUserId = request.user.id;
    return this.apoderadoService.obtenerApoderados(directorUserId);
  }

  // ========================================
  // NUEVOS ENDPOINTS PARA GESTIÓN DE RELACIONES
  // ========================================

  @Get('alumnos-disponibles')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async obtenerAlumnosDisponibles(@Req() request: any) {
    const usuarioId = request.user.id;
    return this.apoderadoService.obtenerAlumnosDelColegio(usuarioId);
  }

  @Get('estadisticas-alumnos')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async obtenerEstadisticasAlumnos(@Req() request: any) {
    const usuarioId = request.user.id;
    return this.apoderadoService.obtenerEstadisticasAlumnos(usuarioId);
  }

  @Get(':id')
  @Roles('DIRECTOR')
  async obtenerApoderado(@Param('id', ParseIntPipe) id: number, @Req() request: any) {
    const directorUserId = request.user.id;
    return this.apoderadoService.obtenerApoderado(id, directorUserId);
  }

  @Get(':id/alumnos')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async obtenerAlumnosDeApoderado(@Param('id', ParseIntPipe) id: number, @Req() request: any) {
    const usuarioId = request.user.id;
    return this.apoderadoService.obtenerAlumnosDeApoderado(id, usuarioId);
  }
}
