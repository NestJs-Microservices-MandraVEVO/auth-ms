import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // 🌱 Variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 🗄️ MongoDB
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // Opción 1: Construir URI desde variables separadas (RECOMENDADO para Docker)
        const user = config.get<string>('MONGO_USER');
        const password = config.get<string>('MONGO_PASSWORD');
        const dbName = config.get<string>('MONGO_DB_NAME');
        const host = config.get<string>('MONGO_HOST');
        const uri = `mongodb://${user}:${password}@${host}:27017/${dbName}?authSource=admin`;
        
        // Opción 2: Usar URI completa (para conexiones externas - comentado)
        // const uri = config.get<string>('MONGO_URI');
        
        return { uri };
      },
    }),

    // 🔐 Auth
    AuthModule,
  ],
})
export class AppModule {}
