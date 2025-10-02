import { Module } from '@nestjs/common';
import { EvaluacionService } from './evaluacion.service';
import { EvaluacionController } from './evaluacion.controller';
import { PrismaModule } from '../../providers/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EvaluacionController],
  providers: [EvaluacionService],
  exports: [EvaluacionService]
})
export class EvaluacionModule {}
