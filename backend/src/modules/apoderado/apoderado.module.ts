import { Module } from '@nestjs/common';
import { ApoderadoController } from './apoderado.controller';
import { ApoderadoService } from './apoderado.service';
import { PrismaService } from '../../providers/prisma.service';

@Module({
  controllers: [ApoderadoController],
  providers: [ApoderadoService, PrismaService],
  exports: [ApoderadoService],
})
export class ApoderadoModule {}
