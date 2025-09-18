import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ColegioService } from './colegio.service';
import { CreateColegioDto } from './dto/create-colegio.dto';

@Controller('api/colegios')
export class ColegioController {
  constructor(private readonly colegioService: ColegioService) {}

  @Post()
  async crearColegio(@Body() createColegioDto: CreateColegioDto) {
    return this.colegioService.crearColegio(createColegioDto);
  }

  @Get()
  async obtenerColegios() {
    return this.colegioService.obtenerColegios();
  }

  @Get(':id')
  async obtenerColegio(@Param('id', ParseIntPipe) id: number) {
    return this.colegioService.obtenerColegio(id);
  }
}
