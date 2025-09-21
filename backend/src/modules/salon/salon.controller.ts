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
import { CreateSalonDto } from './dto/create-salon.dto';
import { CreateSalonesLoteDto } from './dto/create-salones-lote.dto';
import { UpdateSalonDto } from './dto/update-salon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/salones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalonController {
  constructor(private readonly salonService: SalonService) {}

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
}