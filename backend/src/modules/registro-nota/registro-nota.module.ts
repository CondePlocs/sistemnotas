import { Module } from '@nestjs/common';
import { RegistroNotaController } from './registro-nota.controller';
import { RegistroNotaService } from './registro-nota.service';
import { NotaCalculoService } from './services/nota-calculo.service';
import { PrismaModule } from '../../providers/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RegistroNotaController],
  providers: [
    RegistroNotaService,
    NotaCalculoService
  ],
  exports: [
    RegistroNotaService,
    NotaCalculoService
  ]
})
export class RegistroNotaModule {}
