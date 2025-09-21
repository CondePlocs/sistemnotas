import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { OwnerModule } from './modules/owner/owner.module';
import { UbicacionModule } from './modules/ubicacion/ubicacion.module';
import { ColegioModule } from './modules/colegio/colegio.module';
import { DirectorModule } from './modules/director/director.module';
import { ProfesorModule } from './modules/profesor/profesor.module';
import { ApoderadoModule } from './modules/apoderado/apoderado.module';
import { AdministrativoModule } from './modules/administrativo/administrativo.module';
import { PermisosModule } from './modules/permisos/permisos.module';
import { SalonModule } from './modules/salon/salon.module';

@Module({
  imports: [
    AuthModule, 
    OwnerModule, 
    UbicacionModule, 
    ColegioModule, 
    DirectorModule,
    ProfesorModule,
    ApoderadoModule,
    AdministrativoModule,
    PermisosModule,
    SalonModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}