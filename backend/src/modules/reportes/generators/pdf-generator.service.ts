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
    this.logger.log('Generando PDF de prueba');
    
    // Registrar helpers
    this.registerHandlebarsHelpers();
    
    const testHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Prueba</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #366092;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            color: #366092;
            font-size: 24px;
            font-weight: bold;
            margin: 0;
          }
          .subtitle {
            color: #666;
            font-size: 16px;
            margin: 10px 0;
          }
          .date {
            color: #888;
            font-size: 12px;
            font-style: italic;
          }
          .content {
            margin: 20px 0;
          }
          .test-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .test-table th,
          .test-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          .test-table th {
            background-color: #366092;
            color: white;
            font-weight: bold;
          }
          .test-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">COLEGIO DE PRUEBA</h1>
          <h2 class="subtitle">Reporte de Prueba - Backend Core</h2>
          <p class="date">Generado el: ${new Date().toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}</p>
        </div>
        
        <div class="content">
          <h3>Datos de Prueba</h3>
          <p>Este es un PDF de prueba generado por el sistema de reportes. 
             Confirma que Puppeteer está funcionando correctamente.</p>
          
          <table class="test-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>DNI</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Juan</td>
                <td>Pérez</td>
                <td>12345678</td>
                <td>Activo</td>
              </tr>
              <tr>
                <td>2</td>
                <td>María</td>
                <td>García</td>
                <td>87654321</td>
                <td>Activo</td>
              </tr>
              <tr>
                <td>3</td>
                <td>Carlos</td>
                <td>López</td>
                <td>11223344</td>
                <td>Inactivo</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <p>Sistema de Notas - Generado automáticamente</p>
        </div>
      </body>
      </html>
    `;
    
    return this.generateFromHtml(testHtml);
  }
}
