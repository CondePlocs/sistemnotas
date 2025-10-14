import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ApoderadoService } from './apoderado.service';
import { CreateApoderadoDto, UpdateApoderadoDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/apoderados')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApoderadoController {
  constructor(private readonly apoderadoService: ApoderadoService) {}

  // ========================================
  // ENDPOINTS PARA EL DASHBOARD DEL APODERADO (DEBEN IR PRIMERO)
  // ========================================

  @Get('mis-alumnos')
  @Roles('APODERADO')
  async obtenerMisAlumnos(@Req() request: any) {
    const userId = request.user.id;
    return this.apoderadoService.obtenerMisAlumnosComoApoderado(userId);
  }

  @Get('alumno/:alumnoId/cursos')
  @Roles('APODERADO')
  async obtenerCursosDelAlumno(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Req() request: any
  ) {
    const userId = request.user.id;
    return this.apoderadoService.obtenerCursosDelAlumno(alumnoId, userId);
  }

  @Get('alumno/:alumnoId/profesores')
  @Roles('APODERADO')
  async obtenerProfesoresDelAlumno(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Req() request: any
  ) {
    const userId = request.user.id;
    return this.apoderadoService.obtenerProfesoresDelAlumno(alumnoId, userId);
  }

  @Get('alumno/:alumnoId/curso/:cursoId')
  @Roles('APODERADO')
  async obtenerDetalleCursoDelAlumno(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Param('cursoId', ParseIntPipe) cursoId: number,
    @Req() request: any
  ) {
    const userId = request.user.id;
    return this.apoderadoService.obtenerDetalleCursoAlumno(alumnoId, cursoId, userId);
  }

  // ========================================
  // ENDPOINTS PARA ADMINISTRACIÓN (DIRECTOR/ADMINISTRATIVO)
  // ========================================

  @Post()
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async crearApoderado(@Body() createApoderadoDto: CreateApoderadoDto, @Req() request: any) {
    const userId = request.user.id;
    return this.apoderadoService.crearApoderado(createApoderadoDto, userId);
  }

  @Get()
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async obtenerApoderados(@Req() request: any) {
    const userId = request.user.id;
    return this.apoderadoService.obtenerApoderados(userId);
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
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async obtenerApoderado(@Param('id', ParseIntPipe) id: number, @Req() request: any) {
    const userId = request.user.id;
    return this.apoderadoService.obtenerApoderado(id, userId);
  }

  @Put(':id')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async actualizarApoderado(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateApoderadoDto: UpdateApoderadoDto,
    @Req() request: any
  ) {
    const userId = request.user.id;
    return this.apoderadoService.actualizarApoderado(id, updateApoderadoDto, userId);
  }

  @Put(':id/estado')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async cambiarEstadoApoderado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estado: 'activo' | 'inactivo' },
    @Req() request: any
  ) {
    const userId = request.user.id;
    return this.apoderadoService.cambiarEstadoApoderado(id, body.estado, userId);
  }

  @Get(':id/alumnos')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async obtenerAlumnosDeApoderado(@Param('id', ParseIntPipe) id: number, @Req() request: any) {
    const usuarioId = request.user.id;
    return this.apoderadoService.obtenerAlumnosDeApoderado(id, usuarioId);
  }
}
