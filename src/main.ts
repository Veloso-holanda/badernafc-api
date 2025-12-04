import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar ValidationPipe global
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  // Configurar CORS
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Permitir localhost para desenvolvimento
      if (!origin || origin.startsWith('http://localhost')) {
        callback(null, true);
      } 
      // URLs do Firebase Hosting (quando deployar)
      else if (origin === 'https://baderna-fc.web.app') {
        callback(null, true);
      } 
      else if (origin === 'https://baderna-fc.firebaseapp.com') {
        callback(null, true);
      } 
      else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  await app.listen(3000);

}
bootstrap();