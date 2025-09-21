import { Module } from '@nestjs/common';
import { SalonController } from './salon.controller';
import { SalonService } from './salon.service';
import { PrismaService } from '../../providers/prisma.service';

@Module({
  controllers: [SalonController],
  providers: [SalonService, PrismaService],
  exports: [SalonService],
})
export class SalonModule {}