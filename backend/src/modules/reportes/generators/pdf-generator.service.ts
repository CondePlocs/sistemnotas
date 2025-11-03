import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  /**
   * Genera PDF desde contenido HTML
   */
  async generateFromHtml(htmlContent: string, options: puppeteer.PDFOptions = {}): Promise<Buffer> {
    let browser: puppeteer.Browser | null = null;
    
    try {
      this.logger.log('Iniciando generación de PDF');
      
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
        ],
      });
      
      const page = await browser.newPage();
      
      // Configurar el contenido HTML
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });
      
      // Opciones por defecto para PDF
      const defaultOptions: puppeteer.PDFOptions = {
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        printBackground: true,
        preferCSSPageSize: true,
        ...options,
      };
      
      const pdfBuffer = await page.pdf(defaultOptions);
      
      this.logger.log('PDF generado exitosamente');
      return Buffer.from(pdfBuffer);
      
    } catch (error) {
      this.logger.error('Error al generar PDF', error);
      throw new Error('No se pudo generar el archivo PDF');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Genera PDF desde template Handlebars
   */
  async generateFromTemplate(
    templateName: string,
    data: any,
    options: puppeteer.PDFOptions = {}
  ): Promise<Buffer> {
    try {
      const templatePath = join(process.cwd(), 'src', 'modules', 'reportes', 'templates', `${templateName}.hbs`);
      const templateContent = readFileSync(templatePath, 'utf8');
      
      const template = Handlebars.compile(templateContent);
      const htmlContent = template(data);
      
      return this.generateFromHtml(htmlContent, options);
    } catch (error) {
      this.logger.error(`Error al cargar template ${templateName}`, error);
      throw new Error(`No se pudo cargar el template ${templateName}`);
    }
  }

  /**
   * Registra helpers de Handlebars útiles para reportes
   */
  registerHandlebarsHelpers(): void {
    // Helper para formatear fechas
    Handlebars.registerHelper('formatDate', (date: Date | string) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    });

    // Helper para formatear fechas con hora
    Handlebars.registerHelper('formatDateTime', (date: Date | string) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    });

    // Helper para convertir nota numérica a letra
    Handlebars.registerHelper('notaALetra', (nota: number) => {
      if (nota >= 3.5) return 'AD';
      if (nota >= 2.5) return 'A';
      if (nota >= 1.5) return 'B';
      return 'C';
    });

    // Helper para calcular edad
    Handlebars.registerHelper('calcularEdad', (fechaNacimiento: Date | string) => {
      if (!fechaNacimiento) return '';
      const hoy = new Date();
      const nacimiento = new Date(fechaNacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      return edad;
    });

    // Helper para condicionales
    Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    // Helper para números con decimales
    Handlebars.registerHelper('toFixed', (number: number, decimals: number = 2) => {
      return number ? number.toFixed(decimals) : '0.00';
    });
  }

  /**
   * Método de prueba para verificar que Puppeteer funciona
   */
  async generateTestPdf(): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Test PDF</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .info { background: #f0f0f0; padding: 10px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>PDF de Prueba - Sistema de Reportes</h1>
          <div class="info">
            <p><strong>Generado:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Estado:</strong> Puppeteer funcionando correctamente</p>
            <p><strong>Módulo:</strong> ReportesModule</p>
          </div>
          <p>Este es un PDF de prueba generado por el sistema de reportes.</p>
        </body>
        </html>
      `;

      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  /**
   * Genera PDF de intervención temprana para profesores
   */
  async generateIntervencionTempranaPdf(datos: any): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      
      // Generar gráfico de tendencias (datos para Chart.js)
      const tendenciasData = datos.tendencias?.map((t: any) => ({
        evaluacion: t.evaluacion_nombre,
        promedio: parseFloat(t.promedio_salon) || 0
      })) || [];

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Informe de Intervención Temprana</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              font-size: 12px;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              color: #2563eb;
              font-size: 18px;
            }
            .header h2 {
              margin: 5px 0;
              color: #666;
              font-size: 14px;
              font-weight: normal;
            }
            .info-section {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            .info-item {
              display: flex;
            }
            .info-label {
              font-weight: bold;
              min-width: 120px;
            }
            .stats-section {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .stat-card {
              background: #fff;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
            }
            .stat-number {
              font-size: 24px;
              font-weight: bold;
              color: #dc2626;
            }
            .stat-label {
              color: #666;
              font-size: 11px;
              margin-top: 5px;
            }
            .section-title {
              background: #2563eb;
              color: white;
              padding: 8px 12px;
              margin: 20px 0 10px 0;
              border-radius: 4px;
              font-size: 14px;
              font-weight: bold;
            }
            .alumnos-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              background: white;
            }
            .alumnos-table th,
            .alumnos-table td {
              border: 1px solid #ddd;
              padding: 8px 10px;
              text-align: left;
              font-size: 10px;
            }
            .alumnos-table th {
              background-color: #f8f9fa;
              font-weight: bold;
              color: #374151;
            }
            .alumnos-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .nota-sugerida {
              padding: 4px 8px;
              border-radius: 12px;
              font-weight: bold;
              font-size: 9px;
              color: white;
            }
            .nota-ad { background: #10b981; }
            .nota-a { background: #3b82f6; }
            .nota-b { background: #f59e0b; }
            .nota-c { background: #dc2626; }
            .recomendaciones {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin-top: 20px;
            }
            .recomendaciones h3 {
              margin-top: 0;
              color: #92400e;
            }
            .recomendaciones ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .chart-container {
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              text-align: center;
            }
            .chart-title {
              font-weight: bold;
              margin-bottom: 15px;
              color: #374151;
            }
            .trend-item {
              display: inline-block;
              margin: 5px 10px;
              padding: 8px 12px;
              background: #e5e7eb;
              border-radius: 20px;
              font-size: 11px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              font-size: 10px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div class="header">
            <h1>${datos.asignacion?.colegioNombre || 'COLEGIO'}</h1>
            <h2>Informe de Intervención Temprana</h2>
            <p>Generado el ${new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>

          <!-- Información de la Asignación -->
          <div class="info-section">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Profesor:</span>
                <span>${datos.asignacion?.profesorNombres || ''} ${datos.asignacion?.profesorApellidos || ''}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Curso:</span>
                <span>${datos.asignacion?.cursoNombre || ''}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Grado y Sección:</span>
                <span>${datos.asignacion?.grado || ''}° ${datos.asignacion?.seccion || ''}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Nivel:</span>
                <span>${datos.asignacion?.nivelNombre || ''}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Turno:</span>
                <span>${datos.asignacion?.turno || ''}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Período:</span>
                <span>${datos.periodoAcademico?.nombre || ''}</span>
              </div>
            </div>
          </div>

          <!-- Estadísticas -->
          <div class="stats-section">
            <div class="stat-card">
              <div class="stat-number">${datos.estadisticas?.totalAlumnos || 0}</div>
              <div class="stat-label">Total de Alumnos</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${datos.estadisticas?.alumnosEnRiesgo || 0}</div>
              <div class="stat-label">Alumnos en Riesgo</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${datos.estadisticas?.porcentajeRiesgo || 0}%</div>
              <div class="stat-label">Porcentaje de Riesgo</div>
            </div>
          </div>

          <!-- Gráfico de Tendencias -->
          ${tendenciasData.length > 0 ? `
          <div class="chart-container">
            <div class="chart-title">Tendencia del Rendimiento del Salón</div>
            <p style="margin-bottom: 15px; color: #666;">Promedio de las últimas evaluaciones:</p>
            ${tendenciasData.map((item: any) => `
              <div class="trend-item">
                ${item.evaluacion}: ${item.promedio.toFixed(2)}
              </div>
            `).join('')}
          </div>
          ` : ''}

          <!-- Lista de Alumnos en Riesgo -->
          <div class="section-title">Alumnos que Requieren Intervención Temprana</div>
          
          ${datos.alumnosRiesgo && datos.alumnosRiesgo.length > 0 ? `
          <table class="alumnos-table">
            <thead>
              <tr>
                <th>Alumno</th>
                <th>DNI</th>
                <th>Grado</th>
                <th>Promedio</th>
                <th>Nota Sugerida</th>
              </tr>
            </thead>
            <tbody>
              ${datos.alumnosRiesgo.map((alumno: any) => `
                <tr>
                  <td>${alumno.apellidos}, ${alumno.nombres}</td>
                  <td>${alumno.dni}</td>
                  <td>${alumno.grado}° ${alumno.seccion}</td>
                  <td>${alumno.promedio}</td>
                  <td>
                    <span class="nota-sugerida nota-${alumno.nota_sugerida.toLowerCase()}">
                      ${alumno.nota_sugerida}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ` : `
          <p style="text-align: center; color: #666; padding: 20px;">
            ¡Excelente! No hay alumnos en riesgo académico en este momento.
          </p>
          `}

          <!-- Recomendaciones -->
          <div class="recomendaciones">
            <h3>Recomendaciones de Intervención</h3>
            <ul>
              <li><strong>Refuerzo académico personalizado:</strong> Implementar sesiones de apoyo individual para alumnos con calificación B (En Proceso) o C (En Inicio)</li>
              <li><strong>Comunicación con apoderados:</strong> Informar a los padres sobre la situación académica y establecer un plan de seguimiento</li>
              <li><strong>Estrategias pedagógicas diferenciadas:</strong> Adaptar metodologías de enseñanza según las necesidades específicas</li>
              <li><strong>Evaluación continua:</strong> Realizar seguimiento semanal del progreso de los alumnos en riesgo</li>
              <li><strong>Coordinación interdisciplinaria:</strong> Trabajar con el equipo psicopedagógico para casos que requieran apoyo especializado</li>
            </ul>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Documento generado automáticamente por el Sistema de Gestión Educativa</p>
            <p>Fecha de generación: ${new Date().toLocaleString('es-ES')}</p>
          </div>
        </body>
        </html>
      `;

      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm',
        },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  /**
   * Genera PDF de mini libreta completa del alumno con top cursos
   */
  async generateMiniLibretaCompletaPdf(datos: any): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      
      // Generar gráfico de top cursos (datos para Chart.js)
      const topMejoresData = datos.topCursos?.mejores?.map((curso: any) => ({
        curso: curso.cursoNombre,
        promedio: curso.promedio,
        evaluaciones: curso.totalEvaluaciones
      })) || [];

      const topPeoresData = datos.topCursos?.peores?.map((curso: any) => ({
        curso: curso.cursoNombre,
        promedio: curso.promedio,
        evaluaciones: curso.totalEvaluaciones
      })) || [];

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Mini Libreta Completa</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              font-size: 11px;
              line-height: 1.3;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              color: #2563eb;
              font-size: 16px;
            }
            .header h2 {
              margin: 5px 0;
              color: #666;
              font-size: 12px;
              font-weight: normal;
            }
            .info-section {
              background: #f8f9fa;
              padding: 12px;
              border-radius: 6px;
              margin-bottom: 15px;
            }
            .info-section h3 {
              margin: 0 0 8px 0;
              color: #2563eb;
              font-size: 12px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              font-size: 10px;
            }
            .info-item {
              display: flex;
            }
            .info-label {
              font-weight: bold;
              min-width: 80px;
            }
            .section {
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            .section-title {
              background: #2563eb;
              color: white;
              padding: 8px 12px;
              margin: 0 0 10px 0;
              font-size: 12px;
              font-weight: bold;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              font-size: 9px;
              margin-bottom: 10px;
            }
            .table th {
              background: #e5e7eb;
              padding: 6px;
              text-align: left;
              border: 1px solid #d1d5db;
              font-weight: bold;
            }
            .table td {
              padding: 5px 6px;
              border: 1px solid #d1d5db;
            }
            .table tr:nth-child(even) {
              background: #f9fafb;
            }
            .top-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
            }
            .top-card {
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 12px;
            }
            .top-mejores {
              border-color: #10b981;
            }
            .top-peores {
              border-color: #ef4444;
            }
            .top-title {
              font-weight: bold;
              margin-bottom: 8px;
              font-size: 11px;
            }
            .top-mejores .top-title {
              color: #10b981;
            }
            .top-peores .top-title {
              color: #ef4444;
            }
            .curso-item {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
              border-bottom: 1px solid #e5e7eb;
              font-size: 9px;
            }
            .curso-item:last-child {
              border-bottom: none;
            }
            .curso-nombre {
              font-weight: bold;
            }
            .curso-promedio {
              color: #666;
            }
            .estadisticas {
              background: #fef3c7;
              padding: 12px;
              border-radius: 6px;
              border-left: 4px solid #f59e0b;
              margin-bottom: 15px;
            }
            .estadisticas h3 {
              margin: 0 0 8px 0;
              color: #92400e;
              font-size: 12px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              font-size: 10px;
            }
            .stat-item {
              text-align: center;
            }
            .stat-value {
              font-size: 14px;
              font-weight: bold;
              color: #92400e;
            }
            .stat-label {
              color: #666;
              margin-top: 2px;
            }
            .curso-detail {
              background: #f0f9ff;
              padding: 8px;
              margin: 8px 0;
              border-left: 3px solid #0ea5e9;
              border-radius: 4px;
            }
            .curso-detail h4 {
              margin: 0 0 6px 0;
              color: #0c4a6e;
              font-size: 11px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 8px;
              color: #666;
              border-top: 1px solid #e5e7eb;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div class="header">
            <h1>${datos.alumno?.colegioNombre || 'COLEGIO'}</h1>
            <h2>Mini Libreta Completa - ${datos.alumno?.nombres || ''} ${datos.alumno?.apellidos || ''}</h2>
            <p style="margin: 5px 0; font-size: 10px;">Período: ${datos.periodoAcademico?.nombre || ''} | Generado: ${new Date().toLocaleDateString('es-PE')}</p>
          </div>

          <!-- Información del Alumno -->
          <div class="info-section">
            <h3>📋 Información del Alumno</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Nombres:</span>
                <span>${datos.alumno?.nombres || ''} ${datos.alumno?.apellidos || ''}</span>
              </div>
              <div class="info-item">
                <span class="info-label">DNI:</span>
                <span>${datos.alumno?.dni || 'No registrado'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Código:</span>
                <span>${datos.alumno?.codigoAlumno || 'No asignado'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Salón:</span>
                <span>${datos.alumno?.salon ? `${datos.alumno.salon.grado}° ${datos.alumno.salon.seccion} - ${datos.alumno.salon.turno}` : 'No asignado'}</span>
              </div>
            </div>
          </div>

          <!-- Estadísticas Generales -->
          <div class="estadisticas">
            <h3>📊 Estadísticas Generales</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">${datos.estadisticas?.totalCursos || 0}</div>
                <div class="stat-label">Cursos</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${datos.estadisticas?.totalEvaluaciones || 0}</div>
                <div class="stat-label">Evaluaciones</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${datos.estadisticas?.promedioGeneral || 0}</div>
                <div class="stat-label">Promedio General</div>
              </div>
            </div>
          </div>

          <!-- Top Cursos -->
          ${topMejoresData.length > 0 || topPeoresData.length > 0 ? `
          <div class="top-section">
            <div class="top-card top-mejores">
              <div class="top-title">🏆 Top 3 Mejores Cursos</div>
              ${topMejoresData.map((curso: any, index: number) => `
                <div class="curso-item">
                  <span class="curso-nombre">${index + 1}. ${curso.curso}</span>
                  <span class="curso-promedio">${curso.promedio} (${curso.evaluaciones} eval.)</span>
                </div>
              `).join('')}
              ${topMejoresData.length === 0 ? '<p style="color: #666; font-size: 9px;">No hay datos suficientes</p>' : ''}
            </div>
            
            <div class="top-card top-peores">
              <div class="top-title">📉 Top 3 Cursos a Mejorar</div>
              ${topPeoresData.map((curso: any, index: number) => `
                <div class="curso-item">
                  <span class="curso-nombre">${index + 1}. ${curso.curso}</span>
                  <span class="curso-promedio">${curso.promedio} (${curso.evaluaciones} eval.)</span>
                </div>
              `).join('')}
              ${topPeoresData.length === 0 ? '<p style="color: #666; font-size: 9px;">No hay datos suficientes</p>' : ''}
            </div>
          </div>
          ` : ''}

          <!-- Profesores Asignados -->
          ${datos.profesores && datos.profesores.length > 0 ? `
          <div class="section">
            <h2 class="section-title">👨‍🏫 Profesores Asignados</h2>
            <table class="table">
              <thead>
                <tr>
                  <th>Profesor</th>
                  <th>Curso</th>
                </tr>
              </thead>
              <tbody>
                ${datos.profesores.map((prof: any) => `
                  <tr>
                    <td>${prof.nombres} ${prof.apellidos}</td>
                    <td>${prof.cursoNombre}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <!-- Cursos y Competencias -->
          ${datos.cursos && datos.cursos.length > 0 ? `
          <div class="section">
            <h2 class="section-title">📚 Cursos y Competencias</h2>
            ${datos.cursos.map((curso: any) => `
              <div class="curso-detail">
                <h4>${curso.nombre}</h4>
                ${curso.competencias && curso.competencias.length > 0 ? `
                  <table class="table">
                    <thead>
                      <tr>
                        <th style="width: 60px;">Orden</th>
                        <th>Competencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${curso.competencias.map((comp: any) => `
                        <tr>
                          <td>${comp.orden}</td>
                          <td>${comp.nombre}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                ` : '<p style="color: #666; font-size: 9px;">No hay competencias registradas</p>'}
              </div>
            `).join('')}
          </div>
          ` : ''}

          <!-- Evaluaciones y Notas - SEPARADO POR CURSO -->
          ${datos.notas && datos.notas.length > 0 ? `
          <div class="section">
            <h2 class="section-title">📝 Evaluaciones y Notas</h2>
            ${(() => {
              // Agrupar notas por curso
              const notasPorCurso = new Map();
              datos.notas.forEach((nota: any) => {
                if (!notasPorCurso.has(nota.cursoNombre)) {
                  notasPorCurso.set(nota.cursoNombre, []);
                }
                notasPorCurso.get(nota.cursoNombre).push(nota);
              });
              
              // Generar HTML para cada curso
              return Array.from(notasPorCurso.entries()).map(([cursoNombre, notasCurso], index) => `
                <div class="curso-section" style="margin-bottom: 25px;">
                  <h3 style="color: #2563eb; font-size: 13px; margin: 15px 0 10px 0; padding: 8px; background-color: #f0f4ff; border-left: 4px solid #2563eb;">
                    📚 ${cursoNombre}
                  </h3>
                  <table class="table" style="margin-top: 10px;">
                    <thead>
                      <tr>
                        <th>Competencia</th>
                        <th>Evaluación</th>
                        <th style="width: 60px;">Nota</th>
                        <th style="width: 80px;">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${notasCurso.map((nota: any) => `
                        <tr>
                          <td>${nota.competenciaNombre}</td>
                          <td>${nota.evaluacionNombre}</td>
                          <td style="text-align: center; font-weight: bold;">${nota.nota}</td>
                          <td>${nota.fechaRegistro ? new Date(nota.fechaRegistro).toLocaleDateString('es-PE') : ''}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `).join('');
            })()} 
          </div>
          ` : ''}

          <!-- Footer -->
          <div class="footer">
            <p>Este documento contiene información académica confidencial del estudiante.</p>
            <p>Generado automáticamente por el Sistema de Notas - ${new Date().toLocaleString('es-PE')}</p>
          </div>
        </body>
        </html>
      `;

      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm',
        },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
}
