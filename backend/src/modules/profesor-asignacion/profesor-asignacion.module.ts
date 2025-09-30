import { Module } from '@nestjs/common';
import { ProfesorAsignacionController } from './profesor-asignacion.controller';
import { ProfesorAsignacionService } from './profesor-asignacion.service';
import { PrismaModule } from '../../providers/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProfesorAsignacionController],
  providers: [ProfesorAsignacionService],
  exports: [ProfesorAsignacionService]
})
export class ProfesorAsignacionModule {}
