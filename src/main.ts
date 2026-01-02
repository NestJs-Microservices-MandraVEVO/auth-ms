import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config/envs';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import mongoose from 'mongoose';

async function bootstrap() {

  const logger = new Logger('Auth-main');
  logger.log(`NATS Servers: ${envs.natsServers}`);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>( 
  AppModule,{
    transport: Transport.NATS,
    options: {
      servers: envs.natsServers
    }
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  mongoose.connection.on('connected', () => {
  console.log('🟢 MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
  console.error('🔴 MongoDB connection error:', err);
  });

  await app.listen();
  logger.log(`Auth-Microservice running on port ${envs.port}`);
}
bootstrap();
