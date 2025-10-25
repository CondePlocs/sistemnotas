import { Module } from '@nestjs/common';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { PdfGeneratorService } from './generators/pdf-generator.service';
import { ExcelGeneratorService } from './generators/excel-generator.service';
import { PrismaModule } from '../../providers/prisma.module';
import { RegistroNotaModule } from '../registro-nota/registro-nota.module';

@Module({
  imports: [PrismaModule, RegistroNotaModule],
  controllers: [ReportesController],
  providers: [
    ReportesService,
    PdfGeneratorService,
    ExcelGeneratorService,
  ],
  exports: [
    ReportesService,
    PdfGeneratorService,
    ExcelGeneratorService,
  ],
})
export class ReportesModule {}
