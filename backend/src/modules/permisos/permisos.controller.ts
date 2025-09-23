import { Controller, Get, Put, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { BatchUpdatePermisosDto } from './dto/batch-update-permisos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/permisos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  @Put('batch')
  @Roles('DIRECTOR')
  async actualizarPermisos(@Body() batchUpdateDto: BatchUpdatePermisosDto, @Req() request: any) {
    const directorUserId = request.user.id;
    return this.permisosService.actualizarPermisos(batchUpdateDto, directorUserId);
  }

  @Get()
  @Roles('DIRECTOR')
  async obtenerPermisos(@Req() request: any) {
    const directorUserId = request.user.id;
    return this.permisosService.obtenerPermisos(directorUserId);
  }

  @Get('administrativo/:id')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async obtenerPermisosAdministrativo(@Param('id', ParseIntPipe) administrativoId: number) {
    return this.permisosService.obtenerPermisosAdministrativo(administrativoId);
  }

  @Get('verificar/:administrativoId/:tipo')
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  async verificarPermiso(
    @Param('administrativoId', ParseIntPipe) administrativoId: number,
    @Param('tipo') tipo: 'profesores' | 'apoderados' | 'administrativos' | 'alumnos'
  ) {
    const tienePermiso = await this.permisosService.verificarPermiso(administrativoId, tipo);
    return { tienePermiso };
  }
}
