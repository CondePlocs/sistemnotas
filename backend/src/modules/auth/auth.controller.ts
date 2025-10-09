import { Controller, Post, Body, Res, HttpCode, HttpStatus, UseGuards, Get, Req, UnauthorizedException, Put, Param, ParseIntPipe } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import type { LoginDto } from './dto/login.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);
    
    // Configurar cookie httpOnly con el token
    response.cookie('access_token', result.access_token, {
      httpOnly: true,        // No accesible desde JavaScript
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'strict',    // Protección CSRF
      maxAge: 8 * 60 * 60 * 1000, // 8 horas en milisegundos
    });

    // Retornar respuesta sin el token (ya está en la cookie)
    const { access_token, ...responseWithoutToken } = result;
    return responseWithoutToken;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: Response) {
    // Eliminar cookie
    response.clearCookie('access_token');
    
    return {
      success: true,
      message: 'Logout exitoso',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() request: Request) {
    return {
      success: true,
      user: request.user,
    };
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  async checkAuth() {
    return {
      success: true,
      message: 'Usuario autenticado',
    };
  }

  @Post('verify-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyPassword(
    @Body() body: { password: string },
    @Req() request: Request,
  ) {
    const user: any = request.user;
    const isValid = await this.authService.verifyPassword(user.id, body.password);
    
    if (!isValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    return {
      success: true,
      message: 'Contraseña correcta',
    };
  }

  @Put('usuarios/:id/estado')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DIRECTOR', 'ADMINISTRATIVO')
  @HttpCode(HttpStatus.OK)
  async cambiarEstadoUsuario(
    @Param('id', ParseIntPipe) userId: number,
    @Body() body: { estado: 'activo' | 'inactivo' },
    @Req() request: Request,
  ) {
    const currentUser: any = request.user;
    const result = await this.authService.cambiarEstadoUsuario(userId, body.estado, currentUser.id);
    
    return {
      success: true,
      message: `Usuario ${body.estado === 'activo' ? 'activado' : 'desactivado'} exitosamente`,
      usuario: result
    };
  }
}
