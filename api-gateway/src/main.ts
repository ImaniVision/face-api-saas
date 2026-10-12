import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors({
    origin: app.get(ConfigService).getOrThrow<string>('PORTAL_ORIGIN'),
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
