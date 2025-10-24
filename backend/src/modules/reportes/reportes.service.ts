import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { PdfGeneratorService } from './generators/pdf-generator.service';
import { ExcelGeneratorService } from './generators/excel-generator.service';
import { TipoReporte, FormatoReporte, ReporteRequestDto } from './dto/reporte-request.dto';

@Injectable()
export class ReportesService {
  private readonly logger = new Logger(ReportesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfGenerator: PdfGeneratorService,
    private readonly excelGenerator: ExcelGeneratorService,
  ) {
    // Registrar helpers de Handlebars al inicializar el servicio
    this.pdfGenerator.registerHandlebarsHelpers();
  }

  /**
   * Genera un reporte según el tipo y formato solicitado
   */
  async generarReporte(
    request: ReporteRequestDto,
    usuarioId: number,
    colegioId: number,
    rol: string,
  ): Promise<{
    buffer: Buffer;
    nombreArchivo: string;
    mimeType: string;
  }> {
    this.logger.log(`Generando reporte ${request.tipo} en formato ${request.formato} para usuario ${usuarioId}`);

    // Verificar permisos según el tipo de reporte
    this.verificarPermisos(request.tipo, rol);

    // Generar el reporte según el tipo
    switch (request.tipo) {
      case TipoReporte.ALUMNOS_RIESGO_DIRECTOR:
        return this.generarReporteAlumnosRiesgoDirector(request.formato, colegioId);
      
      case TipoReporte.HOJA_REGISTRO_PROFESOR:
        if (!request.salonId) throw new Error('salonId es requerido para este reporte');
        return this.generarReporteHojaRegistroProfesor(request.formato, request.salonId, usuarioId, colegioId);
      
      case TipoReporte.INTERVENCION_TEMPRANA_PROFESOR:
        if (!request.salonId) throw new Error('salonId es requerido para este reporte');
        return this.generarReporteIntervencionTemprana(request.formato, request.salonId, usuarioId, colegioId);
      
      case TipoReporte.MINI_LIBRETA_PADRE:
        if (!request.alumnoId) throw new Error('alumnoId es requerido para este reporte');
        return this.generarReporteMiniLibreta(request.formato, request.alumnoId, usuarioId, colegioId);
      
      case TipoReporte.TOP_CURSOS_PADRE:
        if (!request.alumnoId) throw new Error('alumnoId es requerido para este reporte');
        return this.generarReporteTopCursos(request.formato, request.alumnoId, usuarioId, colegioId);
      
      default:
        throw new Error(`Tipo de reporte no soportado: ${request.tipo}`);
    }
  }

  /**
   * Verifica que el usuario tenga permisos para el tipo de reporte solicitado
   */
  private verificarPermisos(tipoReporte: TipoReporte, rol: string): void {
    const permisosRequeridos = {
      [TipoReporte.ALUMNOS_RIESGO_DIRECTOR]: ['DIRECTOR'],
      [TipoReporte.HOJA_REGISTRO_PROFESOR]: ['PROFESOR'],
      [TipoReporte.INTERVENCION_TEMPRANA_PROFESOR]: ['PROFESOR'],
      [TipoReporte.MINI_LIBRETA_PADRE]: ['APODERADO'],
      [TipoReporte.TOP_CURSOS_PADRE]: ['APODERADO'],
    };

    const rolesPermitidos = permisosRequeridos[tipoReporte];
    if (!rolesPermitidos.includes(rol)) {
      throw new ForbiddenException(`El rol ${rol} no tiene permisos para generar el reporte ${tipoReporte}`);
    }
  }

  /**
   * Genera reporte de alumnos en riesgo para directores
   */
  private async generarReporteAlumnosRiesgoDirector(
    formato: FormatoReporte,
    colegioId: number,
  ): Promise<{ buffer: Buffer; nombreArchivo: string; mimeType: string }> {
    this.logger.log(`Generando reporte Excel de alumnos en riesgo para colegio ${colegioId}`);

    try {
      // Obtener datos reales de alumnos en riesgo del período activo
      const datosReporte = await this.obtenerDatosAlumnosEnRiesgo(colegioId);

      // Solo generar Excel para directores
      return this.generarExcelAlumnosRiesgo(datosReporte);
    } catch (error) {
      this.logger.error(`Error al generar reporte de alumnos en riesgo para colegio ${colegioId}`, error);
      throw new Error('No se pudo generar el reporte de alumnos en riesgo');
    }
  }

  /**
   * Obtiene datos reales de alumnos en riesgo del período académico activo
   */
  private async obtenerDatosAlumnosEnRiesgo(colegioId: number) {
    this.logger.log(`Obteniendo datos de alumnos en riesgo para colegio ${colegioId}`);

    // Obtener información del colegio
    const colegio = await this.prisma.colegio.findUnique({
      where: { id: colegioId },
      select: { nombre: true }
    });

    if (!colegio) {
      throw new Error('Colegio no encontrado');
    }

    // Obtener período académico activo
    const periodoActivo = await this.prisma.periodoAcademico.findFirst({
      where: {
        colegioId: colegioId,
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        anioAcademico: true
      }
    });

    if (!periodoActivo) {
      this.logger.warn(`No hay período académico activo para colegio ${colegioId}`);
      return {
        colegio,
        periodoAcademico: null,
        alumnosRiesgo: [],
        fechaGeneracion: new Date(),
        totalAlumnos: 0,
        alumnosEnRiesgo: 0,
        porcentajeRiesgo: 0,
      };
    }

    // Query para obtener alumnos en riesgo (promedio < 3 en cualquier curso)
    const alumnosEnRiesgo = await this.prisma.$queryRaw`
      WITH promedios_alumnos AS (
        SELECT 
          a.id as alumno_id,
          a.nombres,
          a.apellidos,
          a.dni,
          s.grado,
          s.seccion,
          n.nombre as nivel,
          c.nombre as curso,
          AVG(
            CASE 
              WHEN rn.nota = 'AD' THEN 4
              WHEN rn.nota = 'A' THEN 3
              WHEN rn.nota = 'B' THEN 2
              WHEN rn.nota = 'C' THEN 1
              ELSE 0
            END
          ) as promedio_numerico
        FROM registro_nota rn
        INNER JOIN evaluacion e ON rn."evaluacionId" = e.id
        INNER JOIN competencia comp ON e."competenciaId" = comp.id
        INNER JOIN curso c ON comp."cursoId" = c.id
        INNER JOIN profesor_asignacion pa ON e."profesorAsignacionId" = pa.id
        INNER JOIN alumno a ON rn."alumnoId" = a.id
        INNER JOIN alumno_salon als ON a.id = als."alumnoId"
        INNER JOIN salon s ON als."salonId" = s.id
        INNER JOIN colegio_nivel cn ON s."colegioNivelId" = cn.id
        INNER JOIN nivel n ON cn."nivelId" = n.id
        WHERE a."colegioId" = ${colegioId} 
          AND e."periodoId" = ${periodoActivo.id}
          AND rn.nota IN ('AD', 'A', 'B', 'C')
          AND a.activo = true
        GROUP BY a.id, a.nombres, a.apellidos, a.dni, s.grado, s.seccion, n.nombre, c.id, c.nombre
        HAVING AVG(
          CASE 
            WHEN rn.nota = 'AD' THEN 4
            WHEN rn.nota = 'A' THEN 3
            WHEN rn.nota = 'B' THEN 2
            WHEN rn.nota = 'C' THEN 1
            ELSE 0
          END
        ) < 3
      )
      SELECT 
        alumno_id,
        nombres,
        apellidos,
        dni,
        grado,
        seccion,
        nivel,
        curso,
        promedio_numerico,
        CASE 
          WHEN promedio_numerico < 2 THEN 'RIESGO ALTO'
          WHEN promedio_numerico < 2.5 THEN 'RIESGO MEDIO'
          ELSE 'REQUIERE ATENCIÓN'
        END as estado_riesgo
      FROM promedios_alumnos
      ORDER BY promedio_numerico ASC, apellidos, nombres
    ` as Array<{
      alumno_id: number;
      nombres: string;
      apellidos: string;
      dni: string;
      grado: string;
      seccion: string;
      nivel: string;
      curso: string;
      promedio_numerico: number;
      estado_riesgo: string;
    }>;

    // Obtener total de alumnos activos del colegio
    const totalAlumnos = await this.prisma.alumno.count({
      where: {
        colegioId: colegioId,
        activo: true
      }
    });

    const alumnosEnRiesgoCount = alumnosEnRiesgo.length;
    const porcentajeRiesgo = totalAlumnos > 0 ? Number(((alumnosEnRiesgoCount / totalAlumnos) * 100).toFixed(2)) : 0;

    this.logger.log(`Encontrados ${alumnosEnRiesgoCount} alumnos en riesgo de ${totalAlumnos} total (${porcentajeRiesgo}%)`);

    return {
      colegio,
      periodoAcademico: periodoActivo,
      alumnosRiesgo: alumnosEnRiesgo.map(alumno => ({
        nombres: alumno.nombres,
        apellidos: alumno.apellidos,
        dni: alumno.dni,
        grado: alumno.grado,
        seccion: alumno.seccion,
        nivel: alumno.nivel,
        curso: alumno.curso,
        promedio: Number(alumno.promedio_numerico.toFixed(2)),
        estado: alumno.estado_riesgo,
      })),
      fechaGeneracion: new Date(),
      totalAlumnos,
      alumnosEnRiesgo: alumnosEnRiesgoCount,
      porcentajeRiesgo,
    };
  }

  /**
   * Genera Excel de alumnos en riesgo
   */
  private async generarExcelAlumnosRiesgo(datos: any): Promise<{ buffer: Buffer; nombreArchivo: string; mimeType: string }> {
    const workbook = this.excelGenerator.createWorkbook();
    const worksheet = this.excelGenerator.addWorksheet(workbook, 'Alumnos en Riesgo');

    // Header del colegio
    const nextRow = this.excelGenerator.addColegioHeader(
      worksheet,
      datos.colegio.nombre,
      'Detalle de Alumnos en Riesgo Académico',
      datos.fechaGeneracion,
    );

    // Información del período académico
    let currentRow = nextRow;
    if (datos.periodoAcademico) {
      worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
      const periodoCell = worksheet.getCell(`A${currentRow}`);
      periodoCell.value = `PERÍODO ACADÉMICO: ${datos.periodoAcademico.nombre} - ${datos.periodoAcademico.anioAcademico}`;
      periodoCell.style = {
        font: { bold: true, size: 12, color: { argb: '366092' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'E8F4FD' }
        }
      };
      worksheet.getRow(currentRow).height = 25;
      currentRow++;
      worksheet.addRow([]); // Línea en blanco
      currentRow++;
    }

    // Estadísticas generales
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const statsHeaderCell = worksheet.getCell(`A${currentRow}`);
    statsHeaderCell.value = 'ESTADÍSTICAS GENERALES';
    statsHeaderCell.style = {
      font: { bold: true, size: 11 },
      alignment: { horizontal: 'center' },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F0F0F0' }
      }
    };
    currentRow++;

    // Estadísticas en formato tabla
    const statsData = [
      ['Total de Alumnos:', datos.totalAlumnos],
      ['Alumnos en Riesgo:', datos.alumnosEnRiesgo],
      ['Porcentaje de Riesgo:', `${datos.porcentajeRiesgo}%`],
    ];

    statsData.forEach(([label, value]) => {
      worksheet.addRow([label, value]);
      const row = worksheet.getRow(currentRow);
      row.getCell(1).style = { font: { bold: true } };
      row.getCell(2).style = { 
        font: { bold: true, color: { argb: datos.porcentajeRiesgo > 10 ? 'FF0000' : '008000' } }
      };
      currentRow++;
    });

    worksheet.addRow([]); // Línea en blanco
    currentRow++;

    // Verificar si hay alumnos en riesgo
    if (datos.alumnosEnRiesgo === 0) {
      worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
      const noDataCell = worksheet.getCell(`A${currentRow}`);
      noDataCell.value = '¡EXCELENTE! No hay alumnos en riesgo académico en este período.';
      noDataCell.style = {
        font: { bold: true, size: 14, color: { argb: '008000' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'E8F5E8' }
        }
      };
      worksheet.getRow(currentRow).height = 30;
    } else {
      // Encabezados de la tabla
      const headers = ['DNI', 'Apellidos y Nombres', 'Nivel', 'Grado', 'Sección', 'Curso Problema', 'Promedio', 'Estado de Riesgo'];
      worksheet.addRow(headers);
      this.excelGenerator.applyHeaderStyle(worksheet, currentRow, headers.length);
      currentRow++;

      // Datos de alumnos
      datos.alumnosRiesgo.forEach((alumno: any) => {
        worksheet.addRow([
          alumno.dni,
          `${alumno.apellidos}, ${alumno.nombres}`,
          alumno.nivel,
          alumno.grado,
          alumno.seccion,
          alumno.curso,
          alumno.promedio,
          alumno.estado,
        ]);

        // Colorear filas según el nivel de riesgo
        const row = worksheet.getRow(currentRow);
        const riesgoColor = alumno.estado === 'RIESGO ALTO' ? 'FFEBEE' : 
                           alumno.estado === 'RIESGO MEDIO' ? 'FFF3E0' : 'F3E5F5';
        
        for (let col = 1; col <= headers.length; col++) {
          row.getCell(col).style = {
            ...row.getCell(col).style,
            fill: {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: riesgoColor }
            }
          };
        }
        currentRow++;
      });

      this.excelGenerator.applyDataStyle(
        worksheet,
        currentRow - datos.alumnosEnRiesgo.length,
        currentRow - 1,
        headers.length,
      );
    }

    // Agregar recomendaciones
    worksheet.addRow([]);
    currentRow++;
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const recomendacionesCell = worksheet.getCell(`A${currentRow}`);
    recomendacionesCell.value = 'RECOMENDACIONES';
    recomendacionesCell.style = {
      font: { bold: true, size: 11 },
      alignment: { horizontal: 'center' },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E3F2FD' }
      }
    };
    currentRow++;

    const recomendaciones = [
      '• Implementar programas de refuerzo académico para estudiantes en riesgo',
      '• Revisar metodologías de enseñanza en cursos problemáticos',
      '• Brindar apoyo psicopedagógico adicional',
      '• Comunicar situación a los apoderados para trabajo conjunto',
      '• Establecer metas de mejora específicas por estudiante'
    ];

    recomendaciones.forEach(recomendacion => {
      worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
      const cell = worksheet.getCell(`A${currentRow}`);
      cell.value = recomendacion;
      cell.style = {
        alignment: { horizontal: 'left', vertical: 'middle' },
        font: { size: 10 }
      };
      currentRow++;
    });

    this.excelGenerator.autoFitColumns(worksheet);

    const buffer = await this.excelGenerator.toBuffer(workbook);
    const fecha = new Date().toISOString().split('T')[0];
    const periodo = datos.periodoAcademico ? `_${datos.periodoAcademico.nombre.replace(/\s+/g, '-')}` : '';

    return {
      buffer,
      nombreArchivo: `alumnos-riesgo${periodo}_${fecha}.xlsx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }


  // Métodos placeholder para otros tipos de reportes
  private async generarReporteHojaRegistroProfesor(
    formato: FormatoReporte, 
    salonId: string, 
    usuarioId: number, 
    colegioId: number
  ): Promise<{ buffer: Buffer; nombreArchivo: string; mimeType: string }> {
    throw new Error('Reporte de hoja de registro no implementado aún');
  }

  private async generarReporteIntervencionTemprana(
    formato: FormatoReporte, 
    salonId: string, 
    usuarioId: number, 
    colegioId: number
  ): Promise<{ buffer: Buffer; nombreArchivo: string; mimeType: string }> {
    throw new Error('Reporte de intervención temprana no implementado aún');
  }

  private async generarReporteMiniLibreta(
    formato: FormatoReporte, 
    alumnoId: string, 
    usuarioId: number, 
    colegioId: number
  ): Promise<{ buffer: Buffer; nombreArchivo: string; mimeType: string }> {
    throw new Error('Reporte de mini libreta no implementado aún');
  }

  private async generarReporteTopCursos(
    formato: FormatoReporte, 
    alumnoId: string, 
    usuarioId: number, 
    colegioId: number
  ): Promise<{ buffer: Buffer; nombreArchivo: string; mimeType: string }> {
    throw new Error('Reporte de top cursos no implementado aún');
  }

  /**
   * Métodos de prueba para verificar que los generadores funcionan
   */
  async generarPdfPrueba(): Promise<Buffer> {
    return this.pdfGenerator.generateTestPdf();
  }

  async generarExcelPrueba(): Promise<Buffer> {
    return this.excelGenerator.generateTestExcel();
  }
}
