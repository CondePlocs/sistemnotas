import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ProfesorService } from './profesor.service';
import { CreateProfesorDto } from './dto/create-profesor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/profesores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProfesorController {
  constructor(private readonly profesorService: ProfesorService) {}

  @Post()
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async crearProfesor(@Body() createProfesorDto: CreateProfesorDto, @Req() request: any) {
    const userId = request.user.id;
    return this.profesorService.crearProfesor(createProfesorDto, userId);
  }

  @Get()
  @Roles('DIRECTOR')
  async obtenerProfesores(@Req() request: any) {
    const directorUserId = request.user.id;
    return this.profesorService.obtenerProfesores(directorUserId);
  }

  @Get(':id')
  @Roles('DIRECTOR')
  async obtenerProfesor(@Param('id', ParseIntPipe) id: number, @Req() request: any) {
    const directorUserId = request.user.id;
    return this.profesorService.obtenerProfesor(id, directorUserId);
  }
}
