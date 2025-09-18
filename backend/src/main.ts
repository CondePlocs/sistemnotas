import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { corsConfig } from './config/cors.config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Middleware para cookies
  app.use(cookieParser());
  
  // Configurar CORS
  app.enableCors(corsConfig);
  
  await app.listen(process.env.PORT ?? 3001);
  
  console.log(`🚀 Backend corriendo en: http://localhost:${process.env.PORT ?? 3001}`);
}
bootstrap();
