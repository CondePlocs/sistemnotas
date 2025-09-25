import { Module } from '@nestjs/common';
import { AlumnoController } from './alumno.controller';
import { AlumnoService } from './alumno.service';
import { SalonModule } from '../salon/salon.module';

@Module({
  imports: [SalonModule],
  controllers: [AlumnoController],
  providers: [AlumnoService],
  exports: [AlumnoService],
})
export class AlumnoModule {}
