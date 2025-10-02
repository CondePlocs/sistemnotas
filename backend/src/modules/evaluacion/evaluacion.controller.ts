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
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { EvaluacionService } from './evaluacion.service';
import { CreateEvaluacionDto, UpdateEvaluacionDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/evaluaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvaluacionController {
  constructor(private readonly evaluacionService: EvaluacionService) {}

  /**
   * Obtiene las asignaciones del profesor para su dashboard
   * GET /api/evaluaciones/mis-asignaciones
   */
  @Get('mis-asignaciones')
  @Roles('PROFESOR')
  async obtenerMisAsignaciones(@Request() req) {
    return this.evaluacionService.obtenerAsignacionesProfesor(req.user.id);
  }

  /**
   * Obtiene los períodos activos de un colegio
   * GET /api/evaluaciones/periodos-activos?colegioId=1
   */
  @Get('periodos-activos')
  @Roles('PROFESOR', 'DIRECTOR', 'ADMINISTRATIVO')
  async obtenerPeriodosActivos(@Query('colegioId', ParseIntPipe) colegioId: number) {
    return this.evaluacionService.obtenerPeriodosActivos(colegioId);
  }

  /**
   * Obtiene el contexto completo de trabajo del profesor
   * Dashboard → Grupo → Período → Hoja de trabajo
   * GET /api/evaluaciones/contexto-trabajo?profesorAsignacionId=1&periodoId=1
   */
  @Get('contexto-trabajo')
  @Roles('PROFESOR')
  async obtenerContextoTrabajo(
    @Query('profesorAsignacionId', ParseIntPipe) profesorAsignacionId: number,
    @Query('periodoId', ParseIntPipe) periodoId: number,
    @Request() req
  ) {
    return this.evaluacionService.obtenerContextoTrabajo(
      profesorAsignacionId,
      periodoId,
      req.user.id
    );
  }

  /**
   * Obtiene evaluaciones por contexto específico
   * GET /api/evaluaciones/por-contexto?profesorAsignacionId=1&periodoId=1
   */
  @Get('por-contexto')
  @Roles('PROFESOR')
  async obtenerEvaluacionesPorContexto(
    @Query('profesorAsignacionId', ParseIntPipe) profesorAsignacionId: number,
    @Query('periodoId', ParseIntPipe) periodoId: number,
    @Request() req
  ) {
    return this.evaluacionService.findByContext(
      profesorAsignacionId,
      periodoId,
      req.user.id
    );
  }

  /**
   * Crea una nueva evaluación
   * POST /api/evaluaciones
   */
  @Post()
  @Roles('PROFESOR')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEvaluacionDto: CreateEvaluacionDto, @Request() req) {
    return this.evaluacionService.create(createEvaluacionDto, req.user.id);
  }

  /**
   * Obtiene una evaluación específica
   * GET /api/evaluaciones/:id
   */
  @Get(':id')
  @Roles('PROFESOR')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.evaluacionService.findOne(id, req.user.id);
  }

  /**
   * Actualiza una evaluación
   * PATCH /api/evaluaciones/:id
   */
  @Patch(':id')
  @Roles('PROFESOR')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEvaluacionDto: UpdateEvaluacionDto,
    @Request() req
  ) {
    return this.evaluacionService.update(id, updateEvaluacionDto, req.user.id);
  }

  /**
   * Elimina una evaluación
   * DELETE /api/evaluaciones/:id
   */
  @Delete(':id')
  @Roles('PROFESOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.evaluacionService.remove(id, req.user.id);
  }
}
