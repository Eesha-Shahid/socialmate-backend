import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';;

async function bootstrap() {
  const app = await NestFactory.create(AppModule , { cors: ({origin: true, credentials: true}) });
  app.use(session({ secret: 'keyboard cat', key: 'sid', cookie: { secure: false }}))
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(4000);
}
bootstrap();
