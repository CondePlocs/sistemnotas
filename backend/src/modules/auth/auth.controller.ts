import { Controller, Post, Body, Res, HttpCode, HttpStatus, UseGuards, Get, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { LoginDto } from './dto/login.dto';

@Controller('auth')
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
}
