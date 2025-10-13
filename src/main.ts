import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ZodValidationPipe } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    httpsOptions: {
      key: process.env.HTTPS_KEY,
      cert: process.env.HTTPS_CERT,
    },
  });

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true,
  });
  app.useGlobalPipes(new ZodValidationPipe());

  // api docs
  const config = new DocumentBuilder().setTitle('Shiden API').build();
  const document = SwaggerModule.createDocument(app, config);
  app.use('/reference', apiReference({ content: document, layout: 'classic' }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
