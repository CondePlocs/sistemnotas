import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ApoderadoService } from './apoderado.service';
import { CreateApoderadoDto } from './dto/create-apoderado.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/apoderados')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApoderadoController {
  constructor(private readonly apoderadoService: ApoderadoService) {}

  @Post()
  @Roles('DIRECTOR')
  async crearApoderado(@Body() createApoderadoDto: CreateApoderadoDto, @Req() request: any) {
    const directorUserId = request.user.userId;
    return this.apoderadoService.crearApoderado(createApoderadoDto, directorUserId);
  }

  @Get()
  @Roles('DIRECTOR')
  async obtenerApoderados(@Req() request: any) {
    const directorUserId = request.user.userId;
    return this.apoderadoService.obtenerApoderados(directorUserId);
  }

  @Get(':id')
  @Roles('DIRECTOR')
  async obtenerApoderado(@Param('id', ParseIntPipe) id: number, @Req() request: any) {
    const directorUserId = request.user.userId;
    return this.apoderadoService.obtenerApoderado(id, directorUserId);
  }
}
