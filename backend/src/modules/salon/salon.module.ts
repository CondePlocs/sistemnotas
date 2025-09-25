import { Module } from '@nestjs/common';
import { SalonController } from './salon.controller';
import { SalonService } from './salon.service';
import { SalonAlumnosService } from './salon-alumnos.service';
import { SalonCursosService } from './salon-cursos.service';
import { PrismaService } from '../../providers/prisma.service';

@Module({
  controllers: [SalonController],
  providers: [SalonService, SalonAlumnosService, SalonCursosService, PrismaService],
  exports: [SalonService, SalonCursosService],
})
export class SalonModule {}