import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Req, ForbiddenException, Put } from '@nestjs/common';
import { ProfesorService } from './profesor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateProfesorDto } from './dto/create-profesor.dto';
import { UpdateProfesorDto } from './dto/update-profesor.dto';

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

  @Get('by-user/:userId')
  @Roles('PROFESOR', 'DIRECTOR')
  async obtenerProfesorPorUsuario(@Param('userId', ParseIntPipe) userId: number, @Req() request: any) {
    // Si es profesor, solo puede ver su propia información
    if (request.user.roles?.some((r: any) => r.rol === 'PROFESOR')) {
      if (request.user.id !== userId) {
        throw new ForbiddenException('Solo puedes ver tu propia información');
      }
    }
    return this.profesorService.obtenerProfesorPorUsuario(userId);
  }

  @Get(':id')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async obtenerProfesor(@Param('id', ParseIntPipe) id: number, @Req() request: any) {
    const directorUserId = request.user.id;
    return this.profesorService.obtenerProfesor(id, directorUserId);
  }

  @Put(':id')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async actualizarProfesor(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfesorDto: UpdateProfesorDto,
    @Req() request: any
  ) {
    const userId = request.user.id;
    return this.profesorService.actualizarProfesor(id, updateProfesorDto, userId);
  }
}
