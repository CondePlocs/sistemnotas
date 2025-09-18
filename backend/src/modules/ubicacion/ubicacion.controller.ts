import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UbicacionService } from './ubicacion.service';

@Controller('api/ubicacion')
export class UbicacionController {
  constructor(private readonly ubicacionService: UbicacionService) {}

  @Get('dres')
  async obtenerDres() {
    return this.ubicacionService.obtenerDres();
  }

  @Get('ugeles/by-dre/:dreId')
  async obtenerUgelesPorDre(@Param('dreId', ParseIntPipe) dreId: number) {
    return this.ubicacionService.obtenerUgelesPorDre(dreId);
  }

  @Get('ugeles')
  async obtenerUgeles() {
    return this.ubicacionService.obtenerUgeles();
  }
}
