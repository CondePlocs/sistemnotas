import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelGeneratorService {
  private readonly logger = new Logger(ExcelGeneratorService.name);

  /**
   * Obtiene el valor de escala de cálculo, con fallback para datos legacy
   * Prioriza notaEscalaCalculo, pero calcula desde nota si es necesario
   */
  private obtenerEscalaCalculo(nota: string, notaEscalaCalculo: number | null): number {
    // Si ya tenemos el valor calculado, lo usamos
    if (notaEscalaCalculo !== null && notaEscalaCalculo > 0) {
      return notaEscalaCalculo;
    }

    // Fallback para datos legacy o casos donde no se calculó
    if (nota === 'AD') return 4.0;
    if (nota === 'A') return 3.0;
    if (nota === 'B') return 2.0;
    if (nota === 'C') return 1.0;

    // Para notas numéricas, convertir a escala 1.0-4.0
    const notaNum = parseFloat(nota);
    if (!isNaN(notaNum)) {
      if (notaNum >= 0 && notaNum <= 20) {
        // Conversión de escala 0-20 a 1.0-4.0
        return Math.max(1.0, Math.min(4.0, 1.0 + (notaNum / 20) * 3.0));
      }
    }

    // Valor por defecto para casos no reconocidos
    return 1.0;
  }

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
        // CORREGIDO: Usar función auxiliar que maneja notas mixtas (alfabéticas + numéricas)
        const notasAlumno = datos.notas?.filter((n: any) => n.alumnoId === alumno.id) || [];
        const promedio = notasAlumno.length > 0 
          ? notasAlumno.reduce((sum: number, nota: any) => {
              const valor = this.obtenerEscalaCalculo(nota.nota, nota.notaEscalaCalculo);
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

  /**
   * Genera Excel de mini libreta del alumno
   */
  async generateMiniLibretaExcel(datos: any): Promise<Buffer> {
    const workbook = this.createWorkbook();
    const worksheet = this.addWorksheet(workbook, 'Mini Libreta');
    
    // Header del colegio y información del alumno
    let currentRow = this.addColegioHeader(
      worksheet,
      datos.alumno?.colegioNombre || 'COLEGIO',
      `Mini Libreta - ${datos.alumno?.nombres || ''} ${datos.alumno?.apellidos || ''}`
    );

    // Información del alumno
    currentRow += 2;
    worksheet.getCell(`A${currentRow}`).value = 'INFORMACIÓN DEL ALUMNO';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    currentRow++;

    const infoData = [
      ['Nombres:', `${datos.alumno?.nombres || ''} ${datos.alumno?.apellidos || ''}`],
      ['DNI:', datos.alumno?.dni || 'No registrado'],
      ['Código:', datos.alumno?.codigoAlumno || 'No asignado'],
      ['Salón:', datos.alumno?.salon ? `${datos.alumno.salon.grado}° ${datos.alumno.salon.seccion} - ${datos.alumno.salon.turno}` : 'No asignado'],
      ['Nivel:', datos.alumno?.salon?.nivelNombre || 'No definido'],
      ['Período Académico:', datos.periodoAcademico?.nombre || ''],
      ['Total de Cursos:', datos.estadisticas?.totalCursos || 0],
      ['Total de Evaluaciones:', datos.estadisticas?.totalEvaluaciones || 0],
      ['Promedio General:', datos.estadisticas?.promedioGeneral || 0],
    ];

    infoData.forEach(([label, value]) => {
      worksheet.getCell(`A${currentRow}`).value = label;
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      worksheet.getCell(`B${currentRow}`).value = value;
      currentRow++;
    });

    // Sección de Profesores
    currentRow += 2;
    worksheet.getCell(`A${currentRow}`).value = 'PROFESORES ASIGNADOS';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    currentRow++;

    if (datos.profesores && datos.profesores.length > 0) {
      const profHeaders = ['Profesor', 'Curso'];
      worksheet.addRow(profHeaders);
      this.applyHeaderStyle(worksheet, currentRow, profHeaders.length);
      currentRow++;

      datos.profesores.forEach((prof: any) => {
        worksheet.addRow([
          `${prof.nombres} ${prof.apellidos}`,
          prof.cursoNombre
        ]);
        currentRow++;
      });
    }

    // Sección de Cursos y Competencias
    currentRow += 2;
    worksheet.getCell(`A${currentRow}`).value = 'CURSOS Y COMPETENCIAS';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    currentRow++;

    if (datos.cursos && datos.cursos.length > 0) {
      datos.cursos.forEach((curso: any) => {
        // Título del curso
        currentRow++;
        worksheet.getCell(`A${currentRow}`).value = `CURSO: ${curso.nombre}`;
        worksheet.getCell(`A${currentRow}`).font = { bold: true, color: { argb: 'FF2563eb' } };
        currentRow++;

        if (curso.competencias && curso.competencias.length > 0) {
          const compHeaders = ['Orden', 'Competencia'];
          worksheet.addRow(compHeaders);
          this.applyHeaderStyle(worksheet, currentRow, compHeaders.length);
          currentRow++;

          curso.competencias.forEach((comp: any) => {
            worksheet.addRow([comp.orden, comp.nombre]);
            currentRow++;
          });
        }
      });
    }

    // Sección de Evaluaciones y Notas - SEPARADO POR CURSO
    currentRow += 2;
    worksheet.getCell(`A${currentRow}`).value = 'EVALUACIONES Y NOTAS';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    currentRow++;

    if (datos.notas && datos.notas.length > 0) {
      // Agrupar notas por curso
      const notasPorCurso = new Map();
      datos.notas.forEach((nota: any) => {
        if (!notasPorCurso.has(nota.cursoNombre)) {
          notasPorCurso.set(nota.cursoNombre, []);
        }
        notasPorCurso.get(nota.cursoNombre).push(nota);
      });

      // Mostrar cada curso por separado
      Array.from(notasPorCurso.entries()).forEach(([cursoNombre, notasCurso], index) => {
        // Espacio entre cursos (excepto el primero)
        if (index > 0) {
          currentRow += 2;
        } else {
          currentRow++;
        }

        // Título del curso
        worksheet.getCell(`A${currentRow}`).value = `📚 CURSO: ${cursoNombre}`;
        worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 11, color: { argb: 'FF2563eb' } };
        currentRow++;

        // Headers de la tabla del curso
        const notasHeaders = ['Competencia', 'Evaluación', 'Nota', 'Fecha'];
        worksheet.addRow(notasHeaders);
        this.applyHeaderStyle(worksheet, currentRow, notasHeaders.length);
        currentRow++;

        // Notas del curso
        (notasCurso as any[]).forEach((nota: any) => {
          worksheet.addRow([
            nota.competenciaNombre,
            nota.evaluacionNombre,
            nota.nota,
            nota.fechaRegistro ? new Date(nota.fechaRegistro).toLocaleDateString('es-PE') : ''
          ]);
          currentRow++;
        });
      });
    }

    this.autoFitColumns(worksheet);
    return this.toBuffer(workbook);
  }
}
