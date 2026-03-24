import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Interceptor global de logging
  app.useGlobalInterceptors(new LoggingInterceptor());

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
      } else if (origin === 'https://baderna-fc.firebaseapp.com') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  const porta = process.env.PORT || 3000;
  await app.listen(porta);

  const logger = new Logger('Bootstrap');
  logger.log(`Aplicação rodando na porta ${porta}`);
}
bootstrap();
