import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  ParseIntPipe, 
  UseGuards,
  Request,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AlumnoService } from './alumno.service';
import { CrearAlumnoDto, ActualizarAlumnoDto } from './dto';
import { SalonCursosService } from '../salon/salon-cursos.service';

@Controller('api/alumnos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlumnoController {
  constructor(
    private readonly alumnoService: AlumnoService,
    private readonly salonCursosService: SalonCursosService
  ) {}

  @Post()
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async crear(@Body() crearAlumnoDto: CrearAlumnoDto, @Request() req) {
    try {
      const resultado = await this.alumnoService.crear(crearAlumnoDto, req.user.id);
      return resultado;
    } catch (error) {
      console.error('Error en AlumnoController.crear:', error);
      
      if (error.message.includes('No tienes permisos')) {
        throw new HttpException(error.message, HttpStatus.FORBIDDEN);
      }
      
      if (error.message.includes('Ya existe')) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      
      if (error.message.includes('no encontrado')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      
      throw new HttpException(
        'Error interno del servidor', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  @Roles('DIRECTOR', 'ADMINISTRATIVO', 'PROFESOR')
  async obtenerTodos(
    @Request() req,
    @Query('activo') activo?: string,
    @Query('busqueda') busqueda?: string,
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string
  ) {
    try {
      const filtros = {
        ...(activo !== undefined && { activo: activo === 'true' }),
        ...(busqueda && { busqueda }),
        ...(pagina && { pagina: parseInt(pagina) }),
        ...(limite && { limite: parseInt(limite) })
      };

      const resultado = await this.alumnoService.obtenerTodos(req.user.id, filtros);
      return resultado;
    } catch (error) {
      console.error('Error en AlumnoController.obtenerTodos:', error);
      
      if (error.message.includes('no tiene acceso')) {
        throw new HttpException(error.message, HttpStatus.FORBIDDEN);
      }
      
      if (error.message.includes('no encontrado')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      
      throw new HttpException(
        'Error interno del servidor', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @Roles('DIRECTOR', 'ADMINISTRATIVO', 'PROFESOR')
  async obtenerPorId(@Param('id', ParseIntPipe) id: number, @Request() req) {
    try {
      const resultado = await this.alumnoService.obtenerPorId(id, req.user.id);
      return resultado;
    } catch (error) {
      console.error('Error en AlumnoController.obtenerPorId:', error);
      
      if (error.message.includes('no tiene acceso')) {
        throw new HttpException(error.message, HttpStatus.FORBIDDEN);
      }
      
      if (error.message.includes('no encontrado')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      
      throw new HttpException(
        'Error interno del servidor', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarAlumnoDto: ActualizarAlumnoDto,
    @Request() req
  ) {
    try {
      const resultado = await this.alumnoService.actualizar(id, actualizarAlumnoDto, req.user.id);
      return resultado;
    } catch (error) {
      console.error('Error en AlumnoController.actualizar:', error);
      
      if (error.message.includes('No tienes permisos')) {
        throw new HttpException(error.message, HttpStatus.FORBIDDEN);
      }
      
      if (error.message.includes('Ya existe')) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      
      if (error.message.includes('no encontrado')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      
      throw new HttpException(
        'Error interno del servidor', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  @Roles('DIRECTOR')
  async eliminar(@Param('id', ParseIntPipe) id: number, @Request() req) {
    try {
      const resultado = await this.alumnoService.eliminar(id, req.user.id);
      return resultado;
    } catch (error) {
      console.error('Error en AlumnoController.eliminar:', error);
      
      if (error.message.includes('Solo directores')) {
        throw new HttpException(error.message, HttpStatus.FORBIDDEN);
      }
      
      if (error.message.includes('no encontrado')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      
      throw new HttpException(
        'Error interno del servidor', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Endpoint adicional para estadísticas
  @Get('estadisticas/resumen')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async obtenerEstadisticas(@Request() req) {
    try {
      const [total, activos, inactivos] = await Promise.all([
        this.alumnoService.obtenerTodos(req.user.id),
        this.alumnoService.obtenerTodos(req.user.id, { activo: true }),
        this.alumnoService.obtenerTodos(req.user.id, { activo: false })
      ]);

      return {
        success: true,
        data: {
          total: total.meta.total,
          activos: activos.meta.total,
          inactivos: inactivos.meta.total
        }
      };
    } catch (error) {
      console.error('Error en AlumnoController.obtenerEstadisticas:', error);
      throw new HttpException(
        'Error interno del servidor', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Obtener cursos asignados a un alumno
  @Get(':id/cursos')
  @Roles('DIRECTOR', 'ADMINISTRATIVO', 'PROFESOR', 'APODERADO')
  async obtenerCursosDeAlumno(
    @Param('id', ParseIntPipe) alumnoId: number,
    @Request() req: any
  ) {
    try {
      const cursos = await this.salonCursosService.obtenerCursosDeAlumno(alumnoId);
      
      return {
        success: true,
        cursos: cursos,
        total: cursos.length
      };
    } catch (error) {
      console.error('Error en AlumnoController.obtenerCursosDeAlumno:', error);
      throw new HttpException(
        'Error interno del servidor', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
