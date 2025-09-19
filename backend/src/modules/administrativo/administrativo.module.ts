import { Module } from '@nestjs/common';
import { AdministrativoController } from './administrativo.controller';
import { AdministrativoService } from './administrativo.service';
import { PrismaService } from '../../providers/prisma.service';

@Module({
  controllers: [AdministrativoController],
  providers: [AdministrativoService, PrismaService],
  exports: [AdministrativoService],
})
export class AdministrativoModule {}
