import { Controller, Get, Post, Put, Patch, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { DirectorService } from './director.service';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/directores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DirectorController {
  constructor(private readonly directorService: DirectorService) {}

  @Post()
  @Roles('OWNER')
  async crearDirector(@Body() createDirectorDto: CreateDirectorDto) {
    return this.directorService.crearDirector(createDirectorDto);
  }

  @Get()
  @Roles('OWNER')
  async obtenerDirectores() {
    return this.directorService.obtenerDirectores();
  }

  @Get(':id')
  @Roles('OWNER')
  async obtenerDirector(@Param('id', ParseIntPipe) id: number) {
    return this.directorService.obtenerDirector(id);
  }

  @Put(':id')
  @Roles('OWNER')
  async actualizarDirector(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDirectorDto: UpdateDirectorDto
  ) {
    return this.directorService.actualizarDirector(id, updateDirectorDto);
  }

  @Patch(':id/desactivar')
  @Roles('OWNER')
  async desactivarDirector(@Param('id', ParseIntPipe) id: number) {
    return this.directorService.desactivarDirector(id);
  }

  @Patch(':id/activar')
  @Roles('OWNER')
  async activarDirector(@Param('id', ParseIntPipe) id: number) {
    return this.directorService.activarDirector(id);
  }
}
