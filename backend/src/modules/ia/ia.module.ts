import { Module } from '@nestjs/common';
import { IaController } from './ia.controller';
import { IaService } from './ia.service';
import { PrismaModule } from '../../providers/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IaController],
  providers: [IaService],
  exports: [IaService]
})
export class IaModule {}
