import { Controller, Get, Post, Body, Param, UseGuards, ParseIntPipe, Request } from '@nestjs/common';
import { ColegioService } from './colegio.service';
import { CreateColegioDto } from './dto/create-colegio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/colegios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ColegioController {
  constructor(private readonly colegioService: ColegioService) {}

  @Post()
  @Roles('OWNER')
  async crearColegio(@Body() createColegioDto: CreateColegioDto) {
    return this.colegioService.crearColegio(createColegioDto);
  }

  @Get()
  @Roles('OWNER')
  async obtenerColegios() {
    return this.colegioService.obtenerColegios();
  }

  // Endpoint para obtener colegios sin director asignado (ANTES del :id)
  @Get('sin-director')
  @Roles('OWNER')
  async obtenerColegiosSinDirector() {
    return this.colegioService.obtenerColegiosSinDirector();
  }

  // Endpoint para directores - Obtener niveles de SU colegio (ANTES del :id)
  @Get('mi-colegio/niveles')
  @Roles('DIRECTOR')
  async obtenerNivelesMiColegio(@Request() req: any) {
    return this.colegioService.obtenerNivelesPorDirector(req.user.id);
  }

  @Get(':id')
  @Roles('OWNER')
  async obtenerColegio(@Param('id', ParseIntPipe) id: number) {
    return this.colegioService.obtenerColegio(id);
  }
}
