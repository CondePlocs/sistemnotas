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
  @Roles('DIRECTOR')
  async crearAdministrativo(@Body() createAdministrativoDto: CreateAdministrativoDto, @Req() request: any) {
    const directorUserId = request.user.userId;
    return this.administrativoService.crearAdministrativo(createAdministrativoDto, directorUserId);
  }

  @Get()
  @Roles('DIRECTOR')
  async obtenerAdministrativos(@Req() request: any) {
    const directorUserId = request.user.userId;
    return this.administrativoService.obtenerAdministrativos(directorUserId);
  }

  @Get(':id')
  @Roles('DIRECTOR')
  async obtenerAdministrativo(@Param('id', ParseIntPipe) id: number, @Req() request: any) {
    const directorUserId = request.user.userId;
    return this.administrativoService.obtenerAdministrativo(id, directorUserId);
  }
}
