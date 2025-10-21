import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { corsConfig } from './config/cors.config';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn']
  });
  
  // Middleware para cookies
  app.use(cookieParser());
  
  // Configurar CORS
  app.enableCors(corsConfig);
  
  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Sistema de Notas - API')
    .setDescription('API para el sistema de gestión educativa con módulo de IA para estimación de notas')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Autenticación y autorización')
    .addTag('IA - Estimación de Notas', 'Inteligencia artificial para predicción de notas')
    .addTag('Alumnos', 'Gestión de estudiantes')
    .addTag('Profesores', 'Gestión de docentes')
    .addTag('Evaluaciones', 'Sistema de evaluaciones')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(process.env.PORT ?? 3001);
  
  console.log(`🚀 Backend corriendo en: http://localhost:${process.env.PORT ?? 3001}`);
}
bootstrap();
