import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  ValidationPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { IaService } from './ia.service';
import { EstimacionNotaDto } from './dto/estimacion-nota.dto';
import { EstimacionRespuesta } from './types/ia.types';

@ApiTags('IA - Estimación de Notas')
@Controller('ia')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class IaController {
  private readonly logger = new Logger(IaController.name);

  constructor(private readonly iaService: IaService) {}

  @Post('estimar-nota')
  @HttpCode(HttpStatus.OK)
  @Roles('PROFESOR', 'DIRECTOR', 'ADMINISTRATIVO')
  @ApiOperation({
    summary: 'Estimar nota futura de un alumno',
    description: 'Utiliza IA (regresión lineal) para predecir la nota de un alumno en una competencia específica.'
  })
  @ApiBody({ type: EstimacionNotaDto })
  @ApiResponse({
    status: 200,
    description: 'Estimación realizada exitosamente'
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  @ApiResponse({
    status: 404,
    description: 'Alumno o competencia no encontrados'
  })
  async estimarNota(
    @Body(new ValidationPipe({ 
      whitelist: true, 
      forbidNonWhitelisted: true,
      transform: true 
    })) dto: EstimacionNotaDto
  ): Promise<EstimacionRespuesta> {
    this.logger.log(`Solicitud de estimación recibida: ${JSON.stringify(dto)}`);
    
    const resultado = await this.iaService.estimarNota(dto);
    
    this.logger.log(`Estimación completada para alumno ${dto.alumnoId}`);
    
    return resultado;
  }
}
