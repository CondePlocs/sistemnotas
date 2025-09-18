import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { DirectorService } from './director.service';
import { CreateDirectorDto } from './dto/create-director.dto';

@Controller('api/directores')
export class DirectorController {
  constructor(private readonly directorService: DirectorService) {}

  @Post()
  async crearDirector(@Body() createDirectorDto: CreateDirectorDto) {
    return this.directorService.crearDirector(createDirectorDto);
  }

  @Get()
  async obtenerDirectores() {
    return this.directorService.obtenerDirectores();
  }

  @Get(':id')
  async obtenerDirector(@Param('id', ParseIntPipe) id: number) {
    return this.directorService.obtenerDirector(id);
  }
}
