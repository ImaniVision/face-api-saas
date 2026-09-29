import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { ApiKeysModule } from './api-keys/api-keys.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    AuthModule,
    ApiKeysModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
