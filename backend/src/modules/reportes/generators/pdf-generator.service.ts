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
              padding: 10px 15px;
              margin: 20px 0 10px 0;
              border-radius: 5px;
              font-weight: bold;
            }
            .alumnos-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .alumnos-table th,
            .alumnos-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .alumnos-table th {
              background: #f3f4f6;
              font-weight: bold;
            }
            .nota-sugerida {
              font-weight: bold;
              padding: 4px 8px;
              border-radius: 4px;
              color: white;
            }
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
              <li><strong>Refuerzo académico personalizado:</strong> Implementar sesiones de apoyo individual para alumnos con promedio menor a 2.5</li>
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
}
