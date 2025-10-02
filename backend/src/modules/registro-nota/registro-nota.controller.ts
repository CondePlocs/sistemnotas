import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Logger
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RegistroNotaService } from './registro-nota.service';
import { 
  CrearRegistroNotaDto, 
  ActualizarRegistroNotaDto, 
  GuardarNotasLoteDto 
} from './dto';

@Controller('api/registro-notas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegistroNotaController {
  private readonly logger = new Logger(RegistroNotaController.name);

  constructor(private readonly registroNotaService: RegistroNotaService) {}

  /**
   * Crear una nota individual
   * POST /api/registro-notas
   */
  @Post()
  @Roles('PROFESOR', 'DIRECTOR', 'ADMINISTRATIVO')
  @HttpCode(HttpStatus.CREATED)
  async crearNota(
    @Body() createDto: CrearRegistroNotaDto,
    @Request() req: any
  ) {
    this.logger.log(`Creando nota: ${createDto.nota} para alumno ${createDto.alumnoId} por usuario ${req.user.id}`);
    
    return await this.registroNotaService.crearNota(
      createDto,
      req.user.id,
      req.user.colegioId
    );
  }

  /**
   * Actualizar una nota existente
   * PUT /api/registro-notas/:id
   */
  @Put(':id')
  @Roles('PROFESOR', 'DIRECTOR', 'ADMINISTRATIVO')
  async actualizarNota(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: ActualizarRegistroNotaDto,
    @Request() req: any
  ) {
    this.logger.log(`Actualizando nota ${id} por usuario ${req.user.id}`);
    
    return await this.registroNotaService.actualizarNota(
      id,
      updateDto,
      req.user.id,
      req.user.colegioId
    );
  }

  /**
   * Guardar múltiples notas en lote (botón "Guardar Notas")
   * POST /api/registro-notas/lote
   */
  @Post('lote')
  @Roles('PROFESOR', 'DIRECTOR', 'ADMINISTRATIVO')
  @HttpCode(HttpStatus.OK)
  async guardarNotasLote(
    @Body() guardarDto: GuardarNotasLoteDto,
    @Request() req: any
  ) {
    this.logger.log(`Guardando lote de ${guardarDto.notas.length} notas por usuario ${req.user.id}`);
    
    return await this.registroNotaService.guardarNotasLote(
      guardarDto,
      req.user.id,
      req.user.colegioId
    );
  }

  /**
   * Obtener notas por contexto (asignación + período)
   * GET /api/registro-notas/contexto?asignacionId=X&periodoId=Y
   */
  @Get('contexto')
  @Roles('PROFESOR', 'DIRECTOR', 'ADMINISTRATIVO')
  async obtenerNotasPorContexto(
    @Query('asignacionId', ParseIntPipe) asignacionId: number,
    @Query('periodoId', ParseIntPipe) periodoId: number,
    @Request() req: any
  ) {
    this.logger.log(`Obteniendo notas del contexto asignación ${asignacionId}, período ${periodoId}`);
    
    return await this.registroNotaService.obtenerNotasPorContexto(
      asignacionId,
      periodoId,
      req.user.colegioId
    );
  }

  /**
   * Obtener notas de un alumno por período
   * GET /api/registro-notas/alumno/:alumnoId/periodo/:periodoId
   */
  @Get('alumno/:alumnoId/periodo/:periodoId')
  @Roles('PROFESOR', 'DIRECTOR', 'ADMINISTRATIVO', 'APODERADO')
  async obtenerNotasAlumnoPeriodo(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Param('periodoId', ParseIntPipe) periodoId: number,
    @Request() req: any
  ) {
    this.logger.log(`Obteniendo notas del alumno ${alumnoId} en período ${periodoId}`);
    
    return await this.registroNotaService.obtenerNotasAlumnoPeriodo(
      alumnoId,
      periodoId,
      req.user.colegioId
    );
  }

  /**
   * Calcular promedio de competencia
   * GET /api/registro-notas/promedio/competencia
   */
  @Get('promedio/competencia')
  @Roles('PROFESOR', 'DIRECTOR', 'ADMINISTRATIVO', 'APODERADO')
  async calcularPromedioCompetencia(
    @Query('alumnoId', ParseIntPipe) alumnoId: number,
    @Query('competenciaId', ParseIntPipe) competenciaId: number,
    @Query('periodoId', ParseIntPipe) periodoId: number,
    @Request() req: any
  ) {
    this.logger.log(`Calculando promedio de competencia ${competenciaId} para alumno ${alumnoId} en período ${periodoId}`);
    
    return await this.registroNotaService.calcularPromedioCompetencia(
      alumnoId,
      competenciaId,
      periodoId,
      req.user.colegioId
    );
  }

  /**
   * Calcular promedio de curso por período
   * GET /api/registro-notas/promedio/curso
   */
  @Get('promedio/curso')
  @Roles('PROFESOR', 'DIRECTOR', 'ADMINISTRATIVO', 'APODERADO')
  async calcularPromedioCurso(
    @Query('alumnoId', ParseIntPipe) alumnoId: number,
    @Query('cursoId', ParseIntPipe) cursoId: number,
    @Query('periodoId', ParseIntPipe) periodoId: number,
    @Request() req: any
  ) {
    this.logger.log(`Calculando promedio de curso ${cursoId} para alumno ${alumnoId} en período ${periodoId}`);
    
    return await this.registroNotaService.calcularPromedioCurso(
      alumnoId,
      cursoId,
      periodoId,
      req.user.colegioId
    );
  }

  /**
   * Obtener estadísticas de notas por evaluación
   * GET /api/registro-notas/estadisticas/evaluacion/:evaluacionId
   */
  @Get('estadisticas/evaluacion/:evaluacionId')
  @Roles('PROFESOR', 'DIRECTOR', 'ADMINISTRATIVO')
  async obtenerEstadisticasEvaluacion(
    @Param('evaluacionId', ParseIntPipe) evaluacionId: number,
    @Request() req: any
  ) {
    this.logger.log(`Obteniendo estadísticas de evaluación ${evaluacionId}`);
    
    // Esta funcionalidad se puede implementar después
    return {
      message: 'Estadísticas de evaluación - Por implementar',
      evaluacionId
    };
  }
}
