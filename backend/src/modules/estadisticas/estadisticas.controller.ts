import { Controller, Get, UseGuards, Logger, Param, ParseIntPipe, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EstadisticasService } from './estadisticas.service';
import { DistribucionLogrosResponseDto, LogrosPorColegioDto } from './dto/distribucion-logros.dto';
import { CursosProblemaResponseDto } from './dto/cursos-problema.dto';
import { RendimientoPorGradoResponseDto } from './dto/rendimiento-grado.dto';
import { CursosProblemaColegioResponseDto } from './dto/cursos-problema-colegio.dto';

@ApiTags('Estadísticas')
@ApiBearerAuth()
@Controller('api/estadisticas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EstadisticasController {
  private readonly logger = new Logger(EstadisticasController.name);

  constructor(private readonly estadisticasService: EstadisticasService) {}

  /**
   * OWNER ONLY: Obtiene distribución de logros por todos los colegios
   * Para gráfico de pastel multi-serie en dashboard Owner
   */
  @Get('distribucion-logros-global')
  @Roles('OWNER')
  @ApiOperation({ 
    summary: 'Distribución global de logros por colegio',
    description: 'Obtiene la distribución de notas (AD, A, B, C) agrupada por cada colegio del sistema. Solo accesible para OWNER.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Distribución obtenida exitosamente',
    type: DistribucionLogrosResponseDto
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo OWNER' })
  async obtenerDistribucionLogrosGlobal(
    @Request() req: any
  ): Promise<DistribucionLogrosResponseDto> {
    this.logger.log(`Owner ${req.user.id} solicitando distribución global de logros`);
    
    return await this.estadisticasService.obtenerDistribucionLogrosPorColegio();
  }

  /**
   * OWNER ONLY: Obtiene top cursos con más problemas a nivel global
   * Para gráfico de barras horizontales en dashboard Owner
   */
  @Get('cursos-problema-global')
  @Roles('OWNER')
  @ApiOperation({ 
    summary: 'Top cursos problema a nivel global',
    description: 'Obtiene los cursos con mayor porcentaje de alumnos con notas B y C en todo el sistema. Solo accesible para OWNER.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cursos problema obtenidos exitosamente',
    type: CursosProblemaResponseDto
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo OWNER' })
  async obtenerCursosProblemaGlobal(
    @Request() req: any
  ): Promise<CursosProblemaResponseDto> {
    this.logger.log(`Owner ${req.user.id} solicitando cursos problema globales`);
    
    return await this.estadisticasService.obtenerCursosProblemaGlobal();
  }

  /**
   * DIRECTOR ONLY: Obtiene distribución de logros de su colegio
   * Para gráfico de pastel simple en dashboard Director
   */
  @Get('distribucion-logros-colegio')
  @Roles('DIRECTOR')
  @ApiOperation({ 
    summary: 'Distribución de logros del colegio del director',
    description: 'Obtiene la distribución de notas (AD, A, B, C) del colegio específico del director autenticado.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Distribución del colegio obtenida exitosamente',
    type: LogrosPorColegioDto
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo DIRECTOR' })
  async obtenerDistribucionLogrosColegio(
    @Request() req: any
  ): Promise<LogrosPorColegioDto> {
    this.logger.log(`Director ${req.user.id} solicitando distribución de su colegio ${req.user.colegioId}`);
    
    if (!req.user.colegioId) {
      this.logger.error(`Director ${req.user.id} no tiene colegio asignado`);
      throw new Error('Director no tiene colegio asignado');
    }

    return await this.estadisticasService.obtenerDistribucionLogrosPorColegio_Director(req.user.colegioId);
  }

  /**
   * DIRECTOR ONLY: Obtiene rendimiento por grado de su colegio
   * Para gráfico de barras verticales en dashboard Director
   */
  @Get('rendimiento-por-grado')
  @Roles('DIRECTOR')
  @ApiOperation({ 
    summary: 'Rendimiento por grado del colegio del director',
    description: 'Obtiene el rendimiento académico comparativo entre los diferentes grados del colegio del director.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Rendimiento por grado obtenido exitosamente',
    type: RendimientoPorGradoResponseDto
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo DIRECTOR' })
  async obtenerRendimientoPorGrado(
    @Request() req: any
  ): Promise<RendimientoPorGradoResponseDto> {
    this.logger.log(`Director ${req.user.id} solicitando rendimiento por grado de su colegio ${req.user.colegioId}`);
    
    if (!req.user.colegioId) {
      this.logger.error(`Director ${req.user.id} no tiene colegio asignado`);
      throw new Error('Director no tiene colegio asignado');
    }

    return await this.estadisticasService.obtenerRendimientoPorGrado(req.user.colegioId);
  }

  /**
   * DIRECTOR ONLY: Obtiene top cursos problema de su colegio
   * Para gráfico de barras horizontales en dashboard Director
   */
  @Get('cursos-problema-colegio')
  @Roles('DIRECTOR')
  @ApiOperation({ 
    summary: 'Top cursos problema del colegio del director',
    description: 'Obtiene los 5 cursos con mayor porcentaje de alumnos con notas B y C del colegio específico del director.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cursos problema del colegio obtenidos exitosamente',
    type: CursosProblemaColegioResponseDto
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo DIRECTOR' })
  async obtenerCursosProblemaColegioDirector(
    @Request() req: any
  ): Promise<CursosProblemaColegioResponseDto> {
    this.logger.log(`Director ${req.user.id} solicitando cursos problema de su colegio ${req.user.colegioId}`);
    
    if (!req.user.colegioId) {
      this.logger.error(`Director ${req.user.id} no tiene colegio asignado`);
      throw new Error('Director no tiene colegio asignado');
    }

    return await this.estadisticasService.obtenerCursosProblemaColegioDirector(req.user.colegioId);
  }

  /**
   * HEALTH CHECK: Verifica que el módulo de estadísticas esté funcionando
   */
  @Get('health')
  @Roles('OWNER', 'DIRECTOR')
  @ApiOperation({ 
    summary: 'Health check del módulo de estadísticas',
    description: 'Verifica que el servicio de estadísticas esté funcionando correctamente.'
  })
  @ApiResponse({ status: 200, description: 'Servicio funcionando correctamente' })
  async healthCheck(): Promise<{ status: string; timestamp: string; module: string }> {
    this.logger.log('Health check solicitado para módulo de estadísticas');
    
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      module: 'EstadisticasModule'
    };
  }
}
