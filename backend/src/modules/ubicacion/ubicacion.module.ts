import { Module } from '@nestjs/common';
import { UbicacionController } from './ubicacion.controller';
import { UbicacionService } from './ubicacion.service';
import { PrismaService } from '../../providers/prisma.service';

@Module({
  controllers: [UbicacionController],
  providers: [UbicacionService, PrismaService],
  exports: [UbicacionService],
})
export class UbicacionModule {}
