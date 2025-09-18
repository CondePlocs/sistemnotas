import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { OwnerModule } from './modules/owner/owner.module';
import { UbicacionModule } from './modules/ubicacion/ubicacion.module';
import { ColegioModule } from './modules/colegio/colegio.module';
import { DirectorModule } from './modules/director/director.module';

@Module({
  imports: [AuthModule, OwnerModule, UbicacionModule, ColegioModule, DirectorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
