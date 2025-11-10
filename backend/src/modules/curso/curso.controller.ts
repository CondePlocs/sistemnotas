import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { CursoService } from './curso.service';
import { CrearCursoDto, ActualizarCursoDto } from './dto';

@Controller('api/cursos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CursoController {
  constructor(private readonly cursoService: CursoService) {}

  // POST /api/cursos - Crear curso
  @Post()
  @Roles('OWNER')
  @HttpCode(HttpStatus.CREATED)
  async crear(@Request() req: any, @Body() crearCursoDto: CrearCursoDto) {
    const curso = await this.cursoService.crear(req.user.id, crearCursoDto);
    
    return {
      success: true,
      message: 'Curso creado exitosamente',
      curso
    };
  }

  // GET /api/cursos - Obtener todos los cursos
  @Get()
  @Roles('OWNER')
  async obtenerTodos(@Request() req: any) {
    const cursos = await this.cursoService.obtenerTodos(req.user.id);
    
    return {
      success: true,
      cursos,
      total: cursos.length
    };
  }

  // POST /api/cursos/:id/asignar-salones - Asignar curso a salones existentes (DEBUG)
  @Post(':id/asignar-salones')
  @Roles('OWNER')
  async asignarASalonesExistentes(@Request() req: any, @Param('id') cursoId: string) {
    const curso = await this.cursoService.obtenerPorId(req.user.id, parseInt(cursoId));
    
    // Llamar al método privado usando reflexión para debugging
    const resultado = await (this.cursoService as any).asignarCursoASalonesExistentes(
      curso.id, 
      curso.nivel.nombre, 
      req.user.id
    );
    
    return {
      success: true,
      message: 'Asignación manual completada',
      resultado
    };
  }

  // GET /api/cursos/debug/asignaciones - Ver todas las asignaciones (DEBUG)
  @Get('debug/asignaciones')
  @Roles('OWNER')
  async verAsignaciones(@Request() req: any) {
    const asignaciones = await this.cursoService.obtenerTodasAsignaciones();
    
    return {
      success: true,
      asignaciones
    };
  }

  // GET /api/cursos/estadisticas - Obtener estadísticas
  @Get('estadisticas')
  @Roles('OWNER')
  async obtenerEstadisticas(@Request() req: any) {
    const estadisticas = await this.cursoService.obtenerEstadisticas(req.user.id);
    
    return {
      success: true,
      estadisticas
    };
  }

  // GET /api/cursos/:id - Obtener curso por ID
  @Get(':id')
  @Roles('OWNER')
  async obtenerPorId(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number
  ) {
    const curso = await this.cursoService.obtenerPorId(req.user.id, id);
    
    return {
      success: true,
      curso
    };
  }

  // PUT /api/cursos/:id - Actualizar curso
  @Put(':id')
  @Roles('OWNER')
  async actualizar(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarCursoDto: ActualizarCursoDto
  ) {
    const curso = await this.cursoService.actualizar(req.user.id, id, actualizarCursoDto);
    
    return {
      success: true,
      message: 'Curso actualizado exitosamente',
      curso
    };
  }

  // DELETE /api/cursos/:id - Eliminar curso
  @Delete(':id')
  @Roles('OWNER')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number
  ) {
    await this.cursoService.eliminar(req.user.id, id);
    
    return {
      success: true,
      message: 'Curso eliminado exitosamente'
    };
  }
}
