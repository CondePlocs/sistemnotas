import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { AdministrativoService } from './administrativo.service';
import { CreateAdministrativoDto } from './dto/create-administrativo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/administrativos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdministrativoController {
  constructor(private readonly administrativoService: AdministrativoService) {}

  @Post()
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async crearAdministrativo(@Body() createAdministrativoDto: CreateAdministrativoDto, @Req() request: any) {
    const userId = request.user.id;
    return this.administrativoService.crearAdministrativo(createAdministrativoDto, userId);
  }

  @Get()
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async obtenerAdministrativos(@Req() request: any) {
    const userId = request.user.id;
    const userRoles = request.user.roles || [];
    const isDirector = userRoles.some((role: any) => role.rol === 'DIRECTOR');
    
    if (isDirector) {
      // Si es director, obtener todos los administrativos de su colegio
      return this.administrativoService.obtenerAdministrativos(userId);
    } else {
      // Si es administrativo, obtener solo su propia información
      return this.administrativoService.obtenerAdministrativoPropio(userId);
    }
  }

  @Get(':id')
  @Roles('DIRECTOR')
  async obtenerAdministrativo(@Param('id', ParseIntPipe) id: number, @Req() request: any) {
    const directorUserId = request.user.id;
    return this.administrativoService.obtenerAdministrativo(id, directorUserId);
  }
}
