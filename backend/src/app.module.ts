import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { OwnerModule } from './modules/owner/owner.module';

@Module({
  imports: [AuthModule, OwnerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
