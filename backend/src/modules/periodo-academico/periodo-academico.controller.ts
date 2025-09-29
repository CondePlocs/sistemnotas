import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PeriodoAcademicoService } from './periodo-academico.service';
import { CrearPeriodoAcademicoDto, ActualizarPeriodoAcademicoDto } from './dto';

@Controller('api/periodos-academicos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PeriodoAcademicoController {
  constructor(private readonly periodoAcademicoService: PeriodoAcademicoService) {}

  // POST /api/periodos-academicos - Crear período académico
  @Post()
  @Roles('DIRECTOR')
  @HttpCode(HttpStatus.CREATED)
  async crear(@Req() request: any, @Body() crearDto: CrearPeriodoAcademicoDto) {
    const directorUserId = request.user.id;
    return this.periodoAcademicoService.crear(directorUserId, crearDto);
  }

  // GET /api/periodos-academicos - Obtener períodos del colegio del director
  @Get()
  @Roles('DIRECTOR')
  async obtenerPeriodos(@Req() request: any) {
    const directorUserId = request.user.id;
    return this.periodoAcademicoService.obtenerPorDirector(directorUserId);
  }

  // GET /api/periodos-academicos/activo - Obtener período activo
  @Get('activo')
  @Roles('DIRECTOR')
  async obtenerPeriodoActivo(@Req() request: any) {
    const directorUserId = request.user.id;
    return this.periodoAcademicoService.obtenerPeriodoActivo(directorUserId);
  }

  // GET /api/periodos-academicos/:id - Obtener período específico
  @Get(':id')
  @Roles('DIRECTOR')
  async obtenerPorId(@Req() request: any, @Param('id', ParseIntPipe) periodoId: number) {
    const directorUserId = request.user.id;
    return this.periodoAcademicoService.obtenerPorId(directorUserId, periodoId);
  }

  // PUT /api/periodos-academicos/:id - Actualizar período académico
  @Put(':id')
  @Roles('DIRECTOR')
  async actualizar(
    @Req() request: any, 
    @Param('id', ParseIntPipe) periodoId: number,
    @Body() actualizarDto: ActualizarPeriodoAcademicoDto
  ) {
    const directorUserId = request.user.id;
    return this.periodoAcademicoService.actualizar(directorUserId, periodoId, actualizarDto);
  }

  // PUT /api/periodos-academicos/:id/activar - Activar período académico
  @Put(':id/activar')
  @Roles('DIRECTOR')
  async activar(@Req() request: any, @Param('id', ParseIntPipe) periodoId: number) {
    const directorUserId = request.user.id;
    return this.periodoAcademicoService.activar(directorUserId, periodoId);
  }
}
