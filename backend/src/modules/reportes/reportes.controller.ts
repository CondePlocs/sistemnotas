import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Response,
  Logger,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Response as ExpressResponse } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReportesService } from './reportes.service';
import { ReporteRequestDto, TipoReporte, FormatoReporte } from './dto/reporte-request.dto';

@ApiTags('Reportes')
@ApiBearerAuth()
@Controller('api/reportes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportesController {
  private readonly logger = new Logger(ReportesController.name);

  constructor(private readonly reportesService: ReportesService) {}

  /**
   * DIRECTOR: Genera reporte de alumnos en riesgo
   */
  @Get('director/alumnos-riesgo')
  @Roles('DIRECTOR')
  @ApiOperation({
    summary: 'Reporte de alumnos en riesgo para directores',
    description: 'Genera un reporte Excel con la lista de alumnos en riesgo académico del colegio.',
  })
  @ApiResponse({ status: 200, description: 'Reporte generado exitosamente' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo DIRECTOR' })
  async reporteAlumnosRiesgoDirector(
    @Request() req: any,
    @Response() res: ExpressResponse,
  ) {
    this.logger.log(`Director ${req.user.id} solicitando reporte de alumnos en riesgo`);

    if (!req.user.colegioId) {
      this.logger.error(`Director ${req.user.id} no tiene colegio asignado`);
      throw new Error('Director no tiene colegio asignado');
    }

    const reporteRequest: ReporteRequestDto = {
      tipo: TipoReporte.ALUMNOS_RIESGO_DIRECTOR,
      formato: FormatoReporte.EXCEL,
    };

    // Extraer el rol principal del usuario (primer rol)
    const rolPrincipal = req.user.roles?.[0]?.rol || 'UNKNOWN';
    
    const resultado = await this.reportesService.generarReporte(
      reporteRequest,
      req.user.id,
      req.user.colegioId,
      rolPrincipal,
    );

    // Configurar headers de descarga segura
    res.setHeader('Content-Type', resultado.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${resultado.nombreArchivo}"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Log de auditoría
    this.logger.log(
      `Director ${req.user.id} descargó reporte de alumnos en riesgo - ${resultado.nombreArchivo}`,
    );

    res.send(resultado.buffer);
  }

  /**
   * ENDPOINTS DE PRUEBA - Para verificar que los generadores funcionan
   */
  @Get('test/pdf')
  @Roles('DIRECTOR', 'OWNER')
  @ApiOperation({
    summary: 'Genera PDF de prueba',
    description: 'Endpoint de prueba para verificar que Puppeteer funciona correctamente.',
  })
  async testPdf(@Request() req: any, @Response() res: ExpressResponse) {
    this.logger.log(`Usuario ${req.user.id} solicitando PDF de prueba`);

    const buffer = await this.reportesService.generarPdfPrueba();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="test-pdf.pdf"');
    res.setHeader('Cache-Control', 'no-store');

    this.logger.log(`PDF de prueba generado para usuario ${req.user.id}`);
    res.send(buffer);
  }

  @Get('test/excel')
  @Roles('DIRECTOR', 'OWNER')
  @ApiOperation({
    summary: 'Genera Excel de prueba',
    description: 'Endpoint de prueba para verificar que ExcelJS funciona correctamente.',
  })
  async testExcel(@Request() req: any, @Response() res: ExpressResponse) {
    this.logger.log(`Usuario ${req.user.id} solicitando Excel de prueba`);

    const buffer = await this.reportesService.generarExcelPrueba();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="test-excel.xlsx"');
    res.setHeader('Cache-Control', 'no-store');

    this.logger.log(`Excel de prueba generado para usuario ${req.user.id}`);
    res.send(buffer);
  }

  /**
   * HEALTH CHECK - Verifica que el módulo de reportes funciona
   */
  @Get('health')
  @Roles('OWNER', 'DIRECTOR')
  @ApiOperation({
    summary: 'Health check del módulo de reportes',
    description: 'Verifica que el servicio de reportes esté funcionando correctamente.',
  })
  async healthCheck(): Promise<{ status: string; timestamp: string; module: string; generators: any }> {
    this.logger.log('Health check solicitado para módulo de reportes');

    // Verificar que las dependencias están disponibles
    const generatorsStatus = {
      puppeteer: 'OK',
      exceljs: 'OK',
      handlebars: 'OK',
    };

    try {
      // Test básico de generadores
      await this.reportesService.generarPdfPrueba();
      await this.reportesService.generarExcelPrueba();
    } catch (error) {
      this.logger.error('Error en health check de generadores', error);
      generatorsStatus.puppeteer = 'ERROR';
      generatorsStatus.exceljs = 'ERROR';
    }

    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      module: 'ReportesModule',
      generators: generatorsStatus,
    };
  }

  /**
   * PROFESOR: Genera hoja de registro Excel
   */
  @Get('profesor/hoja-registro')
  @Roles('PROFESOR')
  @ApiOperation({
    summary: 'Hoja de registro Excel para profesores',
    description: 'Genera un reporte Excel con la hoja de trabajo completa del profesor para una asignación específica.',
  })
  @ApiResponse({ status: 200, description: 'Reporte generado exitosamente' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo PROFESOR' })
  async reporteHojaRegistroProfesor(
    @Request() req: any,
    @Response() res: ExpressResponse,
    @Query('profesorAsignacionId') profesorAsignacionId: string,
  ) {
    this.logger.log(`Profesor ${req.user.id} solicitando hoja de registro para asignación ${profesorAsignacionId}`);

    if (!profesorAsignacionId) {
      throw new Error('profesorAsignacionId es requerido');
    }

    const reporteRequest: ReporteRequestDto = {
      tipo: TipoReporte.HOJA_REGISTRO_PROFESOR,
      formato: FormatoReporte.EXCEL,
      profesorAsignacionId,
    };

    // Extraer el rol principal del usuario (primer rol)
    const rolPrincipal = req.user.roles?.[0]?.rol || 'UNKNOWN';
    
    const resultado = await this.reportesService.generarReporte(
      reporteRequest,
      req.user.id,
      req.user.colegioId,
      rolPrincipal,
    );

    // Configurar headers de descarga segura
    res.setHeader('Content-Type', resultado.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${resultado.nombreArchivo}"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Log de auditoría
    this.logger.log(
      `Profesor ${req.user.id} descargó hoja de registro - ${resultado.nombreArchivo}`,
    );

    res.send(resultado.buffer);
  }

  /**
   * PROFESOR: Genera informe de intervención temprana PDF
   */
  @Get('profesor/intervencion-temprana')
  @Roles('PROFESOR')
  @ApiOperation({
    summary: 'Informe de intervención temprana PDF para profesores',
    description: 'Genera un reporte PDF con alumnos en riesgo y gráficos de tendencia del salón.',
  })
  @ApiResponse({ status: 200, description: 'Reporte generado exitosamente' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo PROFESOR' })
  async reporteIntervencionTemprana(
    @Request() req: any,
    @Response() res: ExpressResponse,
    @Query('profesorAsignacionId') profesorAsignacionId: string,
  ) {
    this.logger.log(`Profesor ${req.user.id} solicitando informe de intervención temprana para asignación ${profesorAsignacionId}`);

    if (!profesorAsignacionId) {
      throw new Error('profesorAsignacionId es requerido');
    }

    const reporteRequest: ReporteRequestDto = {
      tipo: TipoReporte.INTERVENCION_TEMPRANA_PROFESOR,
      formato: FormatoReporte.PDF,
      profesorAsignacionId,
    };

    // Extraer el rol principal del usuario (primer rol)
    const rolPrincipal = req.user.roles?.[0]?.rol || 'UNKNOWN';
    
    const resultado = await this.reportesService.generarReporte(
      reporteRequest,
      req.user.id,
      req.user.colegioId,
      rolPrincipal,
    );

    // Configurar headers de descarga segura
    res.setHeader('Content-Type', resultado.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${resultado.nombreArchivo}"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Log de auditoría
    this.logger.log(
      `Profesor ${req.user.id} descargó informe de intervención temprana - ${resultado.nombreArchivo}`,
    );

    res.send(resultado.buffer);
  }

  /**
   * PADRE: Genera mini libreta Excel del alumno
   */
  @Get('padre/mini-libreta')
  @Roles('APODERADO')
  @ApiOperation({
    summary: 'Mini libreta Excel para padres de familia',
    description: 'Genera un reporte Excel con la libreta completa del alumno: cursos, competencias, evaluaciones y notas.',
  })
  @ApiResponse({ status: 200, description: 'Reporte generado exitosamente' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo PADRE' })
  async reporteMiniLibretaExcel(
    @Request() req: any,
    @Response() res: ExpressResponse,
    @Query('alumnoId') alumnoId: string,
  ) {
    this.logger.log(`Padre ${req.user.id} solicitando mini libreta Excel para alumno ${alumnoId}`);

    if (!alumnoId) {
      throw new Error('alumnoId es requerido');
    }

    const reporteRequest: ReporteRequestDto = {
      tipo: TipoReporte.MINI_LIBRETA_PADRE,
      formato: FormatoReporte.EXCEL,
      alumnoId,
    };

    // Extraer el rol principal del usuario (primer rol)
    const rolPrincipal = req.user.roles?.[0]?.rol || 'UNKNOWN';
    
    const resultado = await this.reportesService.generarReporte(
      reporteRequest,
      req.user.id,
      req.user.colegioId,
      rolPrincipal,
    );

    // Configurar headers de descarga segura
    res.setHeader('Content-Type', resultado.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${resultado.nombreArchivo}"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Log de auditoría
    this.logger.log(
      `Padre ${req.user.id} descargó mini libreta Excel - ${resultado.nombreArchivo}`,
    );

    res.send(resultado.buffer);
  }

  /**
   * PADRE: Genera mini libreta PDF del alumno con top cursos
   */
  @Get('padre/mini-libreta-completa')
  @Roles('APODERADO')
  @ApiOperation({
    summary: 'Mini libreta PDF completa para padres de familia',
    description: 'Genera un reporte PDF con la libreta del alumno + top 3 mejores y peores cursos.',
  })
  @ApiResponse({ status: 200, description: 'Reporte generado exitosamente' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo PADRE' })
  async reporteMiniLibretaCompletaPDF(
    @Request() req: any,
    @Response() res: ExpressResponse,
    @Query('alumnoId') alumnoId: string,
  ) {
    this.logger.log(`Padre ${req.user.id} solicitando mini libreta PDF completa para alumno ${alumnoId}`);

    if (!alumnoId) {
      throw new Error('alumnoId es requerido');
    }

    const reporteRequest: ReporteRequestDto = {
      tipo: TipoReporte.TOP_CURSOS_PADRE,
      formato: FormatoReporte.PDF,
      alumnoId,
    };

    // Extraer el rol principal del usuario (primer rol)
    const rolPrincipal = req.user.roles?.[0]?.rol || 'UNKNOWN';
    
    const resultado = await this.reportesService.generarReporte(
      reporteRequest,
      req.user.id,
      req.user.colegioId,
      rolPrincipal,
    );

    // Configurar headers de descarga segura
    res.setHeader('Content-Type', resultado.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${resultado.nombreArchivo}"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Log de auditoría
    this.logger.log(
      `Padre ${req.user.id} descargó mini libreta PDF completa - ${resultado.nombreArchivo}`,
    );

    res.send(resultado.buffer);
  }
}
