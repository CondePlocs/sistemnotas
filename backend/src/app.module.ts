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
import { AlumnoModule } from './modules/alumno/alumno.module';
import { CursoModule } from './modules/curso/curso.module';
import { PeriodoAcademicoModule } from './modules/periodo-academico/periodo-academico.module';
import { ProfesorAsignacionModule } from './modules/profesor-asignacion/profesor-asignacion.module';
import { EvaluacionModule } from './modules/evaluacion/evaluacion.module';
import { RegistroNotaModule } from './modules/registro-nota/registro-nota.module';
import { IaModule } from './modules/ia/ia.module';
import { EstadisticasModule } from './modules/estadisticas/estadisticas.module';
import { PrismaModule } from './providers/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule, 
    OwnerModule, 
    UbicacionModule, 
    ColegioModule, 
    DirectorModule,
    ProfesorModule,
    ApoderadoModule,
    AdministrativoModule,
    PermisosModule,
    SalonModule,
    AlumnoModule,
    CursoModule,
    PeriodoAcademicoModule,
    ProfesorAsignacionModule,
    EvaluacionModule,
    RegistroNotaModule,
    IaModule,
    EstadisticasModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}