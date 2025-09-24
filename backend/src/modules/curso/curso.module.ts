import { Module } from '@nestjs/common';
import { CursoController } from './curso.controller';
import { CursoService } from './curso.service';
import { PrismaModule } from '../../providers/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CursoController],
  providers: [CursoService],
  exports: [CursoService]
})
export class CursoModule {}
