import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelGeneratorService {
  private readonly logger = new Logger(ExcelGeneratorService.name);

  /**
   * Crea un nuevo workbook de Excel
   */
  createWorkbook(): ExcelJS.Workbook {
    const workbook = new ExcelJS.Workbook();
    
    // Metadatos del archivo
    workbook.creator = 'Sistema de Notas';
    workbook.lastModifiedBy = 'Sistema de Notas';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    return workbook;
  }

  /**
   * Agrega una hoja de trabajo con estilos básicos
   */
  addWorksheet(workbook: ExcelJS.Workbook, name: string): ExcelJS.Worksheet {
    const worksheet = workbook.addWorksheet(name);
    
    // Configuración básica de la hoja
    worksheet.pageSetup = {
      paperSize: 9, // A4
      orientation: 'portrait',
      margins: {
        left: 0.7,
        right: 0.7,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3,
      },
    };
    
    return worksheet;
  }

  /**
   * Aplica estilos de encabezado a una fila
   */
  applyHeaderStyle(worksheet: ExcelJS.Worksheet, rowNumber: number, columnCount: number): void {
    const headerRow = worksheet.getRow(rowNumber);
    
    for (let col = 1; col <= columnCount; col++) {
      const cell = headerRow.getCell(col);
      cell.style = {
        font: {
          bold: true,
          color: { argb: 'FFFFFF' },
          size: 12,
        },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '366092' }, // Azul corporativo
        },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        },
        alignment: {
          horizontal: 'center',
          vertical: 'middle',
        },
      };
    }
    
    headerRow.height = 25;
  }

  /**
   * Aplica estilos de datos a un rango de celdas
   */
  applyDataStyle(worksheet: ExcelJS.Worksheet, startRow: number, endRow: number, columnCount: number): void {
    for (let row = startRow; row <= endRow; row++) {
      const dataRow = worksheet.getRow(row);
      
      for (let col = 1; col <= columnCount; col++) {
        const cell = dataRow.getCell(col);
        cell.style = {
          font: {
            size: 11,
          },
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          },
          alignment: {
            horizontal: 'left',
            vertical: 'middle',
          },
        };
      }
      
      dataRow.height = 20;
    }
  }

  /**
   * Ajusta automáticamente el ancho de las columnas
   */
  autoFitColumns(worksheet: ExcelJS.Worksheet): void {
    worksheet.columns.forEach((column) => {
      if (column.eachCell) {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(Math.max(maxLength + 2, 10), 50);
      }
    });
  }

  /**
   * Agrega información del colegio en la parte superior
   */
  addColegioHeader(
    worksheet: ExcelJS.Worksheet, 
    colegioNombre: string, 
    reporteTitulo: string,
    fechaGeneracion: Date = new Date()
  ): number {
    // Título del colegio
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = colegioNombre.toUpperCase();
    titleCell.style = {
      font: { bold: true, size: 16, color: { argb: '366092' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
    };
    worksheet.getRow(1).height = 30;

    // Título del reporte
    worksheet.mergeCells('A2:F2');
    const reportCell = worksheet.getCell('A2');
    reportCell.value = reporteTitulo;
    reportCell.style = {
      font: { bold: true, size: 14 },
      alignment: { horizontal: 'center', vertical: 'middle' },
    };
    worksheet.getRow(2).height = 25;

    // Fecha de generación
    worksheet.mergeCells('A3:F3');
    const dateCell = worksheet.getCell('A3');
    dateCell.value = `Generado el: ${fechaGeneracion.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    dateCell.style = {
      font: { size: 10, italic: true },
      alignment: { horizontal: 'center', vertical: 'middle' },
    };
    worksheet.getRow(3).height = 20;

    // Línea en blanco
    worksheet.getRow(4).height = 10;

    return 5; // Retorna la siguiente fila disponible
  }

  /**
   * Convierte el workbook a buffer
   */
  async toBuffer(workbook: ExcelJS.Workbook): Promise<Buffer> {
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      this.logger.log('Excel generado exitosamente');
      return Buffer.from(buffer);
    } catch (error) {
      this.logger.error('Error al generar Excel', error);
      throw new Error('No se pudo generar el archivo Excel');
    }
  }

  /**
   * Método de prueba para verificar que ExcelJS funciona
   */
  async generateTestExcel(): Promise<Buffer> {
    this.logger.log('Generando Excel de prueba');
    
    const workbook = this.createWorkbook();
    const worksheet = this.addWorksheet(workbook, 'Prueba');
    
    // Header del colegio
    const nextRow = this.addColegioHeader(
      worksheet,
      'COLEGIO DE PRUEBA',
      'Reporte de Prueba - Backend Core'
    );
    
    // Encabezados de tabla
    const headers = ['ID', 'Nombre', 'Apellido', 'DNI', 'Estado'];
    worksheet.addRow(headers);
    this.applyHeaderStyle(worksheet, nextRow, headers.length);
    
    // Datos de prueba
    const testData = [
      [1, 'Juan', 'Pérez', '12345678', 'Activo'],
      [2, 'María', 'García', '87654321', 'Activo'],
      [3, 'Carlos', 'López', '11223344', 'Inactivo'],
    ];
    
    testData.forEach((row) => {
      worksheet.addRow(row);
    });
    
    this.applyDataStyle(worksheet, nextRow + 1, nextRow + testData.length, headers.length);
    this.autoFitColumns(worksheet);
    
    return this.toBuffer(workbook);
  }

  /**
   * Genera Excel de hoja de trabajo del profesor
   */
  async generateHojaTrabajoExcel(datos: any): Promise<Buffer> {
    const workbook = this.createWorkbook();
    const worksheet = this.addWorksheet(workbook, 'Hoja de Trabajo');
    
    // Header del colegio y información de la asignación
    let currentRow = this.addColegioHeader(
      worksheet,
      datos.asignacion?.colegioNombre || 'COLEGIO',
      `Hoja de Trabajo - ${datos.asignacion?.cursoNombre || 'Curso'}`
    );

    // Información del profesor y salón
    currentRow += 2;
    worksheet.getCell(`A${currentRow}`).value = 'INFORMACIÓN DE LA ASIGNACIÓN';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    currentRow++;

    const infoData = [
      ['Profesor:', `${datos.asignacion?.profesorNombres || ''} ${datos.asignacion?.profesorApellidos || ''}`],
      ['Curso:', datos.asignacion?.cursoNombre || ''],
      ['Grado y Sección:', `${datos.asignacion?.grado || ''}° ${datos.asignacion?.seccion || ''}`],
      ['Nivel:', datos.asignacion?.nivelNombre || ''],
      ['Turno:', datos.asignacion?.turno || ''],
      ['Período Académico:', datos.periodoAcademico?.nombre || ''],
      ['Total de Alumnos:', datos.estadisticas?.totalAlumnos || 0],
      ['Total de Evaluaciones:', datos.estadisticas?.totalEvaluaciones || 0],
      ['Promedio General:', datos.estadisticas?.promedioGeneral || 0],
    ];

    infoData.forEach(([label, value]) => {
      worksheet.getCell(`A${currentRow}`).value = label;
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      worksheet.getCell(`B${currentRow}`).value = value;
      currentRow++;
    });

    // Sección de Competencias
    currentRow += 2;
    worksheet.getCell(`A${currentRow}`).value = 'COMPETENCIAS DEL CURSO';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    currentRow++;

    if (datos.competencias && datos.competencias.length > 0) {
      const compHeaders = ['Orden', 'Competencia'];
      worksheet.addRow(compHeaders);
      this.applyHeaderStyle(worksheet, currentRow, compHeaders.length);
      currentRow++;

      datos.competencias.forEach((comp: any) => {
        worksheet.addRow([comp.orden, comp.nombre]);
        currentRow++;
      });
    }

    // Sección de Evaluaciones
    currentRow += 2;
    worksheet.getCell(`A${currentRow}`).value = 'EVALUACIONES REALIZADAS';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    currentRow++;

    if (datos.evaluaciones && datos.evaluaciones.length > 0) {
      const evalHeaders = ['Evaluación', 'Competencia', 'Fecha'];
      worksheet.addRow(evalHeaders);
      this.applyHeaderStyle(worksheet, currentRow, evalHeaders.length);
      currentRow++;

      datos.evaluaciones.forEach((evaluacion: any) => {
        const fecha = evaluacion.fechaEvaluacion ? new Date(evaluacion.fechaEvaluacion).toLocaleDateString() : 'Sin fecha';
        worksheet.addRow([evaluacion.nombre, evaluacion.competenciaNombre, fecha]);
        currentRow++;
      });
    }

    // Sección de Alumnos y Notas
    currentRow += 2;
    worksheet.getCell(`A${currentRow}`).value = 'REGISTRO DE NOTAS POR ALUMNO';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    currentRow++;

    if (datos.alumnos && datos.alumnos.length > 0) {
      // Crear headers dinámicos con evaluaciones
      const alumnoHeaders = ['Alumno', 'DNI'];
      const evaluacionesUnicas = [...new Set(datos.evaluaciones?.map((e: any) => e.nombre) || [])] as string[];
      alumnoHeaders.push(...evaluacionesUnicas);
      alumnoHeaders.push('Promedio');

      worksheet.addRow(alumnoHeaders);
      this.applyHeaderStyle(worksheet, currentRow, alumnoHeaders.length);
      currentRow++;

      // Agregar datos de cada alumno
      datos.alumnos.forEach((alumno: any) => {
        const row = [
          `${alumno.apellidos}, ${alumno.nombres}`,
          alumno.dni
        ];

        // Agregar notas por evaluación
        evaluacionesUnicas.forEach((evalNombre: string) => {
          const nota = datos.notas?.find((n: any) => 
            n.alumnoId === alumno.id && n.evaluacionNombre === evalNombre
          );
          row.push(nota ? nota.nota : '-');
        });

        // Calcular promedio del alumno
        const notasAlumno = datos.notas?.filter((n: any) => n.alumnoId === alumno.id) || [];
        const promedio = notasAlumno.length > 0 
          ? notasAlumno.reduce((sum: number, nota: any) => {
              const valor = nota.nota === 'AD' ? 4 : nota.nota === 'A' ? 3 : nota.nota === 'B' ? 2 : nota.nota === 'C' ? 1 : 0;
              return sum + valor;
            }, 0) / notasAlumno.length
          : 0;
        
        row.push(promedio > 0 ? promedio.toFixed(2) : '-');
        
        worksheet.addRow(row);
        currentRow++;
      });
    }

    this.autoFitColumns(worksheet);
    return this.toBuffer(workbook);
  }
}
