import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Origem(ns) do front-end permitidas (separadas por vírgula)
  app.enableCors({
    origin: (process.env.FRONTEND_URL ?? 'http://localhost:3000').split(','),
  });
  await app.listen(process.env.PORT ?? 3333);
}
await bootstrap();
