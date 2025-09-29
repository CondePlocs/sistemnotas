import { Module } from '@nestjs/common';
import { PeriodoAcademicoController } from './periodo-academico.controller';
import { PeriodoAcademicoService } from './periodo-academico.service';
import { PrismaModule } from '../../providers/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PeriodoAcademicoController],
  providers: [PeriodoAcademicoService],
  exports: [PeriodoAcademicoService]
})
export class PeriodoAcademicoModule {}
