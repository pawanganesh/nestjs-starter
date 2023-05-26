import 'reflect-metadata';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NODE_ENV, PORT } from './constant';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { snapshot: true });

  // Swagger docs
  if (NODE_ENV !== 'production') {
    const options = new DocumentBuilder()
      .setTitle('NESTJS STARTER')
      .setDescription('API docs')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(PORT);
}
bootstrap();
