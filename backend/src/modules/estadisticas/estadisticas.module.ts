import { Module } from '@nestjs/common';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';
import { PrismaService } from '../../providers/prisma.service';

@Module({
  controllers: [EstadisticasController],
  providers: [EstadisticasService, PrismaService],
  exports: [EstadisticasService], // Exportar para uso en otros módulos si es necesario
})
export class EstadisticasModule {}
