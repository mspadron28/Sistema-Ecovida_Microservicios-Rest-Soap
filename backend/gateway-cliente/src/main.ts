import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';
import {RpcCustomExceptionFilter} from './common';
import * as cors from 'cors';
async function bootstrap() {

  const logger = new Logger('Main-Gateway')
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new RpcCustomExceptionFilter())
  // Configurar CORS
  app.use(cors({
    origin: 'http://localhost:3001', // Reemplaza con el dominio de tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }));
  await app.listen(envs.port);
 
  logger.log(`Gateway running on port ${envs.port}`)
}
bootstrap();
