import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';

export async function createApp() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const config = app.get(ConfigService);
  app.enableCors({
    origin: config.get<string>('FRONTEND_URL', 'http://localhost:3000'),
    credentials: true,
  });
  return app;
}

async function bootstrap() {
  const app = await createApp();
  const config = app.get(ConfigService);
  await app.listen(config.get<number>('PORT', 4000));
}
if (!process.env.VERCEL) {
  void bootstrap();
}
