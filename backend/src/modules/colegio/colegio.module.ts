import { Module } from '@nestjs/common';
import { ColegioController } from './colegio.controller';
import { ColegioService } from './colegio.service';
import { PrismaService } from '../../providers/prisma.service';

@Module({
  controllers: [ColegioController],
  providers: [ColegioService, PrismaService],
  exports: [ColegioService],
})
export class ColegioModule {}
