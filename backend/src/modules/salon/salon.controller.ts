import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { SalonService } from './salon.service';
import { SalonAlumnosService } from './salon-alumnos.service';
import { CreateSalonDto } from './dto/create-salon.dto';
import { CreateSalonesLoteDto } from './dto/create-salones-lote.dto';
import { UpdateSalonDto } from './dto/update-salon.dto';
import { AsignarAlumnosDto, RemoverAlumnoDto, FiltrosAlumnosDisponiblesDto } from './dto/asignar-alumnos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/salones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalonController {
  constructor(
    private readonly salonService: SalonService,
    private readonly salonAlumnosService: SalonAlumnosService
  ) {}

  // Crear un salón individual (modo manual)
  @Post()
  @Roles('DIRECTOR')
  @HttpCode(HttpStatus.CREATED)
  async crearSalon(@Body() createSalonDto: CreateSalonDto, @Request() req: any) {
    return this.salonService.crearSalon(createSalonDto, req.user.id);
  }

  // Crear múltiples salones (modo automático)
  @Post('lote')
  @Roles('DIRECTOR')
  @HttpCode(HttpStatus.CREATED)
  async crearSalonesLote(@Body() createSalonesLoteDto: CreateSalonesLoteDto, @Request() req: any) {
    return this.salonService.crearSalonesLote(createSalonesLoteDto, req.user.id);
  }

  // Obtener todos los salones del colegio del director
  @Get()
  @Roles('DIRECTOR')
  async obtenerSalones(@Request() req: any) {
    return this.salonService.obtenerSalonesPorDirector(req.user.id);
  }

  // Actualizar un salón específico
  @Patch(':id')
  @Roles('DIRECTOR')
  async actualizarSalon(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSalonDto: UpdateSalonDto,
    @Request() req: any
  ) {
    return this.salonService.actualizarSalon(id, updateSalonDto, req.user.id);
  }

  // Eliminar (desactivar) un salón
  @Delete(':id')
  @Roles('DIRECTOR')
  @HttpCode(HttpStatus.OK)
  async eliminarSalon(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.salonService.eliminarSalon(id, req.user.id);
  }

  // ========================================
  // ENDPOINTS PARA GESTIÓN DE ALUMNOS
  // ========================================

  // Asignar múltiples alumnos a un salón
  @Post(':id/alumnos')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  @HttpCode(HttpStatus.CREATED)
  async asignarAlumnos(
    @Param('id', ParseIntPipe) salonId: number,
    @Body() asignarAlumnosDto: AsignarAlumnosDto,
    @Request() req: any
  ) {
    // Asegurar que el salonId del parámetro coincida con el del DTO
    asignarAlumnosDto.salonId = salonId;
    
    const resultado = await this.salonAlumnosService.asignarAlumnos(asignarAlumnosDto, req.user.id);
    
    return {
      success: true,
      message: `${resultado.totalAsignados} alumno(s) asignado(s) exitosamente al salón`,
      data: resultado
    };
  }

  // Obtener alumnos de un salón específico
  @Get(':id/alumnos')
  @Roles('DIRECTOR', 'ADMINISTRATIVO', 'PROFESOR')
  async obtenerAlumnosDeSalon(
    @Param('id', ParseIntPipe) salonId: number,
    @Request() req: any
  ) {
    const resultado = await this.salonAlumnosService.obtenerAlumnosDeSalon(salonId, req.user.id);
    
    return {
      success: true,
      data: resultado
    };
  }

  // Obtener alumnos disponibles para asignar (con filtros)
  @Get('alumnos-disponibles')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async obtenerAlumnosDisponibles(
    @Request() req: any,
    @Body() filtros: FiltrosAlumnosDisponiblesDto = {}
  ) {
    // Obtener el colegio del usuario desde su rol
    const usuario = await this.salonAlumnosService.obtenerColegioUsuario(req.user.id);
    
    const resultado = await this.salonAlumnosService.obtenerAlumnosDisponibles(
      usuario.colegioId, 
      filtros, 
      req.user.id
    );
    
    return {
      success: true,
      data: resultado
    };
  }

  // Remover alumno de un salón
  @Delete(':salonId/alumnos/:alumnoId')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  @HttpCode(HttpStatus.OK)
  async removerAlumno(
    @Param('salonId', ParseIntPipe) salonId: number,
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Request() req: any
  ) {
    const removerAlumnoDto: RemoverAlumnoDto = {
      salonId,
      alumnoId
    };
    
    const resultado = await this.salonAlumnosService.removerAlumno(removerAlumnoDto, req.user.id);
    
    return {
      success: true,
      message: resultado.message,
      data: resultado.asignacion
    };
  }
}