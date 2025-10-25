import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma.service';
import { DistribucionLogrosResponseDto, LogrosPorColegioDto } from './dto/distribucion-logros.dto';
import { CursosProblemaResponseDto, CursoProblemaDto } from './dto/cursos-problema.dto';

@Injectable()
export class EstadisticasService {
  private readonly logger = new Logger(EstadisticasService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Convierte un valor de escala de cálculo (1.0-4.0) a categoría de logro
   * Esta función unifica el tratamiento de notas alfabéticas y numéricas
   */
  private convertirEscalaACategoria(escala: number): string {
    if (escala >= 3.5) return 'AD';
    if (escala >= 2.5) return 'A';
    if (escala >= 1.5) return 'B';
    return 'C';
  }

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
   * Obtiene la distribución de logros (AD, A, B, C) por colegio
   * Solo para OWNER - Vista global del sistema
   */
  async obtenerDistribucionLogrosPorColegio(): Promise<DistribucionLogrosResponseDto> {
    this.logger.log('Obteniendo distribución de logros por colegio');

    try {
      // Verificar si hay datos de registro de notas
      const totalNotas = await this.prisma.registroNota.count();
      
      if (totalNotas === 0) {
        this.logger.log('No hay datos de notas registradas, devolviendo datos de ejemplo');
        
        // Obtener colegios para generar datos de ejemplo
        const colegios = await this.prisma.colegio.findMany({
          select: { id: true, nombre: true }
        });

        const colegiosConDatos: LogrosPorColegioDto[] = colegios.map((colegio) => ({
          nombre: colegio.nombre,
          logros: { AD: 0, A: 0, B: 0, C: 0 },
          totalNotas: 0,
          porcentajes: { AD: 0, A: 0, B: 0, C: 0 },
        }));

        return {
          colegios: colegiosConDatos,
          totalColegios: colegios.length,
          totalNotasGlobal: 0,
          resumenGlobal: { AD: 0, A: 0, B: 0, C: 0 },
        };
      }

      // Obtener datos usando notaEscalaCalculo para incluir TODAS las notas (alfabéticas + numéricas)
      const resultados = await this.prisma.$queryRaw`
        SELECT 
          c.id as colegio_id,
          c.nombre as colegio_nombre,
          CASE 
            WHEN COALESCE(rn."notaEscalaCalculo", 
              CASE 
                WHEN rn.nota = 'AD' THEN 4.0
                WHEN rn.nota = 'A' THEN 3.0
                WHEN rn.nota = 'B' THEN 2.0
                WHEN rn.nota = 'C' THEN 1.0
                ELSE GREATEST(1.0, LEAST(4.0, 1.0 + (CAST(rn.nota AS FLOAT) / 20.0) * 3.0))
              END
            ) >= 3.5 THEN 'AD'
            WHEN COALESCE(rn."notaEscalaCalculo", 
              CASE 
                WHEN rn.nota = 'AD' THEN 4.0
                WHEN rn.nota = 'A' THEN 3.0
                WHEN rn.nota = 'B' THEN 2.0
                WHEN rn.nota = 'C' THEN 1.0
                ELSE GREATEST(1.0, LEAST(4.0, 1.0 + (CAST(rn.nota AS FLOAT) / 20.0) * 3.0))
              END
            ) >= 2.5 THEN 'A'
            WHEN COALESCE(rn."notaEscalaCalculo", 
              CASE 
                WHEN rn.nota = 'AD' THEN 4.0
                WHEN rn.nota = 'A' THEN 3.0
                WHEN rn.nota = 'B' THEN 2.0
                WHEN rn.nota = 'C' THEN 1.0
                ELSE GREATEST(1.0, LEAST(4.0, 1.0 + (CAST(rn.nota AS FLOAT) / 20.0) * 3.0))
              END
            ) >= 1.5 THEN 'B'
            ELSE 'C'
          END as categoria_logro,
          COUNT(*)::int as cantidad
        FROM registro_nota rn
        INNER JOIN alumno a ON rn."alumnoId" = a.id
        INNER JOIN colegio c ON a."colegioId" = c.id
        WHERE rn.nota IS NOT NULL AND rn.nota != ''
        GROUP BY c.id, c.nombre, categoria_logro
        ORDER BY c.nombre, categoria_logro
      ` as Array<{
        colegio_id: number;
        colegio_nombre: string;
        categoria_logro: string;
        cantidad: number;
      }>;

      // Procesar resultados por colegio
      const colegiosMap = new Map<number, LogrosPorColegioDto>();

      resultados.forEach((row) => {
        if (!colegiosMap.has(row.colegio_id)) {
          colegiosMap.set(row.colegio_id, {
            nombre: row.colegio_nombre,
            logros: { AD: 0, A: 0, B: 0, C: 0 },
            totalNotas: 0,
            porcentajes: { AD: 0, A: 0, B: 0, C: 0 },
          });
        }

        const colegio = colegiosMap.get(row.colegio_id)!;
        colegio.logros[row.categoria_logro as keyof typeof colegio.logros] = row.cantidad;
        colegio.totalNotas += row.cantidad;
      });

      // Calcular porcentajes
      const colegios: LogrosPorColegioDto[] = Array.from(colegiosMap.values()).map((colegio) => {
        if (colegio.totalNotas > 0) {
          colegio.porcentajes.AD = Number(((colegio.logros.AD / colegio.totalNotas) * 100).toFixed(1));
          colegio.porcentajes.A = Number(((colegio.logros.A / colegio.totalNotas) * 100).toFixed(1));
          colegio.porcentajes.B = Number(((colegio.logros.B / colegio.totalNotas) * 100).toFixed(1));
          colegio.porcentajes.C = Number(((colegio.logros.C / colegio.totalNotas) * 100).toFixed(1));
        }
        return colegio;
      });

      // Calcular resumen global
      const resumenGlobal = colegios.reduce(
        (acc, colegio) => ({
          AD: acc.AD + colegio.logros.AD,
          A: acc.A + colegio.logros.A,
          B: acc.B + colegio.logros.B,
          C: acc.C + colegio.logros.C,
        }),
        { AD: 0, A: 0, B: 0, C: 0 }
      );

      const totalNotasGlobal = Object.values(resumenGlobal).reduce((sum, count) => sum + count, 0);

      this.logger.log(`Distribución calculada: ${colegios.length} colegios, ${totalNotasGlobal} notas totales`);

      return {
        colegios,
        totalColegios: colegios.length,
        totalNotasGlobal,
        resumenGlobal,
      };
    } catch (error) {
      this.logger.error('Error al obtener distribución de logros por colegio', error);
      throw new Error('No se pudo obtener la distribución de logros');
    }
  }

  /**
   * Obtiene los cursos con mayor porcentaje de alumnos con problemas (notas B y C)
   * Solo para OWNER - Vista global del sistema
   */
  async obtenerCursosProblemaGlobal(): Promise<CursosProblemaResponseDto> {
    this.logger.log('Obteniendo cursos problema a nivel global');

    try {
      // Verificar si hay datos de registro de notas
      const totalNotas = await this.prisma.registroNota.count();
      
      if (totalNotas === 0) {
        this.logger.log('No hay datos de notas registradas, devolviendo datos vacíos');
        
        const totalCursos = await this.prisma.curso.count();
        
        return {
          cursosProblema: [],
          totalCursos,
          cursosAnalizados: 0,
          promedioProblemasGlobal: 0,
        };
      }

      // Query usando notaEscalaCalculo para incluir TODAS las notas (alfabéticas + numéricas)
      const resultados = await this.prisma.$queryRaw`
        WITH promedios_alumnos AS (
          SELECT 
            cur.id as curso_id,
            cur.nombre as curso_nombre,
            rn."alumnoId",
            AVG(
              COALESCE(rn."notaEscalaCalculo", 
                CASE 
                  WHEN rn.nota = 'AD' THEN 4.0
                  WHEN rn.nota = 'A' THEN 3.0
                  WHEN rn.nota = 'B' THEN 2.0
                  WHEN rn.nota = 'C' THEN 1.0
                  ELSE GREATEST(1.0, LEAST(4.0, 1.0 + (CAST(rn.nota AS FLOAT) / 20.0) * 3.0))
                END
              )
            ) as promedio_numerico
          FROM registro_nota rn
          INNER JOIN evaluacion e ON rn."evaluacionId" = e.id
          INNER JOIN competencia comp ON e."competenciaId" = comp.id
          INNER JOIN curso cur ON comp."cursoId" = cur.id
          WHERE rn.nota IS NOT NULL AND rn.nota != ''
          GROUP BY cur.id, cur.nombre, rn."alumnoId"
        )
        SELECT 
          curso_nombre as nombre,
          COUNT(*)::int as total_alumnos,
          COUNT(CASE WHEN promedio_numerico < 3 THEN 1 END)::int as alumnos_problema,
          CAST(
            (COUNT(CASE WHEN promedio_numerico < 3 THEN 1 END)::float / 
             COUNT(*)::float) * 100 AS DECIMAL(5,2)
          ) as porcentaje_problema,
          COUNT(CASE WHEN promedio_numerico >= 2 AND promedio_numerico < 3 THEN 1 END)::int as nota_b,
          COUNT(CASE WHEN promedio_numerico < 2 THEN 1 END)::int as nota_c
        FROM promedios_alumnos
        GROUP BY curso_id, curso_nombre
        HAVING COUNT(*) >= 5
        ORDER BY porcentaje_problema DESC
        LIMIT 10
      ` as Array<{
        nombre: string;
        total_alumnos: number;
        alumnos_problema: number;
        porcentaje_problema: number;
        nota_b: number;
        nota_c: number;
      }>;

      // Procesar resultados
      const cursosProblema: CursoProblemaDto[] = resultados.map((row) => {
        const porcentajeProblema = row.total_alumnos > 0 
          ? Number(((row.alumnos_problema / row.total_alumnos) * 100).toFixed(1))
          : 0;

        return {
          nombre: row.nombre,
          totalAlumnos: row.total_alumnos,
          alumnosProblema: row.alumnos_problema,
          porcentajeProblema: row.porcentaje_problema,
          detalleProblemas: {
            B: row.nota_b,
            C: row.nota_c,
          },
          nivel: 'GENERAL', // Por ahora usamos un valor por defecto
        };
      });

      // Calcular estadísticas globales
      const totalCursos = await this.prisma.curso.count();
      const cursosAnalizados = cursosProblema.length;
      
      const promedioProblemasGlobal = cursosProblema.length > 0
        ? Number((cursosProblema.reduce((sum, curso) => sum + curso.porcentajeProblema, 0) / cursosProblema.length).toFixed(1))
        : 0;

      this.logger.log(`Cursos problema calculados: ${cursosAnalizados} cursos analizados de ${totalCursos} totales`);

      return {
        cursosProblema,
        totalCursos,
        cursosAnalizados,
        promedioProblemasGlobal,
      };
    } catch (error) {
      this.logger.error('Error al obtener cursos problema globales');
      this.logger.error(error);
      
      throw new Error('No se pudo obtener los cursos problema');
    }
  }

  /**
   * Obtiene la distribución de logros para un colegio específico
   * Para DIRECTOR - Vista de su colegio
   */
  async obtenerDistribucionLogrosPorColegio_Director(colegioId: number): Promise<LogrosPorColegioDto> {
    this.logger.log(`Obteniendo distribución de logros para colegio ${colegioId}`);

    try {
      const resultados = await this.prisma.$queryRaw`
        SELECT 
          c.nombre as colegio_nombre,
          CASE 
            WHEN COALESCE(rn."notaEscalaCalculo", 
              CASE 
                WHEN rn.nota = 'AD' THEN 4.0
                WHEN rn.nota = 'A' THEN 3.0
                WHEN rn.nota = 'B' THEN 2.0
                WHEN rn.nota = 'C' THEN 1.0
                ELSE GREATEST(1.0, LEAST(4.0, 1.0 + (CAST(rn.nota AS FLOAT) / 20.0) * 3.0))
              END
            ) >= 3.5 THEN 'AD'
            WHEN COALESCE(rn."notaEscalaCalculo", 
              CASE 
                WHEN rn.nota = 'AD' THEN 4.0
                WHEN rn.nota = 'A' THEN 3.0
                WHEN rn.nota = 'B' THEN 2.0
                WHEN rn.nota = 'C' THEN 1.0
                ELSE GREATEST(1.0, LEAST(4.0, 1.0 + (CAST(rn.nota AS FLOAT) / 20.0) * 3.0))
              END
            ) >= 2.5 THEN 'A'
            WHEN COALESCE(rn."notaEscalaCalculo", 
              CASE 
                WHEN rn.nota = 'AD' THEN 4.0
                WHEN rn.nota = 'A' THEN 3.0
                WHEN rn.nota = 'B' THEN 2.0
                WHEN rn.nota = 'C' THEN 1.0
                ELSE GREATEST(1.0, LEAST(4.0, 1.0 + (CAST(rn.nota AS FLOAT) / 20.0) * 3.0))
              END
            ) >= 1.5 THEN 'B'
            ELSE 'C'
          END as categoria_logro,
          COUNT(*)::int as cantidad
        FROM registro_nota rn
        INNER JOIN alumno a ON rn."alumnoId" = a.id
        INNER JOIN colegio c ON a."colegioId" = c.id
        WHERE c.id = ${colegioId} AND rn.nota IS NOT NULL AND rn.nota != ''
        GROUP BY c.nombre, categoria_logro
        ORDER BY categoria_logro
      ` as Array<{
        colegio_nombre: string;
        categoria_logro: string;
        cantidad: number;
      }>;

      const logros = { AD: 0, A: 0, B: 0, C: 0 };
      let nombreColegio = '';

      resultados.forEach((row) => {
        nombreColegio = row.colegio_nombre;
        logros[row.categoria_logro as keyof typeof logros] = row.cantidad;
      });

      const totalNotas = Object.values(logros).reduce((sum, count) => sum + count, 0);

      const porcentajes = {
        AD: totalNotas > 0 ? Number(((logros.AD / totalNotas) * 100).toFixed(1)) : 0,
        A: totalNotas > 0 ? Number(((logros.A / totalNotas) * 100).toFixed(1)) : 0,
        B: totalNotas > 0 ? Number(((logros.B / totalNotas) * 100).toFixed(1)) : 0,
        C: totalNotas > 0 ? Number(((logros.C / totalNotas) * 100).toFixed(1)) : 0,
      };

      return {
        nombre: nombreColegio,
        logros,
        totalNotas,
        porcentajes,
      };
    } catch (error) {
      this.logger.error(`Error al obtener distribución de logros para colegio ${colegioId}`, error);
      throw new Error('No se pudo obtener la distribución de logros del colegio');
    }
  }

  /**
   * Obtiene el rendimiento por grado para un colegio específico
   * Solo para DIRECTOR - Vista de su propio colegio
   */
  async obtenerRendimientoPorGrado(colegioId: number) {
    this.logger.log(`Obteniendo rendimiento por grado para colegio ${colegioId}`);

    try {
      const resultados = await this.prisma.$queryRaw`
        WITH notas_con_escala AS (
          SELECT 
            s.grado,
            n.nombre as nivel,
            rn."alumnoId",
            COALESCE(rn."notaEscalaCalculo", 
              CASE 
                WHEN rn.nota = 'AD' THEN 4.0
                WHEN rn.nota = 'A' THEN 3.0
                WHEN rn.nota = 'B' THEN 2.0
                WHEN rn.nota = 'C' THEN 1.0
                ELSE GREATEST(1.0, LEAST(4.0, 1.0 + (CAST(rn.nota AS FLOAT) / 20.0) * 3.0))
              END
            ) as escala_calculo
          FROM registro_nota rn
          INNER JOIN alumno a ON rn."alumnoId" = a.id
          INNER JOIN alumno_salon als ON a.id = als."alumnoId"
          INNER JOIN salon s ON als."salonId" = s.id
          INNER JOIN colegio_nivel cn ON s."colegioNivelId" = cn.id
          INNER JOIN nivel n ON cn."nivelId" = n.id
          WHERE a."colegioId" = ${colegioId} AND rn.nota IS NOT NULL AND rn.nota != ''
        )
        SELECT 
          grado,
          nivel,
          COUNT(DISTINCT "alumnoId")::int as total_alumnos,
          COUNT(CASE WHEN escala_calculo >= 3.5 THEN 1 END)::int as logro_ad,
          COUNT(CASE WHEN escala_calculo >= 2.5 AND escala_calculo < 3.5 THEN 1 END)::int as logro_a,
          COUNT(CASE WHEN escala_calculo >= 1.5 AND escala_calculo < 2.5 THEN 1 END)::int as logro_b,
          COUNT(CASE WHEN escala_calculo < 1.5 THEN 1 END)::int as logro_c,
          CAST(AVG(escala_calculo) AS DECIMAL(3,2)) as promedio_numerico
        FROM notas_con_escala
        GROUP BY grado, nivel
        ORDER BY nivel, grado
      ` as Array<{
        grado: string;
        nivel: string;
        total_alumnos: number;
        logro_ad: number;
        logro_a: number;
        logro_b: number;
        logro_c: number;
        promedio_numerico: number;
      }>;

      const rendimientoPorGrado = resultados.map((row) => ({
        grado: `${row.grado}° ${row.nivel}`,
        totalAlumnos: row.total_alumnos,
        logros: {
          AD: row.logro_ad,
          A: row.logro_a,
          B: row.logro_b,
          C: row.logro_c,
        },
        promedioNumerico: Number(row.promedio_numerico),
        porcentajes: {
          AD: row.total_alumnos > 0 ? Number(((row.logro_ad / row.total_alumnos) * 100).toFixed(1)) : 0,
          A: row.total_alumnos > 0 ? Number(((row.logro_a / row.total_alumnos) * 100).toFixed(1)) : 0,
          B: row.total_alumnos > 0 ? Number(((row.logro_b / row.total_alumnos) * 100).toFixed(1)) : 0,
          C: row.total_alumnos > 0 ? Number(((row.logro_c / row.total_alumnos) * 100).toFixed(1)) : 0,
        }
      }));

      this.logger.log(`Rendimiento por grado calculado: ${rendimientoPorGrado.length} grados`);

      return {
        grados: rendimientoPorGrado,
        totalGrados: rendimientoPorGrado.length,
      };

    } catch (error) {
      this.logger.error(`Error al obtener rendimiento por grado para colegio ${colegioId}`, error);
      throw new Error('No se pudo obtener el rendimiento por grado');
    }
  }

  /**
   * Obtiene los cursos con mayor porcentaje de problemas para un colegio específico
   * Solo para DIRECTOR - Vista de su propio colegio (Top 5)
   */
  async obtenerCursosProblemaColegioDirector(colegioId: number) {
    this.logger.log(`Obteniendo cursos problema para colegio ${colegioId}`);

    try {
      // Verificar si hay datos
      const totalNotas = await this.prisma.registroNota.count({
        where: {
          alumno: {
            colegioId: colegioId
          }
        }
      });
      
      if (totalNotas === 0) {
        this.logger.log(`No hay datos de notas para colegio ${colegioId}`);
        
        const totalCursos = await this.prisma.curso.count();
        
        return {
          cursosProblema: [],
          totalCursos,
          cursosAnalizados: 0,
          promedioProblemasLocal: 0,
        };
      }

      const resultados = await this.prisma.$queryRaw`
        WITH promedios_alumnos AS (
          SELECT 
            cur.id as curso_id,
            cur.nombre as curso_nombre,
            n.nombre as nivel,
            rn."alumnoId",
            AVG(
              COALESCE(rn."notaEscalaCalculo", 
                CASE 
                  WHEN rn.nota = 'AD' THEN 4.0
                  WHEN rn.nota = 'A' THEN 3.0
                  WHEN rn.nota = 'B' THEN 2.0
                  WHEN rn.nota = 'C' THEN 1.0
                  ELSE GREATEST(1.0, LEAST(4.0, 1.0 + (CAST(rn.nota AS FLOAT) / 20.0) * 3.0))
                END
              )
            ) as promedio_numerico
          FROM registro_nota rn
          INNER JOIN evaluacion e ON rn."evaluacionId" = e.id
          INNER JOIN competencia comp ON e."competenciaId" = comp.id
          INNER JOIN curso cur ON comp."cursoId" = cur.id
          INNER JOIN nivel n ON cur."nivelId" = n.id
          INNER JOIN alumno a ON rn."alumnoId" = a.id
          WHERE a."colegioId" = ${colegioId} AND rn.nota IS NOT NULL AND rn.nota != ''
          GROUP BY cur.id, cur.nombre, n.nombre, rn."alumnoId"
        )
        SELECT 
          curso_nombre as nombre,
          nivel,
          COUNT(*)::int as total_alumnos,
          COUNT(CASE WHEN promedio_numerico < 3 THEN 1 END)::int as alumnos_problema,
          CAST(
            (COUNT(CASE WHEN promedio_numerico < 3 THEN 1 END)::float / 
             COUNT(*)::float) * 100 AS DECIMAL(5,2)
          ) as porcentaje_problema,
          COUNT(CASE WHEN promedio_numerico >= 2 AND promedio_numerico < 3 THEN 1 END)::int as nota_b,
          COUNT(CASE WHEN promedio_numerico < 2 THEN 1 END)::int as nota_c
        FROM promedios_alumnos
        GROUP BY curso_id, curso_nombre, nivel
        HAVING COUNT(*) >= 3
        ORDER BY porcentaje_problema DESC
        LIMIT 5
      ` as Array<{
        nombre: string;
        nivel: string;
        total_alumnos: number;
        alumnos_problema: number;
        porcentaje_problema: number;
        nota_b: number;
        nota_c: number;
      }>;

      const cursosProblema = resultados.map((row) => ({
        nombre: row.nombre,
        totalAlumnos: row.total_alumnos,
        alumnosProblema: row.alumnos_problema,
        porcentajeProblema: row.porcentaje_problema,
        detalleProblemas: {
          B: row.nota_b,
          C: row.nota_c,
        },
        nivel: row.nivel,
      }));

      // Calcular estadísticas del colegio
      const totalCursos = await this.prisma.curso.count();
      const cursosAnalizados = cursosProblema.length;
      
      const promedioProblemasLocal = cursosProblema.length > 0
        ? Number((cursosProblema.reduce((sum, curso) => sum + curso.porcentajeProblema, 0) / cursosProblema.length).toFixed(1))
        : 0;

      this.logger.log(`Cursos problema calculados para colegio ${colegioId}: ${cursosAnalizados} cursos`);

      return {
        cursosProblema,
        totalCursos,
        cursosAnalizados,
        promedioProblemasLocal,
      };

    } catch (error) {
      this.logger.error(`Error al obtener cursos problema para colegio ${colegioId}`, error);
      throw new Error('No se pudo obtener los cursos problema del colegio');
    }
  }
}
