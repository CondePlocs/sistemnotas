import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UbicacionService } from './ubicacion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/ubicacion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UbicacionController {
  constructor(private readonly ubicacionService: UbicacionService) {}

  @Get('dres')
  @Roles('OWNER')
  async obtenerDres() {
    return this.ubicacionService.obtenerDres();
  }

  @Get('ugeles/by-dre/:dreId')
  @Roles('OWNER')
  async obtenerUgelesPorDre(@Param('dreId', ParseIntPipe) dreId: number) {
    return this.ubicacionService.obtenerUgelesPorDre(dreId);
  }

  @Get('ugeles')
  @Roles('OWNER')
  async obtenerUgeles() {
    return this.ubicacionService.obtenerUgeles();
  }

  @Get('niveles')
  @Roles('OWNER', 'DIRECTOR', 'ADMINISTRATIVO')
  async obtenerNiveles() {
    return this.ubicacionService.obtenerNiveles();
  }
}
