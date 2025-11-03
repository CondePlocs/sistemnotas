import { Module } from '@nestjs/common';
import { ApoderadoController } from './apoderado.controller';
import { ApoderadoService } from './apoderado.service';
import { PrismaService } from '../../providers/prisma.service';
import { RegistroNotaModule } from '../registro-nota/registro-nota.module';
import { IaModule } from '../ia/ia.module';

@Module({
  imports: [RegistroNotaModule, IaModule],
  controllers: [ApoderadoController],
  providers: [ApoderadoService, PrismaService],
  exports: [ApoderadoService],
})
export class ApoderadoModule {}
