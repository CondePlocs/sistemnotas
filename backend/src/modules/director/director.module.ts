import { Module } from '@nestjs/common';
import { DirectorController } from './director.controller';
import { DirectorService } from './director.service';
import { PrismaService } from '../../providers/prisma.service';

@Module({
  controllers: [DirectorController],
  providers: [DirectorService, PrismaService],
  exports: [DirectorService],
})
export class DirectorModule {}
